"use client";

import { DayCell } from "./DayCell";

const DAY_LABELS = [
	{ key: "sun", label: "S" },
	{ key: "mon", label: "M" },
	{ key: "tue", label: "T" },
	{ key: "wed", label: "W" },
	{ key: "thu", label: "T" },
	{ key: "fri", label: "F" },
	{ key: "sat", label: "S" },
];
const MONTH_NAMES = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

function getMonthLabels(weeks: string[][]): (string | null)[] {
	const labels: (string | null)[] = [];
	const seen = new Set<string>();
	for (let i = 0; i < weeks.length; i++) {
		let label: string | null = null;
		for (const day of weeks[i]) {
			const d = new Date(day);
			if (d.getDate() === 1) {
				const month = MONTH_NAMES[d.getMonth()];
				if (!seen.has(month)) {
					seen.add(month);
					label = month;
					break;
				}
			}
		}
		labels[i] = label;
	}
	return labels;
}

export function ActivityGrid({
	weeks,
	activity,
}: {
	weeks: string[][];
	activity: Record<string, number>;
}) {
	const monthLabels = getMonthLabels(weeks);

	return (
		<div className="flex gap-[2px] overflow-x-auto">
			{/* Day-of-week labels */}
			<div className="flex shrink-0 flex-col gap-[2px] pr-1">
				<div className="h-[14px]" />
				{DAY_LABELS.map((d) => (
					<div
						key={d.key}
						className="flex h-[14px] items-center text-[8px] text-white/30"
					>
						{d.label}
					</div>
				))}
			</div>

			{/* Week columns */}
			{weeks.map((week) => (
				<div key={week[0]} className="flex flex-col gap-[2px]">
					<div className="h-[14px] text-[8px] text-white/40">
						{monthLabels[weeks.indexOf(week)] ?? ""}
					</div>
					{week.map((day) => (
						<DayCell key={day} dateStr={day} count={activity[day] || 0} />
					))}
				</div>
			))}
		</div>
	);
}
