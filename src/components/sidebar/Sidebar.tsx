import { useState } from "react";
import {
  Settings,
  Activity,
  Layers,
  GitBranch,
  FileText,
  Server,
  Store,
  Zap,
  Palette,
  Cpu,
  Globe,
  ScrollText,
  Skull,
} from "lucide-react";

type SidebarTab = "config" | "processes";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("config");

  return (
    <aside className="no-select flex w-64 flex-col border-r border-maestro-border bg-maestro-surface">
      {/* Tab switcher */}
      <div className="flex border-b border-maestro-border">
        <button
          onClick={() => setActiveTab("config")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium ${
            activeTab === "config"
              ? "border-b-2 border-maestro-accent text-maestro-accent"
              : "text-maestro-muted hover:text-maestro-text"
          }`}
        >
          <Settings size={13} />
          Config
        </button>
        <button
          onClick={() => setActiveTab("processes")}
          className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium ${
            activeTab === "processes"
              ? "border-b-2 border-maestro-accent text-maestro-accent"
              : "text-maestro-muted hover:text-maestro-text"
          }`}
        >
          <Activity size={13} />
          Processes
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "config" ? <ConfigTab /> : <ProcessesTab />}
      </div>
    </aside>
  );
}

function SidebarSection({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="mb-3 rounded-lg border border-maestro-border bg-maestro-bg p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-maestro-muted">
        <Icon size={12} />
        {label}
      </div>
      <div className="text-[11px] text-maestro-muted/60">
        Placeholder — Phase 2+
      </div>
    </div>
  );
}

function ConfigTab() {
  return (
    <>
      <SidebarSection icon={Layers} label="Presets" />
      <SidebarSection icon={Settings} label="Sessions" />
      <SidebarSection icon={GitBranch} label="Git Info" />
      <SidebarSection icon={FileText} label="CLAUDE.md" />
      <SidebarSection icon={Server} label="MCP Status" />
      <SidebarSection icon={Store} label="Marketplace" />
      <SidebarSection icon={Zap} label="Quick Actions" />
      <SidebarSection icon={Palette} label="Theme" />
    </>
  );
}

function ProcessesTab() {
  return (
    <>
      <SidebarSection icon={Cpu} label="Agent Status" />
      <SidebarSection icon={Globe} label="Dev Servers" />
      <SidebarSection icon={ScrollText} label="Output Logs" />
      <SidebarSection icon={Skull} label="Orphan Cleanup" />
    </>
  );
}
