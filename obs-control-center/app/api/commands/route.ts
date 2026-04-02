import { open, stat, watch } from "node:fs/promises";

const HISTORY_FILE =
	"/Users/trilliumsmith/.talon/recordings/command_history.jsonl";
const DEFAULT_LIMIT = 50;

interface CommandRecord {
	command: { trigger: string; rule: string; display: string };
	phrase: { words: string[]; text: string };
	context: { app: { name: string } };
	timestamp: string;
	metadata: { success: boolean };
}

interface CommandSummary {
	display: string;
	phrase: string;
	app: string;
	timestamp: string;
	success: boolean;
}

function parseCommand(line: string): CommandSummary | null {
	try {
		const data: CommandRecord = JSON.parse(line);
		return {
			display: data.command?.display ?? "",
			phrase: data.phrase?.text ?? "",
			app: data.context?.app?.name ?? "",
			timestamp: data.timestamp ?? "",
			success: data.metadata?.success ?? false,
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
		// Walk backwards from newest, stop when we hit a known timestamp
		for (let i = lines.length - 1; i >= 0; i--) {
			const cmd = parseCommand(lines[i]);
			if (!cmd) continue;
			if (cmd.timestamp <= since) break;
			results.push(cmd);
		}
		return results; // newest first
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
			// Initial batch or catch-up after reconnect
			try {
				if (lastEventId) {
					// Reconnect: send only commands newer than last seen
					const missed = await linesSince(HISTORY_FILE, lastEventId);
					if (missed.length > 0) {
						controller.enqueue(
							encoder.encode(
								sseEvent(JSON.stringify(missed), missed[0].timestamp),
							),
						);
					}
				} else {
					// Fresh connect: send full batch
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

			// Watch for new commands
			try {
				const watcher = watch(HISTORY_FILE);
				for await (const event of watcher) {
					if (event.eventType !== "change") continue;
					try {
						const { size } = await stat(HISTORY_FILE);
						if (size <= lastSize) continue;

						// Read only the new bytes appended since last check
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
