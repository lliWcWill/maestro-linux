import { useState } from "react";
import { ProjectTabs, type ProjectTab } from "./components/shared/ProjectTabs";
import { PreLaunchView } from "./components/shared/PreLaunchView";
import { Sidebar } from "./components/sidebar/Sidebar";
import { TerminalGrid } from "./components/terminal/TerminalGrid";

function App() {
  const [tabs, setTabs] = useState<ProjectTab[]>([]);

  const activeTab = tabs.find((tab) => tab.active) ?? null;

  const openProject = () => {
    const id = Date.now().toString();
    setTabs((prev) => {
      const nextIndex = prev.length + 1;
      const name = `project-${nextIndex}`;
      return [
        ...prev.map((tab) => ({ ...tab, active: false })),
        { id, name, active: true },
      ];
    });
  };

  const selectTab = (id: string) => {
    setTabs((prev) => prev.map((tab) => ({ ...tab, active: tab.id === id })));
  };

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const remaining = prev.filter((tab) => tab.id !== id);
      if (remaining.length === 0) return [];
      if (remaining.some((tab) => tab.active)) return remaining;
      return remaining.map((tab, index) =>
        index === 0 ? { ...tab, active: true } : tab,
      );
    });
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-maestro-bg">
      {/* Project tab bar */}
      <ProjectTabs
        tabs={tabs}
        onSelectTab={selectTab}
        onCloseTab={closeTab}
        onNewTab={openProject}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main panel */}
        <main className="flex-1 overflow-hidden">
          {activeTab ? (
            <TerminalGrid />
          ) : (
            <PreLaunchView onSelectProject={openProject} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
