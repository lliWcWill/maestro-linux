import { useEffect, useRef, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";

import { writeStdin, resizePty, killSession, onPtyOutput } from "@/lib/terminal";
import { TerminalHeader, type SessionStatus, type AIProvider } from "./TerminalHeader";
import { QuickActionPills } from "./QuickActionPills";
import { useSessionStore, type AiMode, type SessionStatus as BackendStatus } from "@/stores/useSessionStore";

interface TerminalViewProps {
  sessionId: number;
  status?: SessionStatus;
  onKill: (sessionId: number) => void;
}

/** Map backend AiMode to frontend AIProvider */
function mapAiMode(mode: AiMode): AIProvider {
  const map: Record<AiMode, AIProvider> = {
    Claude: "claude",
    Gemini: "gemini",
    Codex: "codex",
    Plain: "plain",
  };
  return map[mode] ?? "claude";
}

/** Map backend SessionStatus to frontend SessionStatus */
function mapStatus(status: BackendStatus): SessionStatus {
  const map: Record<BackendStatus, SessionStatus> = {
    Starting: "starting",
    Idle: "idle",
    Working: "working",
    NeedsInput: "needs-input",
    Done: "done",
    Error: "error",
  };
  return map[status] ?? "idle";
}

/** Map session status to CSS class for border/glow */
function cellStatusClass(status: SessionStatus): string {
  switch (status) {
    case "starting":
      return "terminal-cell-starting";
    case "working":
      return "terminal-cell-working";
    case "needs-input":
      return "terminal-cell-needs-input";
    case "done":
      return "terminal-cell-done";
    case "error":
      return "terminal-cell-error";
    default:
      return "terminal-cell-idle";
  }
}

export function TerminalView({
  sessionId,
  status = "idle",
  onKill,
}: TerminalViewProps) {
  const sessionConfig = useSessionStore((s) =>
    s.sessions.find((sess) => sess.id === sessionId),
  );
  const effectiveStatus = sessionConfig ? mapStatus(sessionConfig.status) : status;
  const effectiveProvider = sessionConfig ? mapAiMode(sessionConfig.mode) : "claude";
  const effectiveBranch = sessionConfig?.branch ?? "Current";
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const handleKill = useCallback(
    (id: number) => {
      killSession(id)
        .then(() => onKill(id))
        .catch((err) => {
          console.error("Failed to kill session:", err);
          onKill(id);
        });
    },
    [onKill],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      theme: {
        background: "#0d1117",
        foreground: "#e6edf3",
        cursor: "#58a6ff",
        selectionBackground: "#264f78",
        black: "#484f58",
        red: "#f85149",
        green: "#3fb950",
        yellow: "#d29922",
        blue: "#58a6ff",
        magenta: "#bc8cff",
        cyan: "#76e3ea",
        white: "#e6edf3",
        brightBlack: "#6e7681",
        brightRed: "#ffa198",
        brightGreen: "#56d364",
        brightYellow: "#e3b341",
        brightBlue: "#79c0ff",
        brightMagenta: "#d2a8ff",
        brightCyan: "#b3f0ff",
        brightWhite: "#f0f6fc",
      },
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);
    term.open(container);

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    requestAnimationFrame(() => {
      try {
        fitAddon.fit();
      } catch {
        // Container may not be sized yet
      }
    });

    const dataDisposable = term.onData((data) => {
      writeStdin(sessionId, data).catch(console.error);
    });

    const resizeDisposable = term.onResize(({ rows, cols }) => {
      resizePty(sessionId, rows, cols).catch(console.error);
    });

    let disposed = false;
    let unlisten: (() => void) | null = null;
    const listenerReady = onPtyOutput(sessionId, (data) => {
      if (!disposed) {
        term.write(data);
      }
    });
    listenerReady
      .then((fn) => {
        if (disposed) {
          fn();
        } else {
          unlisten = fn;
        }
      })
      .catch((err) => {
        if (!disposed) {
          console.error("PTY listener failed:", err);
        }
      });

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (!disposed) {
          try {
            fitAddon.fit();
          } catch {
            // Container may have zero dimensions during layout transitions
          }
        }
      });
    });
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      dataDisposable.dispose();
      resizeDisposable.dispose();
      if (unlisten) unlisten();
      term.dispose();
      termRef.current = null;
      fitAddonRef.current = null;
    };
  }, [sessionId]);

  return (
    <div
      className={`content-dark terminal-cell flex h-full flex-col bg-maestro-bg ${cellStatusClass(effectiveStatus)}`}
    >
      {/* Rich header bar */}
      <TerminalHeader
        sessionId={sessionId}
        provider={effectiveProvider}
        status={effectiveStatus}
        branchName={effectiveBranch}
        onKill={handleKill}
      />

      {/* xterm.js container */}
      <div ref={containerRef} className="flex-1 overflow-hidden" />

      {/* Quick action pills */}
      <QuickActionPills />
    </div>
  );
}
