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
			className={`flex flex-col gap-8 overflow-x-auto p-4 ${
				isObs ? "h-[400px] w-[900px]" : "min-h-screen w-full max-w-4xl pt-14"
			}`}
		>
			<RowingStats data={data} />
			<div>
				<h3 className="mb-2 font-bold">
					Activity Map (52 Weeks)
					{data.firstDate && ` - First tracked: ${data.firstDate}`}
				</h3>
				<ActivityGrid
					weeks={data.weeks}
					activity={data.activity}
					untracked={data.untracked}
				/>
			</div>
		</div>
	);
}
