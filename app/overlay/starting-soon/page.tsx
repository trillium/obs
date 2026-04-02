"use client";

import { useEffect, useState } from "react";
import { Socials } from "../../components/Socials";

export default function StartingSoon() {
	const [remaining, setRemaining] = useState(600);
	const [started, setStarted] = useState(false);

	useEffect(() => {
		if (!started) {
			setStarted(true);
		}
	}, [started]);

	useEffect(() => {
		if (!started) return;
		if (remaining <= 0) return;

		const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
		return () => clearTimeout(timer);
	}, [remaining, started]);

	const minutes = Math.floor(remaining / 60);
	const seconds = remaining % 60;
	const display =
		remaining <= 0
			? "LIVE"
			: `${minutes}:${String(seconds).padStart(2, "0")}`;
	const urgent = remaining > 0 && remaining <= 60;

	return (
		<div className="text-center">
			<h1 className="mb-10 text-8xl font-bold tracking-wide">
				Starting Soon
			</h1>
			<div
				className={`text-[144px] font-light tabular-nums tracking-[8px] ${
					urgent ? "animate-pulse text-red-500" : "opacity-90"
				}`}
			>
				{display}
			</div>
			<p className="mt-10 text-3xl font-light uppercase tracking-[4px] opacity-40">
				stream begins shortly
			</p>
			<Socials />
		</div>
	);
}
