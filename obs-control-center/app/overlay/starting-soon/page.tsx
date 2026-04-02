"use client";

import { useEffect, useState } from "react";
import { Socials } from "../../components/Socials";

export default function StartingSoon() {
	const [remaining, setRemaining] = useState(600);
	const [started, setStarted] = useState(false);

	useEffect(() => {
		if (!started) setStarted(true);
	}, [started]);

	useEffect(() => {
		if (!started || remaining <= 0) return;
		const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
		return () => clearTimeout(timer);
	}, [remaining, started]);

	const minutes = Math.floor(remaining / 60);
	const seconds = remaining % 60;
	const isLive = remaining <= 0;
	const urgent = remaining > 0 && remaining <= 60;

	const display = isLive
		? "LIVE"
		: `${minutes}:${String(seconds).padStart(2, "0")}`;

	return (
		<div className="text-center">
			{/* Label */}
			<div className="animate-fade-up delay-100 mb-4 font-mono text-sm font-medium uppercase tracking-[0.4em] text-amber-brand/70">
				stream countdown
			</div>

			{/* Title */}
			<h1 className="animate-fade-up delay-200 mb-12 text-[5.5rem] font-bold leading-none tracking-tight">
				Starting Soon
			</h1>

			{/* Accent line */}
			<div className="mx-auto mb-12 h-px w-64 origin-center bg-amber-brand/40 animate-line-expand delay-300" />

			{/* Timer */}
			<div
				className={`font-mono text-[10rem] font-light leading-none tabular-nums tracking-[0.15em] transition-colors duration-500 ${
					isLive
						? "text-amber-brand animate-breathe"
						: urgent
							? "animate-pulse text-red-400"
							: "text-white/80"
				}`}
			>
				{display}
			</div>

			{/* Subtext */}
			<p className="animate-fade-up delay-400 mt-10 font-mono text-lg font-light uppercase tracking-[0.3em] text-white/25">
				{isLive ? "we are live" : "stream begins shortly"}
			</p>

			<Socials />
		</div>
	);
}
