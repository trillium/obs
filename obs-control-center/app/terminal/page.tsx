"use client";

import { useEffect, useRef, useState } from "react";

export default function TerminalPage() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [sessions, setSessions] = useState<string[]>([]);
	const [session, setSession] = useState<string>("");
	const [connected, setConnected] = useState(false);

	// Fetch available sessions
	useEffect(() => {
		fetch("/api/terminal/sessions")
			.then((r) => r.json())
			.then((d: { sessions: string[] }) => {
				setSessions(d.sessions);
				if (d.sessions.length > 0) setSession(d.sessions[0]);
			})
			.catch(() => {});
	}, []);

	// Mount xterm.js once session is chosen
	useEffect(() => {
		if (!containerRef.current || !session) return;

		let ws: WebSocket | null = null;
		let term: import("@xterm/xterm").Terminal | null = null;
		let fitAddon: import("@xterm/addon-fit").FitAddon | null = null;
		let resizeObserver: ResizeObserver | null = null;

		async function init() {
			const { Terminal } = await import("@xterm/xterm");
			const { FitAddon } = await import("@xterm/addon-fit");

			// Import xterm CSS
			await import("@xterm/xterm/css/xterm.css");

			term = new Terminal({
				cursorBlink: true,
				fontFamily: "JetBrains Mono, monospace",
				fontSize: 13,
				theme: {
					background: "#0e0e0e",
					foreground: "#d4a04a",
					cursor: "#d4a04a",
					selectionBackground: "#d4a04a30",
				},
			});

			fitAddon = new FitAddon();
			term.loadAddon(fitAddon);
			term.open(containerRef.current!);
			fitAddon.fit();

			// Resize observer to keep terminal sized to container
			resizeObserver = new ResizeObserver(() => fitAddon?.fit());
			resizeObserver.observe(containerRef.current!);

			// Connect WebSocket to ttyd via Vite proxy
			const wsUrl = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/terminal-ws?arg=${encodeURIComponent(session)}`;
			ws = new WebSocket(wsUrl, ["tty"]);
			ws.binaryType = "arraybuffer";

			ws.onopen = () => {
				setConnected(true);
				// Send initial terminal size to ttyd
				const msg = JSON.stringify({ columns: term?.cols, rows: term?.rows });
				ws?.send(new TextEncoder().encode(`\x02${msg}`));
			};

			ws.onmessage = (e) => {
				if (typeof e.data === "string") {
					// Control message from ttyd
					const msg = JSON.parse(e.data);
					if (msg.type === "input") term?.write(msg.data);
				} else {
					// Binary: output data, first byte is message type
					const buf = new Uint8Array(e.data as ArrayBuffer);
					if (buf[0] === 1) term?.write(buf.slice(1));
				}
			};

			ws.onclose = () => setConnected(false);

			// Send keystrokes to ttyd
			term.onData((data) => {
				if (ws?.readyState === WebSocket.OPEN) {
					const encoded = new TextEncoder().encode(data);
					const msg = new Uint8Array(1 + encoded.length);
					msg[0] = 0; // type: input
					msg.set(encoded, 1);
					ws.send(msg);
				}
			});

			// Send resize events
			term.onResize(({ cols, rows }) => {
				if (ws?.readyState === WebSocket.OPEN) {
					const msg = JSON.stringify({ columns: cols, rows });
					ws.send(new TextEncoder().encode(`\x02${msg}`));
				}
			});
		}

		init().catch(console.error);

		return () => {
			ws?.close();
			term?.dispose();
			resizeObserver?.disconnect();
			setConnected(false);
		};
	}, [session]);

	return (
		<div className="flex h-screen flex-col bg-surface pt-10 font-mono">
			{/* Toolbar */}
			<div className="flex items-center gap-3 border-b border-amber-brand/10 px-4 py-2">
				<span className="text-[10px] uppercase tracking-widest text-amber-brand/50">
					terminal
				</span>
				<select
					value={session}
					onChange={(e) => setSession(e.target.value)}
					className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70 focus:outline-none"
				>
					{sessions.map((s) => (
						<option key={s} value={s}>
							{s}
						</option>
					))}
					<option value="">new shell</option>
				</select>
				<span
					className={`ml-auto h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-white/20"}`}
				/>
			</div>

			{/* Terminal container */}
			<div ref={containerRef} className="min-h-0 flex-1 p-2" />
		</div>
	);
}
