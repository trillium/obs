import { defineConfig } from "vite";
import { startTtyd, stopTtyd, TTYD_PORT } from "./app/lib/ttyd";

export default defineConfig({
	server: {
		host: "0.0.0.0",
		port: 7400,
		allowedHosts: true,
		proxy: {
			"/terminal-ws": {
				target: `ws://localhost:${TTYD_PORT}`,
				ws: true,
				rewrite: (path) => path.replace(/^\/terminal-ws/, "/ws"),
			},
		},
	},
	plugins: [
		{
			name: "ttyd-lifecycle",
			configureServer() {
				startTtyd();
				process.on("exit", stopTtyd);
				process.on("SIGINT", () => {
					stopTtyd();
					process.exit();
				});
			},
		},
	],
});
