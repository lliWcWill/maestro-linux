import { useState } from "react";
import {
  Settings,
  Activity,
  GitBranch,
  FileText,
  Server,
  Store,
  Zap,
  Sun,
  Moon,
  Cpu,
  Globe,
  ScrollText,
  Skull,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Eye,
  Play,
  Circle,
  Wrench,
  Check,
} from "lucide-react";

type SidebarTab = "config" | "processes";

interface SidebarProps {
  collapsed?: boolean;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

/* ── Shared card class ── */
const cardClass =
  "rounded-lg border border-maestro-border/60 bg-maestro-card p-3 shadow-[0_1px_4px_rgb(0_0_0/0.15),0_0_0_1px_rgb(255_255_255/0.03)_inset] transition-shadow hover:shadow-[0_2px_8px_rgb(0_0_0/0.25),0_0_0_1px_rgb(255_255_255/0.05)_inset]";

const divider = <div className="h-px bg-maestro-border/30 my-1" />;

/* ================================================================ */
/*  SIDEBAR ROOT                                                     */
/* ================================================================ */

export function Sidebar({ collapsed, theme, onToggleTheme }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("config");

  return (
    <aside
      className={`theme-transition no-select flex h-full flex-col border-r border-maestro-border bg-maestro-surface transition-all duration-200 ease-out ${
        collapsed
          ? "w-0 overflow-hidden border-r-0 opacity-0"
          : "w-60 opacity-100"
      }`}
    >
      {/* Tab switcher */}
      <div className="flex shrink-0 border-b border-maestro-border">
        <button
          onClick={() => setActiveTab("config")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold tracking-wide uppercase ${
            activeTab === "config"
              ? "border-b-2 border-maestro-green text-maestro-green"
              : "text-maestro-muted hover:text-maestro-text"
          }`}
        >
          <Settings size={12} />
          Config
        </button>
        <button
          onClick={() => setActiveTab("processes")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold tracking-wide uppercase ${
            activeTab === "processes"
              ? "border-b-2 border-maestro-accent text-maestro-accent"
              : "text-maestro-muted hover:text-maestro-text"
          }`}
        >
          <Activity size={12} />
          Processes
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3">
        {activeTab === "config" ? (
          <ConfigTab theme={theme} onToggleTheme={onToggleTheme} />
        ) : (
          <ProcessesTab />
        )}
      </div>
    </aside>
  );
}

/* ================================================================ */
/*  SECTION HEADER (reusable)                                        */
/* ================================================================ */

function SectionHeader({
  icon: Icon,
  label,
  breathe = false,
  iconColor,
  badge,
  right,
}: {
  icon: React.ElementType;
  label: string;
  breathe?: boolean;
  iconColor?: string;
  badge?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-maestro-muted">
      <Icon
        size={13}
        className={`${iconColor ?? "text-maestro-muted/80"} ${
          breathe ? "animate-breathe" : ""
        }`}
      />
      <span className="flex-1">{label}</span>
      {badge}
      {right}
    </div>
  );
}

/* ================================================================ */
/*  CONFIG TAB                                                       */
/* ================================================================ */

function ConfigTab({
  theme,
  onToggleTheme,
}: {
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}) {
  return (
    <>
      <GitRepositorySection />
      {divider}
      <ProjectContextSection />
      {divider}
      <SessionsSection />
      {divider}
      <StatusSection />
      {divider}
      <MaestroMCPSection />
      {divider}
      <MCPServersSection />
      {divider}
      <PluginsSection />
      {divider}
      <QuickActionsSection />
      {divider}
      <AppearanceSection theme={theme} onToggle={onToggleTheme} />
    </>
  );
}

/* ── 1. Git Repository ── */

function GitRepositorySection() {
  return (
    <div className={cardClass}>
      <SectionHeader
        icon={GitBranch}
        label="Git Repository"
        iconColor="text-maestro-green"
        right={
          <button className="rounded p-0.5 hover:bg-maestro-border/40">
            <Settings size={12} className="text-maestro-muted" />
          </button>
        }
      />
      {/* User */}
      <div className="flex items-center gap-2 px-1 py-1">
        <span className="h-2 w-2 shrink-0 rounded-full bg-maestro-green" />
        <span className="text-xs font-semibold text-maestro-text truncate">
          Player 2
        </span>
      </div>
      <div className="pl-5 text-[11px] text-maestro-muted truncate">
        domain112@yahoo.com
      </div>
      {/* Origin */}
      <div className="flex items-center gap-2 px-1 py-1 mt-1">
        <span className="h-2 w-2 shrink-0 rounded-full bg-maestro-green" />
        <Check size={10} className="text-maestro-green shrink-0" />
        <span className="text-xs font-semibold text-maestro-text truncate">
          origin
        </span>
      </div>
      <div className="pl-5 text-[11px] text-maestro-muted truncate">
        github.com/user/project
      </div>
    </div>
  );
}

/* ── 2. Project Context ── */

function ProjectContextSection() {
  return (
    <div className={cardClass}>
      <SectionHeader
        icon={FileText}
        label="Project Context"
        iconColor="text-maestro-orange"
        right={
          <button className="rounded p-0.5 hover:bg-maestro-border/40">
            <RefreshCw size={12} className="text-maestro-muted" />
          </button>
        }
      />
      <div className="flex items-center gap-2 px-1 py-1">
        <AlertTriangle size={13} className="text-maestro-orange shrink-0" />
        <span className="text-xs text-maestro-text">No CLAUDE.md</span>
      </div>
      <div className="pl-7 text-[11px] text-maestro-muted">
        Click to create project context file
      </div>
    </div>
  );
}

/* ── 3. Sessions ── */

function SessionsSection() {
  const [expanded, setExpanded] = useState(true);
  const sessions = [
    { id: 1, status: "active" },
    { id: 2, status: "active" },
    { id: 3, status: "active" },
    { id: 4, status: "active" },
  ];

  return (
    <div className={cardClass}>
      <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-maestro-muted">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 hover:text-maestro-text"
        >
          {expanded ? (
            <ChevronDown size={13} className="text-maestro-muted/80" />
          ) : (
            <ChevronRight size={13} className="text-maestro-muted/80" />
          )}
        </button>
        <Bot size={13} className="text-maestro-accent animate-breathe" />
        <span className="flex-1">Sessions</span>
        <span className="bg-maestro-accent/20 text-maestro-accent text-[10px] px-1.5 rounded-full font-bold">
          4
        </span>
      </div>

      {expanded && (
        <div className="space-y-0.5">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-maestro-text hover:bg-maestro-border/40"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-maestro-green" />
              <Bot size={12} className="text-maestro-purple shrink-0" />
              <span className="flex-1 font-medium">#{s.id}</span>
              <ChevronDown size={12} className="text-maestro-muted" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 4. Status ── */

function StatusSection() {
  return (
    <div className={cardClass}>
      <SectionHeader
        icon={Activity}
        label="Status"
        iconColor="text-maestro-accent"
      />
      <div className="space-y-0.5">
        {/* Claude */}
        <div className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-maestro-text">
          <Bot size={12} className="text-maestro-purple shrink-0" />
          <span className="flex-1">Claude:</span>
          <span className="font-semibold text-maestro-text">3</span>
        </div>
        {/* Gemini */}
        <div className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-maestro-text">
          <Sparkles size={12} className="text-maestro-purple shrink-0" />
          <span className="flex-1">Gemini:</span>
          <span className="font-semibold text-maestro-text">1</span>
        </div>
        {/* Idle */}
        <div className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-maestro-text">
          <span className="h-2 w-2 shrink-0 rounded-full bg-maestro-accent" />
          <span className="flex-1">Idle:</span>
          <span className="font-semibold text-maestro-text">2</span>
        </div>
        {/* Working */}
        <div className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-maestro-text">
          <span className="h-2 w-2 shrink-0 rounded-full bg-maestro-green" />
          <span className="flex-1">Working:</span>
          <span className="font-semibold text-maestro-text">1</span>
        </div>
      </div>
    </div>
  );
}

/* ── 5. Maestro MCP ── */

function MaestroMCPSection() {
  return (
    <div className={cardClass}>
      <SectionHeader
        icon={Server}
        label="Maestro MCP"
        iconColor="text-maestro-green"
        right={
          <button className="rounded p-0.5 hover:bg-maestro-border/40">
            <RefreshCw size={12} className="text-maestro-muted" />
          </button>
        }
      />
      <div className="flex items-center gap-2 px-1 py-1">
        <span className="h-2 w-2 shrink-0 rounded-full bg-maestro-green" />
        <span className="text-xs text-maestro-text font-medium">Available</span>
      </div>
      <div className="pl-5 text-[10px] text-maestro-muted truncate">
        /usr/lib/maestro...MCPServer
      </div>
    </div>
  );
}

/* ── 6. MCP Servers ── */

function MCPServersSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cardClass}>
      <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-maestro-muted">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 hover:text-maestro-text"
        >
          {expanded ? (
            <ChevronDown size={13} className="text-maestro-muted/80" />
          ) : (
            <ChevronRight size={13} className="text-maestro-muted/80" />
          )}
        </button>
        <Server size={13} className="text-maestro-muted/80" />
        <span className="flex-1">MCP Servers</span>
        <button className="rounded p-0.5 hover:bg-maestro-border/40">
          <PlusCircle size={12} className="text-maestro-accent" />
        </button>
      </div>

      {expanded && (
        <div className="px-2 py-1 text-[11px] text-maestro-muted/60">
          No MCP servers
        </div>
      )}
      {!expanded && (
        <div className="px-2 py-1 text-[11px] text-maestro-muted/60">
          No MCP servers
        </div>
      )}
    </div>
  );
}

/* ── 7. Plugins & Skills ── */

function PluginsSection() {
  return (
    <div className={cardClass}>
      <SectionHeader
        icon={Store}
        label="Plugins & Skills"
        iconColor="text-maestro-purple"
        right={
          <div className="flex items-center gap-1">
            <button className="rounded p-0.5 hover:bg-maestro-border/40">
              <RefreshCw size={12} className="text-maestro-muted" />
            </button>
            <button className="rounded p-0.5 hover:bg-maestro-border/40">
              <PlusCircle size={12} className="text-maestro-accent" />
            </button>
          </div>
        }
      />
      <div className="px-2 py-1 text-[11px] text-maestro-muted/60">
        No skills installed
      </div>
      <div className="px-2 text-[10px] text-maestro-muted/40">
        Browse marketplace to install plugins
      </div>
    </div>
  );
}

/* ── 8. Quick Actions ── */

function QuickActionsSection() {
  const actions = [
    { label: "Run App", icon: Play, color: "text-maestro-green" },
    { label: "Commit & Push", icon: Circle, color: "text-maestro-accent" },
    { label: "Fix Errors", icon: AlertTriangle, color: "text-maestro-orange" },
    { label: "Lint & Format", icon: Wrench, color: "text-maestro-purple" },
  ];

  return (
    <div className={cardClass}>
      <SectionHeader
        icon={Zap}
        label="Quick Actions"
        iconColor="text-maestro-orange"
        breathe
        right={
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 shrink-0 rounded-full bg-maestro-yellow" />
            <button className="rounded p-0.5 hover:bg-maestro-border/40">
              <Settings size={12} className="text-maestro-muted" />
            </button>
          </div>
        }
      />
      <div className="space-y-0.5">
        {actions.map((a) => (
          <button
            key={a.label}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-xs text-maestro-text transition-colors hover:bg-maestro-border/40"
          >
            <a.icon size={14} className={a.color} />
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── 9. Appearance ── */

function AppearanceSection({
  theme,
  onToggle,
}: {
  theme?: "dark" | "light";
  onToggle?: () => void;
}) {
  const isDark = theme !== "light";

  return (
    <div className={cardClass}>
      <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-maestro-muted">
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
        Appearance
      </div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-xs text-maestro-text transition-colors hover:bg-maestro-border/40"
      >
        {isDark ? (
          <Sun size={14} className="text-maestro-orange" />
        ) : (
          <Moon size={14} className="text-maestro-accent" />
        )}
        <span>{isDark ? "Switch to Light" : "Switch to Dark"}</span>
      </button>
    </div>
  );
}

/* ================================================================ */
/*  PROCESSES TAB                                                    */
/* ================================================================ */

function ProcessesTab() {
  return (
    <>
      <AgentSessionsSection />
      {divider}
      <ProcessTreeSection />
      {divider}
      <OutputStreamsSection />
      {divider}
      <OrphanedProcessesSection />
    </>
  );
}

/* ── 1. Agent Sessions ── */

function AgentSessionsSection() {
  const sessions = [
    { id: 1, model: "Claude", state: "Working", color: "bg-maestro-green" },
    { id: 2, model: "Claude", state: "Idle", color: "bg-maestro-accent" },
    { id: 3, model: "Gemini", state: "Working", color: "bg-maestro-green" },
    { id: 4, model: "Claude", state: "Idle", color: "bg-maestro-accent" },
  ];

  return (
    <div className={cardClass}>
      <SectionHeader
        icon={Cpu}
        label="Agent Sessions"
        iconColor="text-maestro-accent"
        breathe
        badge={
          <span className="bg-maestro-accent/20 text-maestro-accent text-[10px] px-1.5 rounded-full font-bold">
            4
          </span>
        }
      />
      <div className="space-y-0.5">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-maestro-text hover:bg-maestro-border/40"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${s.color}`}
            />
            <span className="flex-1 truncate">
              <span className="font-medium">#{s.id}</span>{" "}
              <span className="text-maestro-muted">{s.model}</span>{" "}
              <span className="text-maestro-muted">-</span>{" "}
              <span
                className={
                  s.state === "Working"
                    ? "text-maestro-green"
                    : "text-maestro-accent"
                }
              >
                {s.state}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 2. Process Tree ── */

function ProcessTreeSection() {
  return (
    <div className={cardClass}>
      <SectionHeader
        icon={Globe}
        label="Process Tree"
        iconColor="text-maestro-muted/80"
      />
      <div className="px-2 py-1 text-[11px] text-maestro-muted/60">
        No running processes
      </div>
    </div>
  );
}

/* ── 3. Output Streams ── */

function OutputStreamsSection() {
  return (
    <div className={cardClass}>
      <SectionHeader
        icon={ScrollText}
        label="Output Streams"
        iconColor="text-maestro-muted/80"
        right={
          <button className="rounded p-0.5 hover:bg-maestro-border/40">
            <Eye size={12} className="text-maestro-muted" />
          </button>
        }
      />
      <div className="px-2 py-1 text-[11px] text-maestro-muted/60">
        No active streams
      </div>
    </div>
  );
}

/* ── 4. Orphaned Processes ── */

function OrphanedProcessesSection() {
  return (
    <div className={cardClass}>
      <SectionHeader
        icon={Skull}
        label="Orphaned Processes"
        iconColor="text-maestro-red"
        right={
          <button className="rounded p-0.5 hover:bg-maestro-border/40">
            <RefreshCw size={12} className="text-maestro-muted" />
          </button>
        }
      />
      <div className="flex items-center gap-2 px-2 py-1">
        <span className="h-2 w-2 shrink-0 rounded-full bg-maestro-green" />
        <span className="text-[11px] text-maestro-muted/60">
          No orphaned processes
        </span>
      </div>
    </div>
  );
}
