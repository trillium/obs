#!/usr/bin/env node
import { spawn } from "node:child_process";

const TTYD_PORT = 7681;
const TTYD_BIN = "/opt/homebrew/bin/ttyd";
const LAUNCH_SCRIPT = "/Users/trilliumsmith/code/chrote/terminal-launch.sh";

function start() {
	const proc = spawn(TTYD_BIN, ["-W", "-p", String(TTYD_PORT), "-a", LAUNCH_SCRIPT], {
		stdio: "ignore",
		detached: true,
	});

	proc.on("error", (err) => console.error("[ttyd] failed to start:", err.message));
	proc.unref();
	console.log(`[ttyd] started on :${TTYD_PORT}`);
}

start();
