import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center font-display">
			<div className="text-center">
				{/* Accent line */}
				<div className="mx-auto mb-8 h-px w-32 bg-amber-brand/30" />
				<h1 className="mb-2 text-[10rem] font-bold leading-none tracking-tight text-white/10">
					404
				</h1>
				<p className="mb-10 font-mono text-sm uppercase tracking-[0.3em] text-white/40">
					This overlay doesn&apos;t exist
				</p>
				<Link
					href="/"
					className="inline-block border border-amber-brand/30 px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] text-amber-brand/70 transition hover:border-amber-brand/60 hover:text-amber-brand"
				>
					Back to Control Center
				</Link>
			</div>
		</div>
	);
}
