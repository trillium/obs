"use client";

import { useIsObs } from "../hooks/useObs";
import { useRowingData } from "../hooks/useRowingData";
import { ActivityGrid } from "./ActivityGrid";
import { RowingStats } from "./RowingStats";

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

	return (
		<div
			className={`flex flex-col gap-4 bg-black/60 p-4 font-mono backdrop-blur-sm ${
				isObs ? "h-[400px] w-[900px]" : "min-h-screen w-full max-w-4xl pt-14"
			}`}
		>
			{/* Stats */}
			<RowingStats data={data} />

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
