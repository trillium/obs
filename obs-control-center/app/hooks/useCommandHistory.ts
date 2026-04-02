import { useEffect, useState } from "react";

export interface Command {
	display: string;
	phrase: string;
	app: string;
	timestamp: string;
	success: boolean;
}

export function useCommandHistory(limit = 20): Command[] {
	const [commands, setCommands] = useState<Command[]>([]);

	useEffect(() => {
		const source = new EventSource(`/api/commands?limit=${limit}`);

		source.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (Array.isArray(data)) {
				// Initial batch or reconnect catch-up
				setCommands((prev) => [...data, ...prev].slice(0, limit));
			} else {
				// Single new command
				setCommands((prev) => [data, ...prev].slice(0, limit));
			}
		};

		return () => source.close();
	}, [limit]);

	return commands;
}
