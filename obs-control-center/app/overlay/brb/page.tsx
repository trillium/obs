import { Socials } from "../../components/Socials";

export default function BeRightBack() {
	return (
		<div className="text-center">
			{/* Label */}
			<div className="animate-fade-up delay-100 mb-4 font-mono text-sm font-medium uppercase tracking-[0.4em] text-amber-brand/70">
				hold tight
			</div>

			{/* Title */}
			<h1 className="animate-fade-up delay-200 mb-6 text-[5.5rem] font-bold leading-none tracking-tight">
				Be Right Back
			</h1>

			{/* Accent line */}
			<div className="mx-auto mb-8 h-px w-64 origin-center bg-amber-brand/40 animate-line-expand delay-300" />

			{/* Animated dots */}
			<div className="animate-fade-up delay-400 flex items-center justify-center gap-3">
				{[0, 1, 2].map((i) => (
					<span
						key={i}
						className="inline-block h-2.5 w-2.5 rounded-full bg-amber-brand"
						style={{
							animation: "dot-pulse 1.4s ease-in-out infinite",
							animationDelay: `${i * 0.2}s`,
						}}
					/>
				))}
			</div>

			{/* Subtext */}
			<p className="animate-fade-up delay-500 mt-8 font-mono text-lg font-light uppercase tracking-[0.3em] text-white/25">
				stream will resume shortly
			</p>

			<Socials />
		</div>
	);
}
