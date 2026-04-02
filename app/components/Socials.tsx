"use client";

const socials = [
	{ platform: "Bluesky", handle: "@trillium.is", emoji: "🦋" },
	{ platform: "GitHub", handle: "trillium", emoji: "🐙" },
	{ platform: "LinkedIn", handle: "/in/trilliumsmith", emoji: "💼" },
	{ platform: "YouTube", handle: "@Trillium_is", emoji: "📺" },
	{ platform: "Twitch", handle: "trilliumsmith", emoji: "🎮" },
];

export function Socials() {
	return (
		<div className="mt-12 flex flex-wrap justify-center gap-10">
			{socials.map((s) => (
				<div key={s.platform} className="flex items-center gap-3 opacity-60">
					<span className="text-2xl">{s.emoji}</span>
					<div>
						<div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
							{s.platform}
						</div>
						<div className="text-lg text-neutral-300">{s.handle}</div>
					</div>
				</div>
			))}
		</div>
	);
}
