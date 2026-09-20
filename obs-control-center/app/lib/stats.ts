import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { DatabaseSync } from "node:sqlite";
import WebSocket from "ws";

/** The subset of each Talon command record that the counters care about. */
interface TalonCommandRecord {
	timestamp?: string;
	source?: string;
	sound?: unknown;
}

const TALON_HISTORY =
	"/Users/trilliumsmith/.talon/recordings/command_history.jsonl";
const WHISPER_DB =
	"/Users/trilliumsmith/Library/Application Support/ru.starmel.OpenSuperWhisper/recordings.sqlite";
const OBS_WEBSOCKET_CONFIG =
	"/Users/trilliumsmith/Library/Application Support/obs-studio/plugin_config/obs-websocket/config.json";

export interface Stats {
	scope: "stream" | "lifetime";
	since: string | null;
	streamActive: boolean;
	voiceCommands: number;
	repeatCommands: number;
	reverseCommands: number;
	parrotNoises: number;
	transcriptionSeconds: number;
	transcriptions: number;
}

/** Minimal shapes for the obs-websocket frames we actually read. */
interface ObsMessage {
	op: number;
	d?: {
		authentication?: { challenge: string; salt: string };
		responseData?: { outputActive?: boolean; outputDuration?: number };
	};
}

/**
 * Ask OBS when the current stream started, so the counters can show this
 * session rather than all time. Returns null when OBS is unreachable or idle.
 */
export async function getStreamStart(): Promise<Date | null> {
	let cfg: { server_password?: string; server_port?: number };
	try {
		cfg = JSON.parse(await readFile(OBS_WEBSOCKET_CONFIG, "utf8"));
	} catch {
		return null;
	}

	const password = cfg.server_password ?? "";
	const port = cfg.server_port ?? 4455;

	return new Promise<Date | null>((resolve) => {
		let settled = false;
		const done = (value: Date | null) => {
			if (settled) return;
			settled = true;
			try {
				ws.close();
			} catch {}
			resolve(value);
		};

		const ws = new WebSocket(`ws://127.0.0.1:${port}`);
		const timer = setTimeout(() => done(null), 1500);

		const sha = (s: string) => createHash("sha256").update(s).digest("base64");

		ws.on("message", (raw: Buffer) => {
			let msg: ObsMessage;
			try {
				msg = JSON.parse(raw.toString()) as ObsMessage;
			} catch {
				return;
			}
			// op 0 = Hello (carries the auth challenge)
			if (msg.op === 0) {
				const auth = msg.d?.authentication;
				const identify: { rpcVersion: number; authentication?: string } = {
					rpcVersion: 1,
				};
				if (auth) {
					identify.authentication = sha(
						sha(password + auth.salt) + auth.challenge,
					);
				}
				ws.send(JSON.stringify({ op: 1, d: identify }));
				return;
			}
			// op 7 = RequestResponse
			if (msg.op === 7 && msg.d?.responseData) {
				const { outputActive, outputDuration } = msg.d.responseData;
				clearTimeout(timer);
				if (!outputActive) return done(null);
				done(new Date(Date.now() - Number(outputDuration ?? 0)));
			}
		});

		ws.on("open", () => {
			ws.send(
				JSON.stringify({
					op: 6,
					d: { requestType: "GetStreamStatus", requestId: "streamStatus" },
				}),
			);
		});
		ws.on("error", () => {
			clearTimeout(timer);
			done(null);
		});
		ws.on("close", () => {
			clearTimeout(timer);
			done(null);
		});
	});
}

/**
 * Talon writes one JSON object per command. `source` distinguishes how the
 * command was issued; a non-null `sound` means a non-speech noise triggered it.
 */
export async function countTalonCommands(since: Date | null) {
	const counts = {
		voiceCommands: 0,
		repeatCommands: 0,
		reverseCommands: 0,
		parrotNoises: 0,
	};

	const stream = createReadStream(TALON_HISTORY, { encoding: "utf8" });
	const lines = createInterface({
		input: stream,
		crlfDelay: Number.POSITIVE_INFINITY,
	});

	for await (const line of lines) {
		if (!line) continue;
		let rec: TalonCommandRecord;
		try {
			rec = JSON.parse(line) as TalonCommandRecord;
		} catch {
			continue;
		}

		if (since) {
			const ts = rec.timestamp ? new Date(rec.timestamp) : null;
			if (!ts || Number.isNaN(ts.getTime()) || ts < since) continue;
		}

		switch (rec.source) {
			case "voice":
				counts.voiceCommands++;
				break;
			case "repeat":
				counts.repeatCommands++;
				break;
			case "reverse":
				counts.reverseCommands++;
				break;
		}
		if (rec.sound) counts.parrotNoises++;
	}

	return counts;
}

/** OpenSuperWhisper stores one row per transcription, with a duration in seconds. */
export async function countTranscription(since: Date | null) {
	try {
		const db = new DatabaseSync(WHISPER_DB, { readOnly: true });
		try {
			const iso = since
				? since.toISOString().replace("T", " ").slice(0, 19)
				: null;
			const sql = iso
				? "SELECT COUNT(*) AS n, COALESCE(SUM(duration), 0) AS s FROM recordings WHERE timestamp >= ?"
				: "SELECT COUNT(*) AS n, COALESCE(SUM(duration), 0) AS s FROM recordings";
			const stmt = db.prepare(sql);
			interface CountRow {
				n?: number;
				s?: number;
			}
			const row = (iso ? stmt.get(iso) : stmt.get()) as CountRow | undefined;
			return {
				transcriptions: Number(row?.n ?? 0),
				transcriptionSeconds: Number(row?.s ?? 0),
			};
		} finally {
			db.close();
		}
	} catch {
		return { transcriptions: 0, transcriptionSeconds: 0 };
	}
}

export async function getStats(
	opts: { scope?: "stream" | "lifetime"; since?: Date } = {},
) {
	const streamStart = await getStreamStart();
	const scope: "stream" | "lifetime" =
		opts.scope ?? (opts.since || streamStart ? "stream" : "lifetime");
	const since = opts.since ?? (scope === "stream" ? streamStart : null);

	const [talon, whisper] = await Promise.all([
		countTalonCommands(since),
		countTranscription(since),
	]);

	return {
		scope,
		since: since ? since.toISOString() : null,
		streamActive: streamStart !== null,
		...talon,
		...whisper,
	} satisfies Stats;
}
