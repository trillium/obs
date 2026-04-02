import { Socials } from "../../components/Socials";

export default function StreamEnding() {
	return (
		<div className="text-center">
			{/* Label */}
			<div className="animate-fade-up delay-100 mb-4 font-mono text-sm font-medium uppercase tracking-[0.4em] text-amber-brand/70">
				stream ended
			</div>

			{/* Title */}
			<h1 className="animate-fade-up delay-200 mb-6 text-[5.5rem] font-bold leading-none tracking-tight">
				Thanks for Watching
			</h1>

			{/* Accent line */}
			<div className="mx-auto mb-8 h-px w-64 origin-center bg-amber-brand/40 animate-line-expand delay-300" />

			{/* Subtext */}
			<p className="animate-fade-up delay-400 font-mono text-lg font-light uppercase tracking-[0.3em] text-white/25">
				see you next time
			</p>

			<Socials />
		</div>
	);
}
