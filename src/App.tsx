import { useState, useEffect } from "react";
import { TopBar } from "./components/shared/TopBar";
import { BottomBar } from "./components/shared/BottomBar";
import { Sidebar } from "./components/sidebar/Sidebar";
import { TerminalGrid } from "./components/terminal/TerminalGrid";
import { SessionPodGrid } from "./components/terminal/SessionPodGrid";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useOpenProject } from "@/lib/useOpenProject";

type Theme = "dark" | "light";

function App() {
  const tabs = useWorkspaceStore((s) => s.tabs);
  const handleOpenProject = useOpenProject();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("maestro-theme") as Theme) ?? "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("maestro-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const activeTab = tabs.find((tab) => tab.active) ?? null;

  return (
    <div className="flex h-screen w-screen bg-maestro-bg">
      {/* Sidebar — full height, left edge */}
      <Sidebar
        collapsed={!sidebarOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Right column: top bar + content + bottom bar */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <TopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          branchName={activeTab ? activeTab.name : undefined}
        />

        {/* Main content — always dark */}
        <main className="content-dark flex-1 overflow-hidden bg-maestro-bg">
          {activeTab ? (
            <TerminalGrid
              key={activeTab.id}
              projectPath={activeTab.projectPath}
            />
          ) : (
            <SessionPodGrid sessionCount={4} />
          )}
        </main>

        {/* Bottom action bar */}
        <div className="content-dark">
          <BottomBar
            hasActiveProject={!!activeTab}
            sessionCount={4}
            onSelectDirectory={handleOpenProject}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
