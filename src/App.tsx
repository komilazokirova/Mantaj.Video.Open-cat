import React, { useEffect } from 'react';
import { Header } from './components/Header/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { PreviewPlayer } from './components/Player/PreviewPlayer';
import { Inspector } from './components/Inspector/Inspector';
import { Timeline } from './components/Timeline/Timeline';
import { ExportModal } from './components/Export/ExportModal';
import { AutoCaptionsModal } from './components/AutoCaptions/AutoCaptionsModal';
import { useEditorStore } from './store/useEditorStore';

export const App: React.FC = () => {
  const { loadSampleProject } = useEditorStore();

  useEffect(() => {
    // Automatically initialize demo project on first load
    loadSampleProject();
  }, [loadSampleProject]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#090b0e] text-slate-100 flex flex-col select-none">
      {/* 1. Header Navigation */}
      <Header />

      {/* 2. Middle Studio Workspace: Sidebar (Media/Effects) | Preview Player | Inspector */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <PreviewPlayer />
        <Inspector />
      </div>

      {/* 3. Bottom Multi-Track Timeline */}
      <Timeline />

      {/* 4. Modals */}
      <ExportModal />
      <AutoCaptionsModal />
    </div>
  );
};

export default App;
