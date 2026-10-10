import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import type { AspectRatio } from '../../types';
import { 
  Download, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Square, 
  RotateCcw,
  Film
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    aspectRatio, 
    setAspectRatio, 
    setShowExportModal, 
    setShowCaptionsModal,
    loadSampleProject 
  } = useEditorStore();

  const ratios: { id: AspectRatio; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: '9:16', label: '9:16', icon: <Smartphone className="w-3.5 h-3.5" />, desc: 'TikTok / Reels / Shorts' },
    { id: '16:9', label: '16:9', icon: <Monitor className="w-3.5 h-3.5" />, desc: 'YouTube / Gorizontal' },
    { id: '1:1', label: '1:1', icon: <Square className="w-3.5 h-3.5" />, desc: 'Instagram Post' },
  ];

  return (
    <header className="h-14 bg-[#11141a] border-b border-[#1f242e] px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-wide text-white">OpenCut</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30">
                PRO BEPUL
              </span>
            </div>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-[#232936] mx-1" />

        <input
          type="text"
          defaultValue="Mening Yangi Videom"
          className="bg-transparent hover:bg-[#181d26] focus:bg-[#181d26] text-sm text-slate-200 px-2.5 py-1 rounded border border-transparent focus:border-cyan-500/50 outline-none transition-all w-44"
          title="Loyiha nomini o'zgartirish"
        />
      </div>

      {/* Middle: Ratio selector & Quick sample loader */}
      <div className="flex items-center gap-2">
        <div className="bg-[#181d26] p-1 rounded-lg border border-[#232936] flex items-center gap-1">
          {ratios.map((r) => (
            <button
              key={r.id}
              onClick={() => setAspectRatio(r.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                aspectRatio === r.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#232936]'
              }`}
              title={r.desc}
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => loadSampleProject()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#181d26] hover:bg-[#232936] text-slate-300 border border-[#232936] hover:border-slate-600 transition-all"
          title="Tayyor namuna video va musiqalarni qayta yuklash"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Namunani qaytarish</span>
        </button>
      </div>

      {/* Right: AI Subtitles & Export buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setShowCaptionsModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 border border-purple-500/30 transition-all shadow-sm"
          title="Videodagi nutqdan avtomatik subtitr yaratish (CapCut Pro bepul analogi)"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>AI Subtitrlar</span>
        </button>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
        >
          <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          <span>Eksport (4K / 1080p)</span>
        </button>
      </div>
    </header>
  );
};
