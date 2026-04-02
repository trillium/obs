import "./globals.css";
import { Nav } from "./components/Nav";

export const metadata = {
	title: "OBS Control Center",
	description: "Stream overlays and control panel",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="bg-[#0e0e0e] text-white antialiased">
				<Nav />
				{children}
			</body>
		</html>
	);
}
