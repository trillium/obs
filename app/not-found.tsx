import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="mb-4 text-8xl font-bold opacity-20">404</h1>
				<p className="mb-8 text-xl font-light opacity-50">
					This overlay doesn't exist
				</p>
				<Link
					href="/"
					className="rounded-lg bg-white/10 px-6 py-3 text-sm transition hover:bg-white/20"
				>
					Back to Control Center
				</Link>
			</div>
		</div>
	);
}
