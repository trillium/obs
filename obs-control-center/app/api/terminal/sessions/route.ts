import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

export async function GET() {
	try {
		const { stdout } = await exec("tmux", ["ls", "-F", "#{session_name}"]);
		const sessions = stdout
			.split("\n")
			.map((s) => s.trim())
			.filter(Boolean);
		return Response.json({ sessions });
	} catch {
		// tmux returns exit code 1 when no sessions exist
		return Response.json({ sessions: [] });
	}
}
