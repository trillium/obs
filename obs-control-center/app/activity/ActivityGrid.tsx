"use client";

import { Week } from "./Week";

const DAY_LABELS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

interface ActivityGridProps {
	weeks: string[][];
	activity: { [date: string]: number };
	untracked: {
		count: number;
		date: string | null;
	};
}

export function ActivityGrid({
	weeks,
	activity,
	untracked,
}: ActivityGridProps) {
	// Find the first week that should be highlighted (before untracked.date and doesn't contain it)
	let firstUntrackedWeekIndex = -1;
	for (let i = 0; i < weeks.length; i++) {
		const week = weeks[i];
		const shouldHighlight =
			untracked.date &&
			!week.includes(untracked.date) &&
			week[0] < untracked.date;
		if (shouldHighlight) {
			firstUntrackedWeekIndex = i;
			break;
		}
	}

	// Calculate month labels
	const monthLabels: (string | null)[] = [];
	const seenMonths = new Set<string>();
	for (let wi = 0; wi < weeks.length; wi++) {
		const week = weeks[wi];
		let monthLabel: string | null = null;
		for (const day of week) {
			const date = new Date(day);
			if (date.getDate() === 1) {
				const month = date.toLocaleString("en-US", { month: "short" });
				if (!seenMonths.has(month)) {
					seenMonths.add(month);
					monthLabel = month;
					break;
				}
			}
		}
		monthLabels[wi] = monthLabel;
	}

	return (
		<div className="flex overflow-x-auto rounded-lg border border-teal-300 dark:border-teal-700">
			{/* Day headings */}
			<div className="sticky left-0 z-10 mr-2 flex flex-col bg-white dark:bg-gray-800">
				<div className="m-0.5 h-3 w-3" />
				{DAY_LABELS.map((key) => (
					<div
						key={key}
						className="m-0.5 flex h-3 w-3 items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400"
					>
						{key[0].toUpperCase()}
					</div>
				))}
			</div>
			{/* Flex container for weeks */}
			{weeks.map((week, wi) => (
				<Week
					key={week[0]}
					week={week}
					activity={activity}
					weekIndex={wi}
					untracked={untracked}
					isFirstUntrackedWeek={wi === firstUntrackedWeekIndex}
					monthLabel={monthLabels[wi]}
				/>
			))}
		</div>
	);
}
