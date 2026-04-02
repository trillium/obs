import { open, stat, watch } from "node:fs/promises";

const HISTORY_FILE =
	"/Users/trilliumsmith/.talon/recordings/command_history.jsonl";
const DEFAULT_LIMIT = 50;

// v1 schema
interface CommandRecordV1 {
	version?: string;
	command: { trigger: string; rule: string | null; display: string };
	phrase: { words: string[]; text: string };
	opposite?: { exists: boolean; trigger: string | null; reversible: boolean };
	context: { app: { name: string } };
	timestamp: string;
	metadata: { success: boolean };
}

// v2 schema
interface CaptureEntry {
	phrase: string;
	value: string;
	name: string | null;
}

interface CommandEntry {
	phrase: string;
	rule: string | null;
	code: string | null;
	path: string | null;
	line: number | null;
	captures: CaptureEntry[];
}

interface CommandRecordV2 {
	version: string;
	action_type: "command";
	timestamp: string;
	phrase: string;
	words: { text: string; start: number | null; end: number | null }[];
	commands: CommandEntry[];
	source?: "voice" | "repeat" | "reverse";
	context: {
		app: { name: string; bundle?: string };
		window: { title?: string; id?: number };
		microphone: string;
		mode: string[];
		tags: string[];
		hostname?: string;
	};
	metadata: { success: boolean };
}

type CommandKind = "spoken" | "repeat" | "reverse";

interface CommandSummary {
	phrase: string;
	rule: string;
	app: string;
	timestamp: string;
	success: boolean;
	kind: CommandKind;
	commands: { phrase: string; rule: string }[];
}

function detectKindV2(data: CommandRecordV2): CommandKind {
	if (data.source === "voice") return "spoken";
	if (data.source === "repeat") return "repeat";
	if (data.source === "reverse") return "reverse";
	return "spoken";
}

function detectKindV1(data: CommandRecordV1): CommandKind {
	if (data.command?.rule !== null) return "spoken";
	if (data.opposite?.trigger === "reverse") return "reverse";
	return "repeat";
}

function parseCommand(line: string): CommandSummary | null {
	try {
		const raw = JSON.parse(line);
		const version = raw.version ?? "";

		if (version.startsWith("2.")) {
			const data = raw as CommandRecordV2;
			return {
				phrase: data.phrase ?? "",
				rule: data.commands?.[0]?.rule ?? data.commands?.[0]?.phrase ?? "",
				app: data.context?.app?.name ?? "",
				timestamp: data.timestamp ?? "",
				success: data.metadata?.success ?? false,
				kind: detectKindV2(data),
				commands: (data.commands ?? []).map((c) => ({
					phrase: c.phrase,
					rule: c.rule ?? c.phrase,
				})),
			};
		}

		// v1 fallback
		const data = raw as CommandRecordV1;
		return {
			phrase: data.phrase?.text ?? "",
			rule: data.command?.display ?? data.command?.rule ?? "",
			app: data.context?.app?.name ?? "",
			timestamp: data.timestamp ?? "",
			success: data.metadata?.success ?? false,
			kind: detectKindV1(data),
			commands: [
				{
					phrase: data.phrase?.text ?? "",
					rule: data.command?.display ?? "",
				},
			],
		};
	} catch {
		return null;
	}
}

/** Read the last N lines from a file without loading the whole thing */
async function tailLines(path: string, n: number): Promise<string[]> {
	const fh = await open(path, "r");
	try {
		const { size } = await fh.stat();
		const readSize = Math.min(size, 128 * 1024);
		const buf = Buffer.alloc(readSize);
		await fh.read(buf, 0, readSize, size - readSize);
		const lines = buf.toString("utf-8").trimEnd().split("\n");
		return lines.slice(-n);
	} finally {
		await fh.close();
	}
}

/** Read lines newer than a given timestamp */
async function linesSince(
	path: string,
	since: string,
): Promise<CommandSummary[]> {
	const fh = await open(path, "r");
	try {
		const { size } = await fh.stat();
		const readSize = Math.min(size, 128 * 1024);
		const buf = Buffer.alloc(readSize);
		await fh.read(buf, 0, readSize, size - readSize);
		const lines = buf.toString("utf-8").trimEnd().split("\n");

		const results: CommandSummary[] = [];
		for (let i = lines.length - 1; i >= 0; i--) {
			const cmd = parseCommand(lines[i]);
			if (!cmd) continue;
			if (cmd.timestamp <= since) break;
			results.push(cmd);
		}
		return results;
	} finally {
		await fh.close();
	}
}

function sseEvent(data: string, id?: string): string {
	let msg = `data: ${data}\n`;
	if (id) msg = `id: ${id}\n${msg}`;
	return `${msg}\n`;
}

export async function GET(request: Request) {
	const url = new URL(request.url);
	const limit = Number(url.searchParams.get("limit")) || DEFAULT_LIMIT;
	const isSSE = request.headers.get("accept") === "text/event-stream";

	if (!isSSE) {
		try {
			const lines = await tailLines(HISTORY_FILE, limit);
			const results = lines
				.map(parseCommand)
				.filter((c): c is CommandSummary => c !== null)
				.reverse();
			return Response.json(results);
		} catch {
			return Response.json(
				{ error: "Failed to read command history" },
				{ status: 500 },
			);
		}
	}

	// SSE mode
	const lastEventId = request.headers.get("last-event-id");
	const encoder = new TextEncoder();
	let lastSize = 0;

	const readable = new ReadableStream({
		async start(controller) {
			try {
				if (lastEventId) {
					const missed = await linesSince(HISTORY_FILE, lastEventId);
					if (missed.length > 0) {
						controller.enqueue(
							encoder.encode(
								sseEvent(JSON.stringify(missed), missed[0].timestamp),
							),
						);
					}
				} else {
					const lines = await tailLines(HISTORY_FILE, limit);
					const results = lines
						.map(parseCommand)
						.filter((c): c is CommandSummary => c !== null)
						.reverse();
					const latestTs = results[0]?.timestamp;
					controller.enqueue(
						encoder.encode(sseEvent(JSON.stringify(results), latestTs)),
					);
				}
				lastSize = (await stat(HISTORY_FILE)).size;
			} catch {
				controller.close();
				return;
			}

			try {
				const watcher = watch(HISTORY_FILE);
				for await (const event of watcher) {
					if (event.eventType !== "change") continue;
					try {
						const { size } = await stat(HISTORY_FILE);
						if (size <= lastSize) continue;

						const fh = await open(HISTORY_FILE, "r");
						const newBytes = Buffer.alloc(size - lastSize);
						await fh.read(newBytes, 0, size - lastSize, lastSize);
						await fh.close();
						lastSize = size;

						const newLines = newBytes.toString("utf-8").trimEnd().split("\n");
						for (const line of newLines) {
							const cmd = parseCommand(line);
							if (cmd) {
								controller.enqueue(
									encoder.encode(sseEvent(JSON.stringify(cmd), cmd.timestamp)),
								);
							}
						}
					} catch {
						// file read error, skip
					}
				}
			} catch {
				controller.close();
			}
		},
	});

	return new Response(readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
