import { useEffect, useState } from "react";

declare global {
	interface Window {
		obsstudio?: {
			pluginVersion: string;
			getCurrentScene: (cb: (scene: { name: string }) => void) => void;
		};
	}
}

/** Returns true when running inside an OBS browser source */
export function useIsObs(): boolean {
	const [isObs, setIsObs] = useState(false);

	useEffect(() => {
		setIsObs(typeof window.obsstudio !== "undefined");
	}, []);

	return isObs;
}
