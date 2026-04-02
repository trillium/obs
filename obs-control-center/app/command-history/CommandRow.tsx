"use client";

import type { GroupedCommand } from "./groupCommands";

function formatTally(repeats: number, reverses: number): string | null {
	if (repeats === 0 && reverses === 0) return null;

	const parts: string[] = [];
	if (reverses > 0) {
		parts.push(reverses === 1 ? "↩ reverse" : `↩ reverse x${reverses}`);
	}
	if (repeats > 0) {
		parts.push(repeats === 1 ? "↻ repeat" : `↻ repeat x${repeats}`);
	}
	return parts.join(", ");
}

export function CommandRow({ group }: { group: GroupedCommand }) {
	const { cmd, repeats, reverses } = group;
	const tally = formatTally(repeats, reverses);

	return (
		<div className="border-b border-white/5 px-1 py-1">
			{/* Main phrase line */}
			<div className="truncate text-[11px] leading-tight text-white">
				{cmd.phrase || "—"}
			</div>

			{/* Rule subtitle (only when different from phrase) */}
			{cmd.rule && cmd.rule !== cmd.phrase && (
				<div className="truncate text-[9px] leading-tight text-amber-brand/40">
					{cmd.rule}
				</div>
			)}

			{/* Repeat/reverse tally */}
			{tally && (
				<div
					className={`truncate text-[8px] font-medium uppercase tracking-wider ${
						reverses > 0 ? "text-red-400/50" : "text-white/25"
					}`}
				>
					{tally}
				</div>
			)}
		</div>
	);
}
