import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import confetti from 'canvas-confetti';
import { 
  X, 
  Download, 
  CheckCircle, 
  Sparkles, 
  Loader2
} from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { 
    showExportModal, 
    setShowExportModal, 
    tracks, 
    totalDuration, 
    aspectRatio,
    mediaLibrary 
  } = useEditorStore();

  const [resolution, setResolution] = useState<'1080p' | '4k' | '720p'>('1080p');
  const [fps, setFps] = useState<30 | 60>(30);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  if (!showExportModal) return null;

  // Resolve resolution dimensions
  const getExportDimensions = () => {
    let baseW = 1080;
    let baseH = 1920;

    if (resolution === '4k') {
      baseW = 2160;
      baseH = 3840;
    } else if (resolution === '720p') {
      baseW = 720;
      baseH = 1280;
    }

    if (aspectRatio === '16:9') {
      return { width: baseH, height: baseW };
    } else if (aspectRatio === '1:1') {
      return { width: baseW, height: baseW };
    }
    return { width: baseW, height: baseH };
  };

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setExportComplete(false);

    const { width, height } = getExportDimensions();
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      alert("Eksport uchun Canvas ochib bo'lmadi");
      setIsExporting(false);
      return;
    }

    // Setup MediaRecorder
    const stream = canvas.captureStream(fps);
    const mimeType = 'video/webm;codecs=vp9';
    let recorder: MediaRecorder;

    try {
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 10000000 });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: 'video/webm' });
      const downloadUrl = URL.createObjectURL(finalBlob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `OpenCut_${resolution}_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsExporting(false);
      setExportComplete(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    };

    recorder.start();

    // Cache videos
    const videoMap = new Map<string, HTMLVideoElement>();
    for (const item of mediaLibrary) {
      if (item.type === 'video') {
        const vid = document.createElement('video');
        vid.src = item.url;
        vid.muted = true;
        vid.crossOrigin = 'anonymous';
        videoMap.set(item.id, vid);
      }
    }

    const totalFrames = Math.max(1, Math.round(totalDuration * fps));
    let frame = 0;

    const renderNextFrame = () => {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      const t = frame / fps;
      setProgress(Math.round((frame / totalFrames) * 100));

      // Draw background
      ctx.fillStyle = '#0b0d11';
      ctx.fillRect(0, 0, width, height);

      // Draw active clips
      const visualTracks = [...tracks].reverse();
      for (const track of visualTracks) {
        if (track.hidden) continue;

        const clip = track.clips.find(
          (c) => c.startTime <= t && t < c.startTime + c.duration
        );

        if (!clip) continue;

        ctx.save();
        const { scale, positionX, positionY, rotation, opacity } = clip.transform;
        ctx.globalAlpha = opacity;
        ctx.translate(width / 2 + positionX * (width / 720), height / 2 + positionY * (height / 1280));
        if (rotation !== 0) ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        const { brightness, contrast, saturation, blur } = clip.filters;
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

        if (clip.type === 'video') {
          const vid = videoMap.get(clip.mediaId);
          if (vid && vid.readyState >= 2) {
            ctx.drawImage(vid, -width / 2, -height / 2, width, height);
          } else {
            // Draw clean placeholder if video frame is rendering
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(-width / 2, -height / 2, width, height);
          }
        } else if (clip.type === 'text' && clip.textConfig) {
          const cfg = clip.textConfig;
          const responsiveFontSize = Math.round(cfg.fontSize * (width / 720));
          ctx.font = `${cfg.bold ? 'bold' : 'normal'} ${responsiveFontSize}px ${cfg.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textMetrics = ctx.measureText(cfg.text);
          const padX = 30 * (width / 720);
          const padY = 20 * (width / 720);
          const bgW = textMetrics.width + padX * 2;
          const bgH = responsiveFontSize * 1.5 + padY;

          if (cfg.backgroundColor) {
            ctx.fillStyle = cfg.backgroundColor;
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(-bgW / 2, -bgH / 2, bgW, bgH, 20);
              ctx.fill();
            } else {
              ctx.fillRect(-bgW / 2, -bgH / 2, bgW, bgH);
            }
          }

          ctx.fillStyle = cfg.color;
          ctx.fillText(cfg.text, 0, 0);
        }

        ctx.restore();
      }

      frame++;
      setTimeout(renderNextFrame, 1000 / fps);
    };

    renderNextFrame();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#11141a] border border-[#232936] rounded-2xl shadow-2xl p-6 text-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f242e] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Videoni Eksport Qilish</h3>
              <p className="text-xs text-slate-400">100% Bepul, Cheklovlarsiz va Suv belgisiz (No Watermark)</p>
            </div>
          </div>

          <button
            onClick={() => setShowExportModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181d26]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        {!isExporting && !exportComplete ? (
          <div className="space-y-4">
            {/* Resolution */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300">Video Sifati (Resolution):</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '720p', label: '720p HD', desc: 'Tez eksport' },
                  { id: '1080p', label: '1080p Full HD', desc: 'Tavsiya etiladi' },
                  { id: '4k', label: '4K Ultra HD', desc: 'CapCut Pro bepul' },
                ].map((res) => (
                  <button
                    key={res.id}
                    onClick={() => setResolution(res.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      resolution === res.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-sm'
                        : 'border-[#232936] bg-[#161a22] text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-bold text-xs">{res.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{res.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* FPS */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300">Kadrlar soni (FPS):</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { fpsVal: 30, label: '30 FPS', desc: 'Standart silliqlik' },
                  { fpsVal: 60, label: '60 FPS', desc: 'Ultra silliq harakat' },
                ].map((item) => (
                  <button
                    key={item.fpsVal}
                    onClick={() => setFps(item.fpsVal as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      fps === item.fpsVal
                        ? 'border-cyan-500 bg-cyan-500/10 text-white'
                        : 'border-[#232936] bg-[#161a22] text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Free Pro Benefits highlight */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-emerald-300">Suv belgisi qo'yilmaydi!</span>
                <p className="text-[11px] text-slate-400">
                  CapCut kabi yakunda logotip yoki obuna talab qilmaydi.
                </p>
              </div>
            </div>

            <button
              onClick={handleStartExport}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Eksportni Boshlash ({resolution})</span>
            </button>
          </div>
        ) : isExporting ? (
          /* Export in progress */
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <div>
              <h4 className="text-sm font-bold text-white">Video Tayyorlanmoqda...</h4>
              <p className="text-xs text-slate-400 mt-1">
                Freymlar brauzerda to'liq sifat bilan render qilinmoqda
              </p>
            </div>

            <div className="w-full bg-[#181d26] h-3 rounded-full overflow-hidden border border-[#262e3d]">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
              />
            </div>

            <span className="font-mono text-sm font-bold text-cyan-400">{progress}%</span>
          </div>
        ) : (
          /* Export finished */
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Tabriklaymiz! Video muvaffaqiyatli yuklab olindi!</h4>
              <p className="text-xs text-slate-400 mt-1">
                Fayl kompyuteringizning "Yuklamalar" (Downloads) papkasiga saqlandi.
              </p>
            </div>

            <button
              onClick={() => {
                setExportComplete(false);
                setShowExportModal(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              Tahrirlashga qaytish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
