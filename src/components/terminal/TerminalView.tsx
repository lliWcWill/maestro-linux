import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import "@xterm/xterm/css/xterm.css";

import { writeStdin, resizePty, killSession, onPtyOutput } from "@/lib/terminal";

interface TerminalViewProps {
  sessionId: number;
  onKill: (sessionId: number) => void;
}

export function TerminalView({ sessionId, onKill }: TerminalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  const handleKill = useCallback(() => {
    killSession(sessionId).then(() => onKill(sessionId)).catch(console.error);
  }, [sessionId, onKill]);

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

    // Initial fit
    requestAnimationFrame(() => {
      fitAddon.fit();
    });

    // Forward keystrokes to PTY
    const dataDisposable = term.onData((data) => {
      writeStdin(sessionId, data).catch(console.error);
    });

    // Report terminal resize to PTY
    const resizeDisposable = term.onResize(({ rows, cols }) => {
      resizePty(sessionId, rows, cols).catch(console.error);
    });

    // Listen for PTY output events from Tauri backend.
    // Track disposal to guard against writes after cleanup and handle
    // the race where cleanup runs before the listen promise resolves.
    let disposed = false;
    let unlisten: (() => void) | null = null;
    const listenerReady = onPtyOutput(sessionId, (data) => {
      if (!disposed) {
        term.write(data);
      }
    });
    listenerReady.then((fn) => {
      if (disposed) {
        // Component already unmounted — clean up immediately
        fn();
      } else {
        unlisten = fn;
      }
    });

    // ResizeObserver for container fit
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (!disposed) {
          fitAddon.fit();
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
    <div className="flex flex-col bg-maestro-bg h-full">
      {/* Session header */}
      <div className="no-select flex h-7 shrink-0 items-center justify-between border-b border-maestro-border bg-maestro-surface px-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-maestro-green" />
          <span className="rounded bg-maestro-border px-1.5 py-0.5 text-[10px] font-medium text-maestro-text">
            Shell
          </span>
          <span className="text-maestro-muted text-[10px]">#{sessionId}</span>
        </div>
        <button
          onClick={handleKill}
          className="rounded p-0.5 text-maestro-muted hover:bg-maestro-border hover:text-maestro-text"
          title="Kill session"
        >
          <X size={12} />
        </button>
      </div>

      {/* xterm.js container */}
      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  );
}
