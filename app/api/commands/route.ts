import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const COMMANDS_DIR = "/Users/trilliumsmith/.talon/recordings/commands";
const MAX_COMMANDS = 50;

/** Extract the timestamp portion after "__" from filenames like "unknown__2026-04-02_00-00-47-390306.json" */
function extractTimestamp(filename: string): string {
	const idx = filename.indexOf("__");
	return idx >= 0 ? filename.slice(idx + 2) : filename;
}

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

export async function GET() {
	try {
		let files = await readdir(COMMANDS_DIR);
		files = files.filter((f) => f.endsWith(".json"));

		// Sort by embedded timestamp descending (newest first)
		files.sort(
			(a, b) => extractTimestamp(b).localeCompare(extractTimestamp(a)),
		);

		// Lazy iteration — read one at a time, stop at limit
		const results: CommandSummary[] = [];
		for (const filename of files) {
			if (results.length >= MAX_COMMANDS) break;
			try {
				const raw = await readFile(join(COMMANDS_DIR, filename), "utf-8");
				const data: CommandRecord = JSON.parse(raw);
				results.push({
					display: data.command?.display ?? "",
					phrase: data.phrase?.text ?? "",
					app: data.context?.app?.name ?? "",
					timestamp: data.timestamp ?? "",
					success: data.metadata?.success ?? false,
				});
			} catch {
				// skip malformed files
			}
		}

		return Response.json(results);
	} catch {
		return Response.json({ error: "Failed to read commands" }, { status: 500 });
	}
}
