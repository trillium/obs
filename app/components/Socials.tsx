import { SiBluesky, SiGithub, SiLinkedin, SiTwitch, SiYoutube } from "react-icons/si";

const socials = [
	{ platform: "Bluesky", handle: "@trillium.is", icon: SiBluesky },
	{ platform: "GitHub", handle: "trillium", icon: SiGithub },
	{ platform: "LinkedIn", handle: "/in/trilliumsmith", icon: SiLinkedin },
	{ platform: "YouTube", handle: "@Trillium_is", icon: SiYoutube },
	{ platform: "Twitch", handle: "trilliumsmith", icon: SiTwitch },
];

export function Socials() {
	return (
		<div className="mt-12 flex flex-wrap justify-center gap-10">
			{socials.map((s) => (
				<div key={s.platform} className="flex items-center gap-3 opacity-60">
					<s.icon className="text-2xl" />
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
