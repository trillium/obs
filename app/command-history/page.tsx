"use client";

import { useEffect, useState } from "react";

interface Command {
	display: string | null;
	phrase: string | null;
	app: string | null;
	timestamp: string | null;
	success: boolean | null;
}

const POLL_INTERVAL = 1000;
const VISIBLE_COMMANDS = 20;

export default function CommandHistory() {
	const [commands, setCommands] = useState<Command[]>([]);

	useEffect(() => {
		let active = true;

		async function poll() {
			try {
				const res = await fetch("/api/commands");
				if (res.ok && active) {
					const data: Command[] = await res.json();
					setCommands(data.slice(0, VISIBLE_COMMANDS));
				}
			} catch {
				// silently retry next interval
			}
			if (active) setTimeout(poll, POLL_INTERVAL);
		}

		poll();
		return () => {
			active = false;
		};
	}, []);

	return (
		<div className="flex h-[736px] w-[249px] flex-col overflow-hidden bg-black/60 font-mono backdrop-blur-sm">
			{/* Header */}
			<div className="border-b border-amber-brand/20 px-3 py-2">
				<div className="text-[9px] font-medium uppercase tracking-[0.25em] text-amber-brand/60">
					voice commands
				</div>
			</div>

			{/* Command list */}
			<div className="flex flex-1 flex-col-reverse overflow-hidden px-2 py-1">
				{commands.map((cmd) => {
					const idx = commands.indexOf(cmd);
					const opacity = Math.max(0.15, 1 - idx * 0.045);
					return (
						<div
							key={cmd.timestamp}
							className="border-b border-white/5 px-1 py-1"
							style={{ opacity }}
						>
							<div className="truncate text-[11px] leading-tight text-white">
								{cmd.phrase || "—"}
							</div>
							{cmd.display && cmd.display !== cmd.phrase && (
								<div className="truncate text-[9px] leading-tight text-amber-brand/40">
									{cmd.display}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
