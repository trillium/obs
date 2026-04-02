import { type IconName, iconPaths } from "./paths";

export function SocialIcon({
	name,
	className = "",
}: {
	name: IconName;
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			role="img"
			aria-label={name}
			className={`h-[1.1em] w-[1.1em] ${className}`}
		>
			<path d={iconPaths[name]} />
		</svg>
	);
}
