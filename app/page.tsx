import Link from "next/link";

const overlays = [
	{ name: "Starting Soon", href: "/overlay/starting-soon" },
	{ name: "Stream Ending", href: "/overlay/stream-ending" },
	{ name: "Command History", href: "/overlay/command-history" },
	{ name: "Be Right Back", href: "/overlay/brb" },
];

export default function Home() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="mb-8 text-4xl font-bold">OBS Control Center</h1>
				<div className="flex flex-col gap-4">
					{overlays.map((o) => (
						<Link
							key={o.href}
							href={o.href}
							className="rounded-lg bg-white/5 px-8 py-4 text-lg transition hover:bg-white/10"
						>
							{o.name}
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
