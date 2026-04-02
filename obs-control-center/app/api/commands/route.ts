import { open, stat, watch } from "node:fs/promises";

const HISTORY_FILE =
	"/Users/trilliumsmith/.talon/recordings/command_history.jsonl";
const MAX_INITIAL = 50;

interface CommandRecord {
	command: { trigger: string; rule: string; display: string };
	phrase: { words: string[]; text: string };
	context: { app: { name: string } };
	timestamp: string;
	metadata: { success: boolean };
}

function parseCommand(line: string): string | null {
	try {
		const data: CommandRecord = JSON.parse(line);
		return JSON.stringify({
			display: data.command?.display ?? "",
			phrase: data.phrase?.text ?? "",
			app: data.context?.app?.name ?? "",
			timestamp: data.timestamp ?? "",
			success: data.metadata?.success ?? false,
		});
	} catch {
		return null;
	}
}

/** Read the last N lines from a file without loading the whole thing */
async function tailLines(path: string, n: number): Promise<string[]> {
	const fh = await open(path, "r");
	try {
		const { size } = await fh.stat();
		// Read last 64KB — plenty for 50 JSONL lines (~1.5KB each)
		const readSize = Math.min(size, 64 * 1024);
		const buf = Buffer.alloc(readSize);
		await fh.read(buf, 0, readSize, size - readSize);
		const lines = buf.toString("utf-8").trimEnd().split("\n");
		return lines.slice(-n);
	} finally {
		await fh.close();
	}
}

export async function GET(request: Request) {
	const stream = request.headers.get("accept") === "text/event-stream";

	if (!stream) {
		// Plain JSON response for non-SSE clients
		try {
			const lines = await tailLines(HISTORY_FILE, MAX_INITIAL);
			const results = lines
				.reverse()
				.map(parseCommand)
				.filter((c) => c !== null);
			return new Response(`[${results.join(",")}]`, {
				headers: { "Content-Type": "application/json" },
			});
		} catch {
			return Response.json(
				{ error: "Failed to read command history" },
				{ status: 500 },
			);
		}
	}

	// SSE: send initial batch then watch for changes
	const encoder = new TextEncoder();
	let lastSize = 0;

	const readable = new ReadableStream({
		async start(controller) {
			// Send initial batch
			try {
				const lines = await tailLines(HISTORY_FILE, MAX_INITIAL);
				const results = lines
					.reverse()
					.map(parseCommand)
					.filter((c) => c !== null);
				controller.enqueue(
					encoder.encode(`data: ${JSON.stringify(results)}\n\n`),
				);
				lastSize = (await stat(HISTORY_FILE)).size;
			} catch {
				controller.close();
				return;
			}

			// Watch for file changes
			try {
				const watcher = watch(HISTORY_FILE);
				for await (const event of watcher) {
					if (event.eventType !== "change") continue;
					try {
						const { size } = await stat(HISTORY_FILE);
						if (size <= lastSize) continue;

						// Read only the new bytes
						const fh = await open(HISTORY_FILE, "r");
						const newBytes = Buffer.alloc(size - lastSize);
						await fh.read(newBytes, 0, size - lastSize, lastSize);
						await fh.close();
						lastSize = size;

						const newLines = newBytes.toString("utf-8").trimEnd().split("\n");
						for (const line of newLines) {
							const cmd = parseCommand(line);
							if (cmd) {
								controller.enqueue(encoder.encode(`data: ${cmd}\n\n`));
							}
						}
					} catch {
						// file read error, skip this event
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
