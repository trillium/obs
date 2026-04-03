import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";

export const TTYD_PORT = 7681;
const TTYD_BIN = "/opt/homebrew/bin/ttyd";
const LAUNCH_SCRIPT = "/Users/trilliumsmith/code/chrote/terminal-launch.sh";

let proc: ChildProcess | null = null;

export function startTtyd(): void {
	if (proc) return;

	proc = spawn(TTYD_BIN, ["-W", "-p", String(TTYD_PORT), "-a", LAUNCH_SCRIPT], {
		stdio: "ignore",
		detached: false,
	});

	proc.on("exit", (code) => {
		console.log(`[ttyd] exited (${code}), restarting in 1s`);
		proc = null;
		setTimeout(startTtyd, 1000);
	});

	proc.on("error", (err) => {
		console.error("[ttyd] error:", err.message);
		proc = null;
	});

	console.log(`[ttyd] started on :${TTYD_PORT}`);
}

export function stopTtyd(): void {
	proc?.kill();
	proc = null;
}
