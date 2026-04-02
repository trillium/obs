"use client";

import type { IconName } from "./icons/paths";
import { SocialIcon } from "./icons/SocialIcon";

const socials: { platform: string; handle: string; icon: IconName }[] = [
	{ platform: "Bluesky", handle: "@trillium.is", icon: "bluesky" },
	{ platform: "GitHub", handle: "trillium", icon: "github" },
	{ platform: "LinkedIn", handle: "/in/trilliumsmith", icon: "linkedin" },
	{ platform: "YouTube", handle: "@Trillium_is", icon: "youtube" },
	{ platform: "Twitch", handle: "trilliumsmith", icon: "twitch" },
];

const delays = [
	"delay-400",
	"delay-500",
	"delay-600",
	"delay-800",
	"delay-1000",
];

export function Socials() {
	return (
		<div className="mt-16 flex flex-col items-center gap-6">
			{/* Divider line */}
			<div className="h-px w-48 origin-center bg-amber-brand/30 animate-line-expand delay-300" />
			{/* Social row */}
			<div className="flex flex-wrap justify-center gap-8">
				{socials.map((s, i) => (
					<div
						key={s.platform}
						className={`animate-fade-up flex items-center gap-3 opacity-0 ${delays[i]}`}
						style={{ animationFillMode: "forwards" }}
					>
						<SocialIcon name={s.icon} className="text-amber-brand/50" />
						<div>
							<div className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-amber-brand/60">
								{s.platform}
							</div>
							<div className="font-mono text-sm font-light text-white/60">
								{s.handle}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
