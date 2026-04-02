import { useEffect, useState } from "react";

export interface CommandPart {
	phrase: string;
	rule: string;
}

export interface Command {
	phrase: string;
	rule: string;
	app: string;
	timestamp: string;
	success: boolean;
	commands: CommandPart[];
}

export function useCommandHistory(limit = 20): Command[] {
	const [commands, setCommands] = useState<Command[]>([]);

	useEffect(() => {
		const source = new EventSource(`/api/commands?limit=${limit}`);

		source.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (Array.isArray(data)) {
				setCommands((prev) => [...data, ...prev].slice(0, limit));
			} else {
				setCommands((prev) => [data, ...prev].slice(0, limit));
			}
		};

		return () => source.close();
	}, [limit]);

	return commands;
}
