import type { Command } from "../hooks/useCommandHistory";

export interface GroupedCommand {
	/** The spoken command (or first in sequence) */
	cmd: Command;
	repeats: number;
	reverses: number;
}

/**
 * Collapse consecutive repeat/reverse entries into the preceding spoken command.
 * Input is newest-first. Output is newest-first grouped entries.
 *
 * Example sequence (newest first):
 *   repeat, repeat, reverse, repeat, repeat, repeat, spoken("press space")
 * Groups into:
 *   { cmd: spoken("press space"), repeats: 3, reverses: 1 }
 *   (the trailing repeats after the reverse are a new group — but since
 *    there's no spoken command before them in view, they attach to the same one)
 *
 * Simpler model: walk newest→oldest, accumulate repeat/reverse counts,
 * attach them when we hit a spoken command.
 */
export function groupCommands(commands: Command[]): GroupedCommand[] {
	const groups: GroupedCommand[] = [];
	let repeats = 0;
	let reverses = 0;

	// Walk oldest to newest (reverse of input) so we accumulate after the spoken command
	for (let i = commands.length - 1; i >= 0; i--) {
		const cmd = commands[i];
		if (cmd.kind === "repeat") {
			repeats++;
		} else if (cmd.kind === "reverse") {
			reverses++;
		} else {
			// Spoken command — flush any pending repeats/reverses from the previous spoken
			// and start a new group
			groups.push({ cmd, repeats: 0, reverses: 0 });
			repeats = 0;
			reverses = 0;
		}

		// Attach accumulated counts to the last spoken group
		if (groups.length > 0) {
			const last = groups[groups.length - 1];
			last.repeats = repeats;
			last.reverses = reverses;
		}
	}

	// If there are orphan repeats/reverses with no spoken command,
	// create a synthetic group from the first one
	if (groups.length === 0 && commands.length > 0) {
		groups.push({ cmd: commands[commands.length - 1], repeats, reverses });
	}

	// Reverse to restore newest-first order
	groups.reverse();
	return groups;
}
