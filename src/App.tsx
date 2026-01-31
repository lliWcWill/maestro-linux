import { ProjectTabs } from "./components/shared/ProjectTabs";
import { PreLaunchView } from "./components/shared/PreLaunchView";
import { Sidebar } from "./components/sidebar/Sidebar";
import { TerminalGrid } from "./components/terminal/TerminalGrid";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";
import { useOpenProject } from "@/lib/useOpenProject";

function App() {
  const tabs = useWorkspaceStore((s) => s.tabs);
  const selectTab = useWorkspaceStore((s) => s.selectTab);
  const closeTab = useWorkspaceStore((s) => s.closeTab);
  const handleOpenProject = useOpenProject();

  const activeTab = tabs.find((tab) => tab.active) ?? null;

  return (
    <div className="flex h-screen w-screen flex-col bg-maestro-bg">
      {/* Project tab bar */}
      <ProjectTabs
        tabs={tabs}
        onSelectTab={selectTab}
        onCloseTab={closeTab}
        onNewTab={handleOpenProject}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main panel */}
        <main className="flex-1 overflow-hidden">
          {activeTab ? (
            <TerminalGrid
              key={activeTab.id}
              projectPath={activeTab.projectPath}
            />
          ) : (
            <PreLaunchView onSelectProject={handleOpenProject} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
