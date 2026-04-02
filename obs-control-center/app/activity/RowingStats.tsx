"use client";

import type { RowingData } from "../hooks/useRowingData";

export function RowingStats({ data }: { data: RowingData }) {
	const isAhead = data.ahead >= 0;
	const diff = Math.abs(data.ahead);

	return (
		<div
			className="flex flex-col items-start rounded-lg border p-4"
			style={{ borderColor: isAhead ? "#22c55e" : "#ef4444" }}
		>
			<p className="text-white/80">{`Days passed this year: ${data.daysPassed}`}</p>
			<p className="text-white/80">{`Rows this year: ${data.totalRows}`}</p>
			<p
				className={`mt-1 inline-block bg-gradient-to-b bg-clip-text text-4xl font-bold text-transparent ${
					isAhead
						? "from-black via-green-500 to-green-400"
						: "from-black via-red-500 to-red-400"
				}`}
			>
				{isAhead ? `Rows ahead: +${diff}` : `Rows behind: -${diff}`}
			</p>
		</div>
	);
}
