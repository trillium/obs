import vinext from "vinext";
import { defineConfig } from "vite";
import { TTYD_PORT } from "./app/lib/ttyd";

export default defineConfig({
	plugins: [vinext()],
	server: {
		host: "0.0.0.0",
		allowedHosts: true,
		proxy: {
			"/terminal-ws": {
				target: `ws://localhost:${TTYD_PORT}`,
				ws: true,
				rewrite: (path) => path.replace(/^\/terminal-ws/, "/ws"),
			},
		},
	},
});
