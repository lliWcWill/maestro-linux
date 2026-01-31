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

interface TerminalGridProps {
  projectPath?: string;
}

export function TerminalGrid({ projectPath }: TerminalGridProps) {
  const [sessions, setSessions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const sessionsRef = useRef<number[]>([]);
  const mounted = useRef(false);

  // Keep ref in sync so cleanup can read current session IDs
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    let cancelled = false;

    spawnShell(projectPath)
      .then((id) => {
        if (!cancelled) {
          setSessions([id]);
          mounted.current = true;
        } else {
          // Component unmounted before spawn resolved — kill the orphan
          killSession(id).catch(console.error);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError("Failed to start terminal session");
        }
      });

    return () => {
      cancelled = true;
      mounted.current = false;
      // Kill all active sessions on unmount to prevent orphaned PTYs
      for (const id of sessionsRef.current) {
        killSession(id).catch(console.error);
      }
    };
  }, []);

  // Auto-respawn a shell when all sessions are closed (not initial mount, not error)
  useEffect(() => {
    if (sessions.length === 0 && mounted.current && !error) {
      spawnShell(projectPath)
        .then((id) => setSessions([id]))
        .catch((err) => {
          console.error(err);
          setError("Failed to restart terminal session");
        });
    }
  }, [sessions.length, error, projectPath]);

  const handleKill = useCallback((sessionId: number) => {
    setSessions((prev) => prev.filter((id) => id !== sessionId));
  }, []);

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-maestro-muted">
        <span className="text-sm text-maestro-red">{error}</span>
        <button
          onClick={() => {
            setError(null);
            spawnShell(projectPath)
              .then((id) => setSessions([id]))
              .catch((err) => {
                console.error(err);
                setError("Failed to start terminal session");
              });
          }}
          className="rounded bg-maestro-border px-3 py-1.5 text-xs text-maestro-text hover:bg-maestro-muted/20"
        >
          Retry
        </button>
      </div>
    );
  }

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
