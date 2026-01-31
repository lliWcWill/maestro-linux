import { useState, useEffect, useCallback, useRef } from "react";
import { TerminalView } from "./TerminalView";
import { spawnShell, killSession } from "@/lib/terminal";

function gridClass(count: number): string {
  switch (count) {
    case 1:
      return "grid-cols-1 grid-rows-1";
    case 2:
      return "grid-cols-2 grid-rows-1";
    case 3:
      return "grid-cols-3 grid-rows-1";
    case 4:
      return "grid-cols-2 grid-rows-2";
    case 5:
    case 6:
      return "grid-cols-3 grid-rows-2";
    default:
      return "grid-cols-3 grid-rows-2";
  }
}

export function TerminalGrid() {
  const [sessions, setSessions] = useState<number[]>([]);
  const sessionsRef = useRef<number[]>([]);

  // Keep ref in sync so cleanup can read current session IDs
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    let cancelled = false;

    spawnShell()
      .then((id) => {
        if (!cancelled) {
          setSessions([id]);
        } else {
          // Component unmounted before spawn resolved — kill the orphan
          killSession(id).catch(console.error);
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      // Kill all active sessions on unmount to prevent orphaned PTYs
      for (const id of sessionsRef.current) {
        killSession(id).catch(console.error);
      }
    };
  }, []);

  const handleKill = useCallback((sessionId: number) => {
    setSessions((prev) => prev.filter((id) => id !== sessionId));
  }, []);

  if (sessions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-maestro-muted text-sm">
        Starting terminal...
      </div>
    );
  }

  return (
    <div
      className={`grid h-full ${gridClass(sessions.length)} gap-px bg-maestro-border p-px`}
    >
      {sessions.map((id) => (
        <TerminalView key={id} sessionId={id} onKill={handleKill} />
      ))}
    </div>
  );
}
