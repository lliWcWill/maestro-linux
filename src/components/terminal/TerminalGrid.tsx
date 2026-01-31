import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { TerminalView } from "./TerminalView";
import { spawnShell, killSession } from "@/lib/terminal";

const MAX_SESSIONS = 6;

function gridClass(count: number): string {
  if (count <= 1) return "grid-cols-1 grid-rows-1";
  if (count === 2) return "grid-cols-2 grid-rows-1";
  if (count === 3) return "grid-cols-3 grid-rows-1";
  if (count === 4) return "grid-cols-2 grid-rows-2";
  if (count <= 6) return "grid-cols-3 grid-rows-2";
  if (count <= 9) return "grid-cols-3 grid-rows-3";
  if (count <= 12) return "grid-cols-4 grid-rows-3";
  return "grid-cols-4";
}

export interface TerminalGridHandle {
  addSession: () => void;
}

interface TerminalGridProps {
  projectPath?: string;
  onSessionCountChange?: (count: number) => void;
}

export const TerminalGrid = forwardRef<TerminalGridHandle, TerminalGridProps>(function TerminalGrid({ projectPath, onSessionCountChange }, ref) {
  const [sessions, setSessions] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const sessionsRef = useRef<number[]>([]);
  const mounted = useRef(false);

  useEffect(() => {
    sessionsRef.current = sessions;
    onSessionCountChange?.(sessions.length);
  }, [sessions, onSessionCountChange]);

  useEffect(() => {
    let cancelled = false;

    spawnShell(projectPath)
      .then((id) => {
        if (!cancelled) {
          setSessions([id]);
          mounted.current = true;
        } else {
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
      for (const id of sessionsRef.current) {
        killSession(id).catch(console.error);
      }
    };
  }, []);

  // Auto-respawn when all sessions close (not initial mount, not error)
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

  const addSession = useCallback(() => {
    if (sessions.length >= MAX_SESSIONS) return;
    spawnShell(projectPath)
      .then((id) => setSessions((prev) => [...prev, id]))
      .catch(console.error);
  }, [sessions.length, projectPath]);

  useImperativeHandle(ref, () => ({ addSession }), [addSession]);

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
      className={`grid h-full ${gridClass(sessions.length)} gap-2 bg-maestro-bg p-2`}
    >
      {sessions.map((id) => (
        <TerminalView key={id} sessionId={id} onKill={handleKill} />
      ))}
    </div>
  );
});
