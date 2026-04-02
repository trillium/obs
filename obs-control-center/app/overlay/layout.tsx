import { OverlayShell } from "./OverlayShell";

export default function OverlayLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <OverlayShell>{children}</OverlayShell>;
}
