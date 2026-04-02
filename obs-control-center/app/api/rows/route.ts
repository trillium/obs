import { readFile } from "node:fs/promises";
import { eachDayOfInterval, format, startOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const ROWS_FILE = "/Users/trilliumsmith/code/row_tracker/rows.txt";
const TIMEZONE = "America/Los_Angeles";

interface ActivityByDate {
	[date: string]: number;
}

function getYearDays(date: Date): string[] {
	const weekStart = startOfWeek(date, { weekStartsOn: 0 });
	const start = new Date(weekStart);
	start.setDate(start.getDate() - 51 * 7);
	const end = new Date(weekStart);
	end.setDate(end.getDate() + 6);
	return eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
}

function processRows(lines: string[]): {
	activity: ActivityByDate;
	firstDate: string | null;
	untrackedCount: number;
	totalRows: number;
} {
	const byDate: ActivityByDate = {};
	let earliest: Date | null = null;
	let untrackedCount = 0;
	let totalRows = 0;

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		totalRows++;

		try {
			const parsed = new Date(trimmed);
			if (Number.isNaN(parsed.getTime())) throw new Error();
			const zoned = toZonedTime(parsed, TIMEZONE);
			const date = format(zoned, "yyyy-MM-dd");
			byDate[date] = (byDate[date] || 0) + 1;
			if (!earliest || zoned < earliest) earliest = zoned;
		} catch {
			untrackedCount++;
		}
	}

	return {
		activity: byDate,
		firstDate: earliest ? format(earliest, "yyyy-MM-dd") : null,
		untrackedCount,
		totalRows,
	};
}

function getDaysPassedThisYear(): number {
	const now = toZonedTime(new Date(), TIMEZONE);
	const startOfYear = new Date(now.getFullYear(), 0, 1);
	return Math.ceil(
		(now.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24),
	);
}

export async function GET() {
	try {
		const content = await readFile(ROWS_FILE, "utf-8");
		const lines = content.split("\n").filter((l) => l.trim());
		const { activity, firstDate, untrackedCount, totalRows } =
			processRows(lines);
		const days = getYearDays(toZonedTime(new Date(), TIMEZONE));
		const weeks: string[][] = [];
		for (let i = 0; i < days.length; i += 7) {
			weeks.push(days.slice(i, i + 7));
		}
		weeks.reverse();

		const daysPassed = getDaysPassedThisYear();
		const validRows = totalRows - untrackedCount;

		return Response.json({
			weeks,
			activity,
			firstDate,
			untrackedCount,
			totalRows: validRows,
			daysPassed,
			ahead: validRows - daysPassed,
		});
	} catch {
		return Response.json(
			{ error: "Failed to read rowing data" },
			{ status: 500 },
		);
	}
}
