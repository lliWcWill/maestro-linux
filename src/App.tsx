import { useState } from "react";
import { ProjectTabs } from "./components/shared/ProjectTabs";
import { PreLaunchView } from "./components/shared/PreLaunchView";
import { Sidebar } from "./components/sidebar/Sidebar";
import { TerminalGrid } from "./components/terminal/TerminalGrid";

function App() {
  const [hasProject, setHasProject] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col bg-maestro-bg">
      {/* Project tab bar */}
      <ProjectTabs />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main panel */}
        <main className="flex-1 overflow-hidden">
          {hasProject ? (
            <TerminalGrid />
          ) : (
            <PreLaunchView onSelectProject={() => setHasProject(true)} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
