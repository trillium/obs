"use client";

import { useCommandHistory } from "../hooks/useCommandHistory";
import { useIsObs } from "../hooks/useObs";

export default function CommandHistory() {
  const commands = useCommandHistory(20);
  const isObs = useIsObs();

  return (
    <div
      className={`flex flex-col overflow-hidden bg-black/60 font-mono backdrop-blur-sm ${
        isObs ? "h-[736px] w-[249px]" : "h-screen w-full max-w-md"
      }`}
    >
      {/* Header */}
      <div className="border-b border-amber-brand/20 px-3 py-2">
        <div className="text-[9px] font-medium uppercase tracking-[0.25em] text-amber-brand/60">
          voice commands
        </div>
      </div>

      {/* Command list */}
      <div className="flex flex-1 flex-col-reverse overflow-hidden px-2 py-1">
        {commands.map((cmd) => {
          return (
            <div
              key={cmd.timestamp}
              className="border-b border-white/5 px-1 py-1"
            >
              <div className="truncate text-[11px] leading-tight text-white">
                {cmd.phrase || "—"}
              </div>
              {cmd.display && cmd.display !== cmd.phrase && (
                <div className="truncate text-[9px] leading-tight text-amber-brand/40">
                  {cmd.display}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
