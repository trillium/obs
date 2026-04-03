"use client";

import clsx from "clsx";

interface DayCellProps {
	dateStr: string;
	count: number;
	isUntracked?: boolean;
}

export function DayCell({ dateStr, count, isUntracked = false }: DayCellProps) {
	// Handle empty cells (padding for calendar alignment)
	if (!dateStr) {
		return (
			<div className="h-4 w-4 bg-transparent p-0.5">
				<div className="h-3 w-3" />
			</div>
		);
	}

	const isFuture = new Date(dateStr) > new Date();
	const month = new Date(dateStr).getMonth() + 1;
	return (
		<div
			className={clsx("h-4 w-4 p-0.5", {
				"bg-gray-200 dark:bg-gray-800": isUntracked,
				"bg-gray-100 dark:bg-gray-900": !isUntracked && month % 2 === 0,
				"bg-teal-50 dark:bg-teal-900": !isUntracked && month % 2 !== 0,
			})}
		>
			<div
				title={!isFuture ? `${dateStr}: ${count} activities` : undefined}
				className={clsx(
					"flex h-3 w-3 items-center justify-center rounded-sm border text-xs font-semibold",
					{
						"bg-gray-100 border-gray-300 text-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-900":
							isFuture,
						"bg-teal-100 border-teal-400 shadow-xl shadow-teal-400/60 dark:border-teal-50":
							count === 10 && !isFuture,
						"bg-teal-200 border-teal-400 shadow-lg shadow-teal-400/50 dark:border-teal-100":
							count === 9 && !isFuture,
						"bg-teal-300 border-teal-500 shadow-md shadow-teal-500/40 dark:border-teal-100":
							count === 8 && !isFuture,
						"bg-teal-400 border-teal-600 shadow-sm shadow-teal-500/30 dark:border-teal-200":
							count === 7 && !isFuture,
						"bg-teal-500 border-teal-700 text-white dark:bg-teal-400 dark:border-gray-100 dark:text-teal-700":
							count === 6 && !isFuture,
						"bg-teal-500 border-teal-600 text-white dark:bg-teal-400 dark:border-teal-200 dark:text-teal-700":
							count === 5 && !isFuture,
						"bg-teal-500 border-teal-500 text-white dark:border-teal-300 dark:text-teal-700":
							count === 4 && !isFuture,
						"bg-teal-600 border-teal-400 text-white dark:border-slate-700 dark:text-teal-800":
							count === 3 && !isFuture,
						"bg-teal-700 border-teal-300 text-white dark:border-slate-700 dark:text-teal-950":
							count === 2 && !isFuture,
						"bg-teal-800 border-teal-200 text-white dark:border-slate-700 dark:text-teal-950":
							count === 1 && !isFuture,
						"bg-gray-200 border-gray-400 text-gray-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-700":
							count === 0 && !isFuture,
					},
				)}
			>
				<span
					className={clsx({
						"bg-gradient-to-t from-black via-teal-900 to-teal-100 bg-clip-text font-extrabold text-transparent":
							count === 10 && !isFuture,
						"bg-gradient-to-t from-black via-teal-800 to-teal-200 bg-clip-text font-bold text-transparent":
							count === 9 && !isFuture,
						"bg-gradient-to-t from-black to-teal-300 bg-clip-text text-transparent":
							count === 8 && !isFuture,
						"bg-gradient-to-t from-slate-800 to-teal-400 bg-clip-text text-transparent":
							count === 7 && !isFuture,
					})}
				>
					{count > 0 ? count : ""}
				</span>
			</div>
		</div>
	);
}
