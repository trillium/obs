export default function OverlayLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="grain relative flex h-[1080px] w-[1920px] items-center justify-center overflow-hidden font-display">
			{/* Radial ambient glow */}
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-amber-subtle)_0%,_transparent_70%)]" />
			{/* Corner accent marks */}
			<div className="pointer-events-none absolute top-12 left-12 h-16 w-16 border-t-2 border-l-2 border-amber-brand/20 animate-fade-in delay-600" />
			<div className="pointer-events-none absolute top-12 right-12 h-16 w-16 border-t-2 border-r-2 border-amber-brand/20 animate-fade-in delay-600" />
			<div className="pointer-events-none absolute bottom-12 left-12 h-16 w-16 border-b-2 border-l-2 border-amber-brand/20 animate-fade-in delay-600" />
			<div className="pointer-events-none absolute bottom-12 right-12 h-16 w-16 border-b-2 border-r-2 border-amber-brand/20 animate-fade-in delay-600" />
			{/* Content */}
			<div className="relative z-10">{children}</div>
		</div>
	);
}
