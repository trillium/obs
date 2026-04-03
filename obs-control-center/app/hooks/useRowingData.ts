"use client";

import { useEffect, useState } from "react";

export interface RowingData {
	weeks: string[][];
	activity: Record<string, number>;
	firstDate: string | null;
	untracked: { count: number; date: string | null };
	totalRows: number;
	daysPassed: number;
	ahead: number;
}

export function useRowingData(): RowingData | null {
	const [data, setData] = useState<RowingData | null>(null);

	useEffect(() => {
		fetch("/api/rows")
			.then((r) => r.json())
			.then(setData)
			.catch(() => {});
	}, []);

	return data;
}
