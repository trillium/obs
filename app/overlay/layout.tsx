export default function OverlayLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="flex h-[1080px] w-[1920px] items-center justify-center font-[system-ui]">
			{children}
		</div>
	);
}
