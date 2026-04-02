import { readFile } from "node:fs/promises";

const HISTORY_FILE =
	"/Users/trilliumsmith/.talon/recordings/command_history.jsonl";
const MAX_COMMANDS = 50;

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
		const raw = await readFile(HISTORY_FILE, "utf-8");

		// Take the last N lines (file is append-only, newest at bottom)
		const lines = raw.trimEnd().split("\n");
		const recent = lines.slice(-MAX_COMMANDS).reverse();

		const results: CommandSummary[] = [];
		for (const line of recent) {
			try {
				const data: CommandRecord = JSON.parse(line);
				results.push({
					display: data.command?.display ?? "",
					phrase: data.phrase?.text ?? "",
					app: data.context?.app?.name ?? "",
					timestamp: data.timestamp ?? "",
					success: data.metadata?.success ?? false,
				});
			} catch {
				// skip malformed lines
			}
		}

		return Response.json(results);
	} catch {
		return Response.json(
			{ error: "Failed to read command history" },
			{ status: 500 },
		);
	}
}
