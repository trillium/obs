"use client";

const INTENSITY = [
	"bg-white/[0.03] border-white/[0.06]", // 0
	"bg-amber-brand/20 border-amber-brand/30", // 1
	"bg-amber-brand/30 border-amber-brand/40", // 2
	"bg-amber-brand/40 border-amber-brand/50", // 3
	"bg-amber-brand/55 border-amber-brand/60", // 4
	"bg-amber-brand/70 border-amber-brand/70", // 5
	"bg-amber-brand/80 border-amber-brand/80 shadow-sm shadow-amber-brand/30", // 6
	"bg-amber-brand/85 border-amber-brand/85 shadow-md shadow-amber-brand/40", // 7
	"bg-amber-brand/90 border-amber-brand/90 shadow-md shadow-amber-brand/50", // 8
	"bg-amber-brand border-amber-brand shadow-lg shadow-amber-brand/50", // 9
	"bg-amber-brand border-amber-brand shadow-lg shadow-amber-brand/60", // 10+
] as const;

export function DayCell({
	dateStr,
	count,
}: {
	dateStr: string;
	count: number;
}) {
	if (!dateStr) {
		return <div className="h-[14px] w-[14px]" />;
	}

	const isFuture = new Date(dateStr) > new Date();
	const level = isFuture ? -1 : Math.min(count, 10);

	return (
		<div
			title={!isFuture ? `${dateStr}: ${count}` : undefined}
			className={`h-[14px] w-[14px] rounded-[3px] border ${
				level < 0 ? "border-white/[0.03] bg-transparent" : INTENSITY[level]
			}`}
		/>
	);
}
