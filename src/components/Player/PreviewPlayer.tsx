import React, { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  Play, 
  Pause, 
  SkipBack, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

export const PreviewPlayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoElementsRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const {
    tracks,
    mediaLibrary,
    currentTime,
    totalDuration,
    isPlaying,
    setCurrentTime,
    setPlaying,
    togglePlay,
    aspectRatio,
  } = useEditorStore();

  const [isMuted, setIsMuted] = useState(false);

  // Get canvas aspect ratio dimensions
  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case '9:16':
        return { width: 720, height: 1280, cssAspect: 'aspect-[9/16]' };
      case '16:9':
        return { width: 1280, height: 720, cssAspect: 'aspect-[16/9]' };
      case '1:1':
        return { width: 1080, height: 1080, cssAspect: 'aspect-square' };
      case '4:5':
        return { width: 1080, height: 1350, cssAspect: 'aspect-[4/5]' };
      default:
        return { width: 720, height: 1280, cssAspect: 'aspect-[9/16]' };
    }
  };

  const { width: canvasWidth, height: canvasHeight, cssAspect } = getCanvasDimensions();

  // Helper to get or create HTMLVideoElement
  const getVideoElement = (mediaId: string): HTMLVideoElement | null => {
    const media = mediaLibrary.find((m) => m.id === mediaId);
    if (!media || media.type !== 'video') return null;

    if (!videoElementsRef.current.has(media.url)) {
      const vid = document.createElement('video');
      vid.src = media.url;
      vid.crossOrigin = 'anonymous';
      vid.muted = true; // Canvas video can be muted to prevent double audio
      vid.playsInline = true;
      videoElementsRef.current.set(media.url, vid);
    }
    return videoElementsRef.current.get(media.url) || null;
  };

  // Helper to get or create HTMLAudioElement for audio tracks
  const getAudioElement = (mediaId: string): HTMLAudioElement | null => {
    const media = mediaLibrary.find((m) => m.id === mediaId);
    if (!media) return null;

    if (!audioElementsRef.current.has(media.url)) {
      const aud = document.createElement('audio');
      aud.src = media.url;
      aud.crossOrigin = 'anonymous';
      audioElementsRef.current.set(media.url, aud);
    }
    return audioElementsRef.current.get(media.url) || null;
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0b0d11';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render layers from bottom to top: Audio (no visual) -> Video tracks (V1, V2) -> Text tracks
    const visualTracks = [...tracks].reverse();

    for (const track of visualTracks) {
      if (track.hidden) continue;

      // Find active clip at currentTime
      const activeClip = track.clips.find(
        (c) => c.startTime <= currentTime && currentTime < c.startTime + c.duration
      );

      if (!activeClip) continue;

      ctx.save();

      // Setup transformations
      const { scale, positionX, positionY, rotation, opacity } = activeClip.transform;
      ctx.globalAlpha = opacity;
      ctx.translate(canvas.width / 2 + positionX, canvas.height / 2 + positionY);
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }
      ctx.scale(scale, scale);

      // Filters (Brightness, Contrast, Saturation, Blur)
      const { brightness, contrast, saturation, blur } = activeClip.filters;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

      // Render Video Clip
      if (activeClip.type === 'video') {
        const vid = getVideoElement(activeClip.mediaId);
        if (vid) {
          const mediaTime = (currentTime - activeClip.startTime) * activeClip.speed + activeClip.trimStart;
          if (Math.abs(vid.currentTime - mediaTime) > 0.15) {
            vid.currentTime = Math.max(0, mediaTime);
          }

          if (vid.readyState >= 2) {
            // Apply Chroma Key if enabled
            if (activeClip.chromaKey && activeClip.chromaKey.enabled) {
              const offCanvas = document.createElement('canvas');
              offCanvas.width = canvas.width;
              offCanvas.height = canvas.height;
              const offCtx = offCanvas.getContext('2d');
              if (offCtx) {
                offCtx.drawImage(vid, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
                const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
                const data = imgData.data;
                const similarityThreshold = (100 - activeClip.chromaKey.similarity) * 0.8;

                for (let i = 0; i < data.length; i += 4) {
                  const r = data[i];
                  const g = data[i + 1];
                  const b = data[i + 2];
                  // Green screen detection using user configurable similarity
                  if (g > 60 && g > r + similarityThreshold && g > b + similarityThreshold) {
                    data[i + 3] = 0; // Transparent
                  }
                }
                offCtx.putImageData(imgData, 0, 0);
                ctx.drawImage(offCanvas, -canvas.width / 2, -canvas.height / 2);
              }
            } else {
              ctx.drawImage(vid, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
            }
          }
        }
      }

      // Render Text Clip
      if (activeClip.type === 'text' && activeClip.textConfig) {
        const cfg = activeClip.textConfig;
        ctx.font = `${cfg.bold ? 'bold' : 'normal'} ${cfg.fontSize}px ${cfg.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textMetrics = ctx.measureText(cfg.text);
        const paddingX = 24;
        const paddingY = 16;
        const bgWidth = textMetrics.width + paddingX * 2;
        const bgHeight = cfg.fontSize * 1.5 + paddingY;

        if (cfg.backgroundColor) {
          ctx.fillStyle = cfg.backgroundColor;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 16);
            ctx.fill();
          } else {
            ctx.fillRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight);
          }
        }

        ctx.fillStyle = cfg.color;
        ctx.fillText(cfg.text, 0, 0);
      }

      ctx.restore();
    }
  }, [tracks, currentTime, canvasWidth, canvasHeight, mediaLibrary]);

  // Playback timer & Audio sync
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        const nextTime = currentTime + delta;
        if (nextTime >= totalDuration) {
          setPlaying(false);
          setCurrentTime(0);
        } else {
          setCurrentTime(nextTime);
        }
      }

      if (isPlaying) {
        animId = requestAnimationFrame(tick);
      }
    };

    if (isPlaying) {
      lastTime = performance.now();
      animId = requestAnimationFrame(tick);
    }

    // Sync Audio
    tracks.forEach((track) => {
      if (track.type === 'audio' && !track.muted && !isMuted) {
        const activeClip = track.clips.find(
          (c) => c.startTime <= currentTime && currentTime < c.startTime + c.duration
        );
        if (activeClip) {
          const aud = getAudioElement(activeClip.mediaId);
          if (aud) {
            aud.volume = Math.min(1, Math.max(0, activeClip.volume));
            const targetAudioTime = currentTime - activeClip.startTime + activeClip.trimStart;
            if (isPlaying) {
              if (aud.paused) {
                aud.currentTime = Math.max(0, targetAudioTime);
                aud.play().catch(() => {});
              }
            } else {
              aud.pause();
            }
          }
        }
      }
    });

    if (!isPlaying) {
      audioElementsRef.current.forEach((aud) => aud.pause());
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, currentTime, totalDuration, tracks, isMuted]);

  // Spacebar hotkey for Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  // Format timecode (00:01:24:12)
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const frames = Math.floor((sec % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#090b0e] flex flex-col items-center justify-between p-4 relative select-none overflow-hidden"
    >
      {/* Top indicator: Aspect ratio & resolution info */}
      <div className="w-full flex items-center justify-between text-[11px] text-slate-500 font-mono px-2">
        <span>Format: {aspectRatio} ({canvasWidth}x{canvasHeight})</span>
        <span>FPS: 30 kadr/soniya</span>
      </div>

      {/* Center Canvas Player Screen */}
      <div className="flex-1 flex items-center justify-center w-full max-h-[calc(100vh-22rem)] my-auto relative">
        <div
          className={`relative ${cssAspect} max-h-full max-w-full rounded-xl overflow-hidden shadow-2xl shadow-black/80 border border-[#1f242e] bg-[#0b0d11]`}
        >
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Quick Play overlay icon when paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 cursor-pointer transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="w-full max-w-xl bg-[#11141a] border border-[#1f242e] rounded-xl px-4 py-2.5 flex items-center justify-between shadow-lg">
        {/* Timecode */}
        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
          <span className="text-cyan-400">{formatTimecode(currentTime)}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{formatTimecode(totalDuration)}</span>
        </div>

        {/* Transport buttons */}
        <div className="flex items-center gap-2">
          {/* Go to start */}
          <button
            onClick={() => setCurrentTime(0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181d26] transition-colors"
            title="Boshiga qaytarish"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Step 1 frame back */}
          <button
            onClick={() => setCurrentTime(Math.max(0, currentTime - 1 / 30))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181d26] transition-colors"
            title="1 kadr orqaga"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            title="Ijro / Pauza (Bo'sh joy tugmasi)"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Step 1 frame forward */}
          <button
            onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 1 / 30))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181d26] transition-colors"
            title="1 kadr oldinga"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mute and Fullscreen */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181d26] transition-colors"
            title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              if (containerRef.current) {
                if (!document.fullscreenElement) {
                  containerRef.current.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181d26] transition-colors"
            title="To'liq ekranga o'tkazish"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
