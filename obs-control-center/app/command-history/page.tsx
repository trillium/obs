"use client";

import { useEffect, useState } from "react";

interface Command {
	display: string;
	phrase: string;
	app: string;
	timestamp: string;
	success: boolean;
}

const VISIBLE_COMMANDS = 20;

export default function CommandHistory() {
	const [commands, setCommands] = useState<Command[]>([]);

	useEffect(() => {
		const source = new EventSource("/api/commands");

		source.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (Array.isArray(data)) {
				// Initial batch
				setCommands(data.slice(0, VISIBLE_COMMANDS));
			} else {
				// Single new command — prepend
				setCommands((prev) => [data, ...prev].slice(0, VISIBLE_COMMANDS));
			}
		};

		return () => source.close();
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
				{commands.map((cmd, idx) => {
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
