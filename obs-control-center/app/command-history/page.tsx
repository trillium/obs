"use client";

import { useMemo } from "react";
import { useCommandHistory } from "../hooks/useCommandHistory";
import { useIsObs } from "../hooks/useObs";
import { CommandRow } from "./CommandRow";
import { groupCommands } from "./groupCommands";

export default function CommandHistory() {
	const commands = useCommandHistory(50);
	const isObs = useIsObs();
	const groups = useMemo(() => groupCommands(commands), [commands]);

	return (
		<div
			className={`flex flex-col overflow-hidden bg-black/60 font-mono backdrop-blur-sm ${
				isObs ? "h-[736px] w-[249px]" : "h-screen w-full max-w-md"
			}`}
		>
			{/* Header */}
			<div className="border-b border-amber-brand/20 px-3 py-2">
				<div className="text-[9px] font-medium uppercase tracking-[0.25em] text-amber-brand/60">
					voice commands
				</div>
			</div>

			{/* Command list */}
			<div className="flex flex-1 flex-col overflow-hidden px-2 py-1">
				{groups.map((group) => (
					<CommandRow key={group.cmd.timestamp} group={group} />
				))}
			</div>
		</div>
	);
}
