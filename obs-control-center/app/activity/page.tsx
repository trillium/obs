"use client";

import { useIsObs } from "../hooks/useObs";
import { useRowingData } from "../hooks/useRowingData";
import { ActivityGrid } from "./ActivityGrid";

export default function Activity() {
	const data = useRowingData();
	const isObs = useIsObs();

	if (!data) {
		return (
			<div className="flex h-screen items-center justify-center bg-surface font-mono text-white/30">
				loading…
			</div>
		);
	}

	const isAhead = data.ahead >= 0;

	return (
		<div
			className={`flex flex-col gap-4 bg-black/60 p-4 font-mono backdrop-blur-sm ${
				isObs ? "h-[400px] w-[900px]" : "min-h-screen w-full max-w-4xl"
			}`}
		>
			{/* Stats header */}
			<div className="flex items-baseline gap-6">
				<h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-amber-brand/60">
					rowing tracker
				</h2>
				<div className="flex items-baseline gap-4 text-[11px] text-white/50">
					<span>
						day <span className="text-white/80">{data.daysPassed}</span>
					</span>
					<span>
						rows <span className="text-white/80">{data.totalRows}</span>
					</span>
					<span className={isAhead ? "text-emerald-400/80" : "text-red-400/80"}>
						{isAhead ? "+" : ""}
						{data.ahead}
					</span>
				</div>
			</div>

			{/* Divider */}
			<div className="h-px bg-amber-brand/20" />

			{/* Activity grid */}
			<div className="flex-1 overflow-x-auto">
				<ActivityGrid weeks={data.weeks} activity={data.activity} />
			</div>

			{/* Footer */}
			{data.firstDate && (
				<div className="text-[9px] text-white/20">
					tracking since {data.firstDate}
					{data.untrackedCount > 0 && ` · ${data.untrackedCount} untracked`}
				</div>
			)}
		</div>
	);
}
