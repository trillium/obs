"use client";

import { useEffect, useRef, useState } from "react";

interface Stats {
	scope: "stream" | "lifetime";
	since: string | null;
	streamActive: boolean;
	voiceCommands: number;
	parrotNoises: number;
	transcriptionSeconds: number;
}

/** mm:ss under an hour, h:mm:ss beyond -- transcription time reads better that way. */
function formatDuration(seconds: number): string {
	const total = Math.floor(seconds);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n: number) => String(n).padStart(2, "0");
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

const ROWS = [
	{ key: "voiceCommands", label: "Voice commands", format: String },
	{ key: "parrotNoises", label: "Parrot noises", format: String },
	{ key: "transcriptionSeconds", label: "Transcribed", format: formatDuration },
] as const;

function Counter({
	label,
	value,
	display,
}: {
	label: string;
	value: number;
	display: string;
}) {
	const previous = useRef(value);
	const [bumped, setBumped] = useState(false);

	useEffect(() => {
		const increased = value > previous.current;
		previous.current = value;
		if (!increased) return;
		setBumped(true);
		const t = setTimeout(() => setBumped(false), 700);
		return () => clearTimeout(t);
	}, [value]);

	return (
		<div className="flex items-baseline justify-between gap-4">
			<span className="font-display text-[12px] uppercase tracking-[0.16em] text-white/55">
				{label}
			</span>
			<span
				className={`font-display text-[30px] leading-none tabular-nums transition-colors duration-300 ${
					bumped ? "text-amber-brand" : "text-white/90"
				}`}
			>
				{display}
			</span>
		</div>
	);
}

export default function CountersPage() {
	const [stats, setStats] = useState<Stats | null>(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const res = await fetch("/api/stats", { cache: "no-store" });
				if (!res.ok) return;
				const data: Stats = await res.json();
				if (!cancelled) setStats(data);
			} catch {
				/* keep the last good values */
			}
		};

		load();
		const id = setInterval(load, 2000);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, []);

	const values: Record<string, number> = {
		voiceCommands: stats?.voiceCommands ?? 0,
		parrotNoises: stats?.parrotNoises ?? 0,
		transcriptionSeconds: stats?.transcriptionSeconds ?? 0,
	};

	// "session" when we have a scoped window but nothing is live right now
	const scopeLabel = stats?.streamActive
		? "live"
		: stats?.since
			? "session"
			: "all time";

	return (
		<div className="grain flex h-screen w-screen items-center justify-center overflow-hidden bg-transparent font-display">
			<div className="flex h-full w-full flex-col justify-center rounded-lg border border-amber-brand/25 bg-black/55 px-4 py-3 backdrop-blur-sm">
				<div className="mb-2.5 flex items-center justify-between">
					<span className="text-[10px] uppercase tracking-[0.28em] text-amber-brand/70">
						Session
					</span>
					<span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
						{scopeLabel}
					</span>
				</div>

				<div className="space-y-1.5">
					{ROWS.map(({ key, label, format }) => (
						<Counter
							key={key}
							label={label}
							value={values[key]}
							display={format(values[key])}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
