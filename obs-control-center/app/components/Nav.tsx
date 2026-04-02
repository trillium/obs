"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsObs } from "../hooks/useObs";

const links = [
	{ label: "Home", href: "/" },
	{ label: "Starting Soon", href: "/overlay/starting-soon" },
	{ label: "Stream Ending", href: "/overlay/stream-ending" },
	{ label: "BRB", href: "/overlay/brb" },
	{ label: "Commands", href: "/command-history" },
	{ label: "Activity", href: "/activity" },
];

export function Nav() {
	const isObs = useIsObs();
	const pathname = usePathname();

	if (isObs) return null;

	return (
		<nav className="fixed top-0 right-0 left-0 z-50 border-b border-amber-brand/10 bg-surface/80 backdrop-blur-md">
			<div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2">
				<Link
					href="/"
					className="mr-4 font-display text-[10px] font-bold uppercase tracking-[0.3em] text-amber-brand/70"
				>
					OCC
				</Link>
				{links.map((link) => {
					const active = pathname === link.href;
					return (
						<Link
							key={link.href}
							href={link.href}
							className={`rounded px-2.5 py-1 text-[11px] font-mono transition ${
								active
									? "bg-amber-brand/15 text-amber-brand"
									: "text-white/40 hover:bg-white/5 hover:text-white/70"
							}`}
						>
							{link.label}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
