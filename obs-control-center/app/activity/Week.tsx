"use client";

import clsx from "clsx";
import { DayCell } from "./DayCell";

interface WeekProps {
	week: string[];
	activity: { [date: string]: number };
	weekIndex: number;
	untracked: {
		count: number;
		date: string | null;
	};
	isFirstUntrackedWeek: boolean;
	monthLabel: string | null;
}

export function Week({
	week,
	activity,
	untracked,
	isFirstUntrackedWeek,
	monthLabel,
}: WeekProps) {
	const totalActivities = week.reduce(
		(sum, day) => sum + (activity[day] || 0),
		0,
	);

	// Check if week should have highlighted background
	const shouldHighlight =
		untracked.date &&
		!week.includes(untracked.date) &&
		week[0] < untracked.date;

	// Determine header text
	const headerText = isFirstUntrackedWeek
		? `Untracked count: ${untracked.count}`
		: totalActivities > 0
			? totalActivities.toString()
			: "";

	return (
		<div
			className={clsx("flex flex-col", {
				"bg-teal-100 dark:bg-teal-900": shouldHighlight,
			})}
		>
			{/* Week header */}
			<div
				className={clsx(
					"m-0.5 flex h-3 w-3 items-center whitespace-nowrap text-xs font-bold text-slate-600 underline rotate-[-45deg] dark:text-slate-400",
					isFirstUntrackedWeek
						? "translate-x-[-10px] translate-y-[2px] justify-start"
						: "translate-x-[2px] translate-y-[2px] justify-center",
				)}
			>
				<span
					className={clsx({
						"rounded-md border border-teal-300 bg-teal-100 p-1 dark:border-gray-700 dark:bg-teal-900":
							isFirstUntrackedWeek,
					})}
				>
					{headerText}
				</span>
			</div>
			{/* Week column */}
			{week.map((day) => {
				const count = activity[day] || 0;
				return <DayCell key={day} dateStr={day} count={count} />;
			})}
			{/* Month label */}
			{monthLabel && (
				<div className="m-0.5 flex h-3 w-3 items-center justify-center text-xs font-bold text-slate-600 rotate-[-45deg] dark:text-slate-400">
					{monthLabel}
				</div>
			)}
		</div>
	);
}
