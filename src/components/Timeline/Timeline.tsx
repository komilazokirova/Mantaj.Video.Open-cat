import React, { useRef, useState, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import type { TimelineClip } from '../../types';
import { 
  Scissors, 
  MousePointer, 
  ZoomIn, 
  ZoomOut, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Film, 
  Music, 
  Type, 
  Split 
} from 'lucide-react';

export const Timeline: React.FC = () => {
  const {
    tracks,
    currentTime,
    totalDuration,
    zoom,
    activeTool,
    selectedClipId,
    setCurrentTime,
    setZoom,
    setActiveTool,
    setSelectedClipId,
    splitClip,
    moveClip,
    trimClip,
    deleteClip,
    toggleTrackMute,
    toggleTrackHide,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lanesRef = useRef<HTMLDivElement | null>(null);

  // Dragging state for clips and playhead
  const [draggingClip, setDraggingClip] = useState<{
    clipId: string;
    startX: number;
    initialStartTime: number;
  } | null>(null);

  const [trimmingClip, setTrimmingClip] = useState<{
    clipId: string;
    edge: 'start' | 'end';
    startX: number;
    initialStartTime: number;
    initialDuration: number;
    initialTrimStart: number;
  } | null>(null);

  const [isScrubbingPlayhead, setIsScrubbingPlayhead] = useState(false);

  // Timeline width in pixels
  const timelinePixelWidth = Math.max(1200, totalDuration * zoom + 300);

  // Ruler tick marks (every 1 second or 2 seconds based on zoom)
  const tickStep = zoom < 40 ? 2 : 1;
  const tickCount = Math.ceil(totalDuration) + 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => i * tickStep);

  // Handle Playhead Scrubbing
  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbingPlayhead(true);
    updatePlayheadFromMouse(e.clientX);
  };

  const updatePlayheadFromMouse = (clientX: number) => {
    if (!lanesRef.current) return;
    const rect = lanesRef.current.getBoundingClientRect();
    const scrollLeft = lanesRef.current.scrollLeft;
    const clickX = clientX - rect.left + scrollLeft;
    const newTime = Math.max(0, Math.min(totalDuration, clickX / zoom));
    setCurrentTime(newTime);
  };

  // Global mousemove and mouseup listeners for smooth dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbingPlayhead) {
        updatePlayheadFromMouse(e.clientX);
      } else if (draggingClip) {
        const deltaX = e.clientX - draggingClip.startX;
        const deltaTime = deltaX / zoom;
        const newStartTime = Math.max(0, draggingClip.initialStartTime + deltaTime);
        moveClip(draggingClip.clipId, newStartTime);
      } else if (trimmingClip) {
        const deltaX = e.clientX - trimmingClip.startX;
        const deltaTime = deltaX / zoom;

        if (trimmingClip.edge === 'end') {
          const newDuration = Math.max(0.3, trimmingClip.initialDuration + deltaTime);
          trimClip(
            trimmingClip.clipId,
            trimmingClip.initialStartTime,
            newDuration,
            trimmingClip.initialTrimStart
          );
        } else {
          // trimming start edge
          const newStartTime = Math.max(0, trimmingClip.initialStartTime + deltaTime);
          const newDuration = Math.max(0.3, trimmingClip.initialDuration - deltaTime);
          const newTrimStart = Math.max(0, trimmingClip.initialTrimStart + deltaTime);
          trimClip(trimmingClip.clipId, newStartTime, newDuration, newTrimStart);
        }
      }
    };

    const handleMouseUp = () => {
      setIsScrubbingPlayhead(false);
      setDraggingClip(null);
      setTrimmingClip(null);
    };

    if (isScrubbingPlayhead || draggingClip || trimmingClip) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbingPlayhead, draggingClip, trimmingClip, zoom, totalDuration]);

  // Handle Clip Click (Razor split or Select)
  const handleClipClick = (clip: TimelineClip, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool === 'razor') {
      // Split clip at current playhead or click position
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickOffsetSec = (e.clientX - rect.left) / zoom;
      const splitTime = clip.startTime + clickOffsetSec;
      splitClip(clip.id, splitTime);
    } else {
      setSelectedClipId(clip.id);
    }
  };

  // Keyboard shortcut for Split (Ctrl+B) and Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        // Split selected clip at playhead
        if (selectedClipId) {
          splitClip(selectedClipId, currentTime);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          deleteClip(selectedClipId);
        }
      } else if (e.key.toLowerCase() === 'c') {
        setActiveTool('razor');
      } else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, currentTime, splitClip, deleteClip, setActiveTool]);

  return (
    <div
      ref={containerRef}
      className="h-72 bg-[#0d0f14] border-t border-[#1f242e] flex flex-col select-none relative z-10"
    >
      {/* 1. Timeline Toolbar */}
      <div className="h-10 bg-[#11141a] border-b border-[#1f242e] px-4 flex items-center justify-between">
        {/* Left tools: Select vs Razor */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTool('select')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              activeTool === 'select'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181d26]'
            }`}
            title="Tanlash asbobi (V tugmasi)"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Tanlash (V)</span>
          </button>

          <button
            onClick={() => setActiveTool('razor')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              activeTool === 'razor'
                ? 'bg-rose-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181d26]'
            }`}
            title="Qirqish asbobi (C tugmasi) - Klipni bosgan joyidan ikkiga bo'ladi"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Kesish (C)</span>
          </button>

          <div className="h-4 w-[1px] bg-[#232936] mx-1" />

          {/* Quick Split at Playhead button */}
          <button
            onClick={() => {
              if (selectedClipId) {
                splitClip(selectedClipId, currentTime);
              }
            }}
            disabled={!selectedClipId}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              selectedClipId
                ? 'bg-[#181d26] hover:bg-[#232936] text-slate-200 border border-[#262e3d]'
                : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Kursor turgan joyidan qirqish (Ctrl+B)"
          >
            <Split className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kursor bo'yicha qirqish</span>
          </button>

          {selectedClipId && (
            <button
              onClick={() => deleteClip(selectedClipId)}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Tanlangan klipni o'chirish (Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right tools: Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(zoom - 10)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-[#181d26]"
            title="Kichiklashtirish"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="25"
            max="120"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-24 h-1 accent-cyan-400 bg-[#232936] rounded cursor-pointer"
          />

          <button
            onClick={() => setZoom(zoom + 10)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-[#181d26]"
            title="Kattalashtirish"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Timeline Area (Track Headers + Lanes) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left sidebar) */}
        <div className="w-48 bg-[#11141a] border-r border-[#1f242e] flex flex-col shrink-0 select-none z-20">
          {/* Header spacer corresponding to ruler */}
          <div className="h-7 border-b border-[#1f242e] px-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>TREKLAR</span>
          </div>

          {/* Tracks list */}
          <div className="flex-1 overflow-y-auto">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-14 border-b border-[#1f242e] px-2.5 flex items-center justify-between text-xs hover:bg-[#161a22] transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="p-1 rounded bg-[#181d26] text-cyan-400 shrink-0">
                    {track.type === 'video' ? (
                      <Film className="w-3.5 h-3.5" />
                    ) : track.type === 'audio' ? (
                      <Music className="w-3.5 h-3.5" />
                    ) : (
                      <Type className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 truncate" title={track.name}>
                    {track.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleTrackMute(track.id)}
                    className="p-1 text-slate-500 hover:text-slate-200 rounded"
                    title={track.muted ? 'Ovozni yoqish' : "Ovozni o'chirish"}
                  >
                    {track.muted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={() => toggleTrackHide(track.id)}
                    className="p-1 text-slate-500 hover:text-slate-200 rounded"
                    title={track.hidden ? "Ko'rsatish" : "Yashirish"}
                  >
                    {track.hidden ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Lanes & Ruler (Right scrollable container) */}
        <div
          ref={lanesRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#0b0d11]"
          onClick={() => setSelectedClipId(null)}
        >
          {/* Scrollable Canvas container */}
          <div style={{ width: `${timelinePixelWidth}px` }} className="relative min-h-full">
            {/* Ruler / Time scale */}
            <div
              onMouseDown={handleRulerMouseDown}
              className="h-7 border-b border-[#1f242e] bg-[#11141a] sticky top-0 z-30 cursor-pointer flex items-center relative"
            >
              {ticks.map((t) => (
                <div
                  key={t}
                  style={{ left: `${t * zoom}px` }}
                  className="absolute top-0 bottom-0 flex flex-col justify-between border-l border-[#262e3d]"
                >
                  <span className="text-[9px] font-mono text-slate-500 pl-1">
                    00:{t.toString().padStart(2, '0')}
                  </span>
                  <div className="w-[1px] h-1.5 bg-[#333d50]" />
                </div>
              ))}
            </div>

            {/* Playhead Needle (Line & Top Handle) */}
            <div
              style={{ left: `${currentTime * zoom}px` }}
              className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 z-40 pointer-events-none transition-none shadow-sm shadow-cyan-400"
            >
              <div className="w-3 h-3 -ml-[5px] -top-1.5 absolute bg-cyan-400 rotate-45 rounded-sm shadow-md" />
            </div>

            {/* Track Lanes */}
            <div className="flex flex-col">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="h-14 border-b border-[#181d26] relative bg-[#0d0f14]/80 flex items-center"
                >
                  {/* Grid background markers */}
                  {ticks.map((t) => (
                    <div
                      key={t}
                      style={{ left: `${t * zoom}px` }}
                      className="absolute top-0 bottom-0 w-[1px] bg-[#141820] pointer-events-none"
                    />
                  ))}

                  {/* Render Clips */}
                  {track.clips.map((clip) => {
                    const isSelected = selectedClipId === clip.id;
                    const clipLeft = clip.startTime * zoom;
                    const clipWidth = Math.max(20, clip.duration * zoom);

                    // Color theme by type
                    let clipBg = 'bg-indigo-600/80 border-indigo-500/80 hover:bg-indigo-600';
                    if (clip.type === 'audio') {
                      clipBg = 'bg-teal-600/80 border-teal-500/80 hover:bg-teal-600';
                    } else if (clip.type === 'text') {
                      clipBg = 'bg-purple-600/80 border-purple-500/80 hover:bg-purple-600';
                    }

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => handleClipClick(clip, e)}
                        onMouseDown={(e) => {
                          if (activeTool === 'select' && e.button === 0) {
                            setSelectedClipId(clip.id);
                            setDraggingClip({
                              clipId: clip.id,
                              startX: e.clientX,
                              initialStartTime: clip.startTime,
                            });
                          }
                        }}
                        style={{
                          left: `${clipLeft}px`,
                          width: `${clipWidth}px`,
                        }}
                        className={`absolute h-10 rounded-md border text-xs px-2.5 flex items-center justify-between cursor-move select-none transition-shadow ${clipBg} ${
                          isSelected ? 'ring-2 ring-cyan-400 border-white shadow-lg shadow-cyan-500/25 z-10' : ''
                        }`}
                      >
                        {/* Left Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setTrimmingClip({
                              clipId: clip.id,
                              edge: 'start',
                              startX: e.clientX,
                              initialStartTime: clip.startTime,
                              initialDuration: clip.duration,
                              initialTrimStart: clip.trimStart,
                            });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2 hover:w-3 bg-white/20 hover:bg-cyan-400 rounded-l cursor-ew-resize transition-all"
                          title="Boshidan qisqartirish (Trim start)"
                        />

                        {/* Clip Content & Title */}
                        <div className="flex items-center gap-1.5 overflow-hidden pointer-events-none pl-1">
                          {clip.type === 'video' && <Film className="w-3 h-3 text-indigo-200 shrink-0" />}
                          {clip.type === 'audio' && <Music className="w-3 h-3 text-teal-200 shrink-0" />}
                          {clip.type === 'text' && <Type className="w-3 h-3 text-purple-200 shrink-0" />}
                          <span className="font-semibold text-[11px] text-white truncate">
                            {clip.textConfig ? clip.textConfig.text : clip.title}
                          </span>
                        </div>

                        {/* Duration badge */}
                        <span className="text-[9px] font-mono text-white/70 pointer-events-none pl-1 shrink-0">
                          {clip.duration.toFixed(1)}s
                        </span>

                        {/* Right Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setTrimmingClip({
                              clipId: clip.id,
                              edge: 'end',
                              startX: e.clientX,
                              initialStartTime: clip.startTime,
                              initialDuration: clip.duration,
                              initialTrimStart: clip.trimStart,
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2 hover:w-3 bg-white/20 hover:bg-cyan-400 rounded-r cursor-ew-resize transition-all"
                          title="Oxiridan qisqartirish (Trim end)"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
