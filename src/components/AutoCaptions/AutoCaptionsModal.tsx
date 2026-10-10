import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import type { TimelineClip } from '../../types';
import { 
  X, 
  Sparkles, 
  Flame, 
  Wand2 
} from 'lucide-react';

export const AutoCaptionsModal: React.FC = () => {
  const { 
    showCaptionsModal, 
    setShowCaptionsModal, 
    tracks, 
    totalDuration
  } = useEditorStore();

  const [selectedStyle, setSelectedStyle] = useState<'cyber' | 'yellow' | 'minimal'>('yellow');
  const [captionPreset, setCaptionPreset] = useState<'viral_uz' | 'custom'>('viral_uz');
  const [customText, setCustomText] = useState(
    "Diqqat bilan tomosha qiling\nBu usulni ko'pchilik bilmaydi\nCapCut pullik bo'lgan edi\nEndi OpenCut bilan bepul ishlang!"
  );

  if (!showCaptionsModal) return null;

  const handleGenerateCaptions = () => {
    const lines = captionPreset === 'viral_uz'
      ? [
          "🔥 DIQQAT BILAN KO'RING!",
          "💡 Bu sirni ko'pchilik bilmaydi",
          "⚡ CapCut Pro endi bepul",
          "🚀 Videoni do'stlarga yuboring!",
        ]
      : customText.split('\n').filter((l) => l.trim().length > 0);

    const stepDuration = Math.min(3, totalDuration / lines.length);

    // Style configs
    const getStyleConfig = (text: string) => {
      if (selectedStyle === 'yellow') {
        return {
          text,
          fontSize: 38,
          fontFamily: 'system-ui',
          color: '#facc15', // Vibrant yellow (TikTok viral style)
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          align: 'center' as const,
          bold: true,
        };
      } else if (selectedStyle === 'cyber') {
        return {
          text,
          fontSize: 40,
          fontFamily: 'system-ui',
          color: '#38bdf8', // Cyan
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          align: 'center' as const,
          bold: true,
        };
      } else {
        return {
          text,
          fontSize: 34,
          fontFamily: 'system-ui',
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          align: 'center' as const,
          bold: false,
        };
      }
    };

    const newClips: TimelineClip[] = lines.map((line, idx) => ({
      id: 'sub-' + Date.now() + '-' + idx,
      mediaId: '',
      trackId: 'track-text-1',
      type: 'text',
      title: line,
      startTime: idx * stepDuration,
      duration: stepDuration,
      trimStart: 0,
      trimEnd: stepDuration,
      speed: 1.0,
      volume: 1.0,
      muted: false,
      transform: {
        scale: 1,
        positionX: 0,
        positionY: 260, // Near bottom like reels/tiktok captions!
        rotation: 0,
        opacity: 1,
      },
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
      },
      chromaKey: {
        enabled: false,
        targetColor: '#00ff00',
        similarity: 35,
        smoothness: 15,
      },
      textConfig: getStyleConfig(line),
    }));

    // Put new clips onto text track
    const textTrack = tracks.find((t) => t.id === 'track-text-1');
    if (textTrack) {
      useEditorStore.setState((state) => ({
        tracks: state.tracks.map((t) =>
          t.id === 'track-text-1' ? { ...t, clips: [...t.clips, ...newClips] } : t
        ),
      }));
    }

    setShowCaptionsModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#11141a] border border-[#232936] rounded-2xl shadow-2xl p-6 text-slate-200 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f242e] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">AI Avtomatik Subtitrlar</h3>
              <p className="text-xs text-slate-400">CapCut Pro-dagi pullik subtitrlar tizimining bepul analogi</p>
            </div>
          </div>

          <button
            onClick={() => setShowCaptionsModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#181d26]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Style Selection */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300">Subtitr Uslubi (Style):</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'yellow', label: '🟡 Sariq Viral', desc: 'TikTok & Reels trend' },
              { id: 'cyber', label: '🔵 Kiber Neon', desc: 'Zamonaviy ko\'k' },
              { id: 'minimal', label: '⚪ Oq Minimal', desc: 'Klassik silliq' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStyle(st.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedStyle === st.id
                    ? 'border-purple-500 bg-purple-500/10 text-white shadow-sm'
                    : 'border-[#232936] bg-[#161a22] text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="font-bold text-xs">{st.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{st.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Caption text mode */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300">Matn manbasi:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCaptionPreset('viral_uz')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                captionPreset === 'viral_uz'
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-[#232936] bg-[#161a22] text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Viral Hook Matnlar</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Avtomatik o'zbekcha trend iboralar</div>
            </button>

            <button
              onClick={() => setCaptionPreset('custom')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                captionPreset === 'custom'
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-[#232936] bg-[#161a22] text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                <span>O'z Matningizni Kiritish</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Har bir qator alohida kadr bo'ladi</div>
            </button>
          </div>

          {captionPreset === 'custom' && (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={4}
              placeholder="Har bir qatorga bittadan gap yozing..."
              className="w-full bg-[#161a22] border border-[#232936] focus:border-purple-500 rounded-xl p-3 text-xs text-slate-200 outline-none"
            />
          )}
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerateCaptions}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Subtitrlarni Timelineda Generatsiya Qilish</span>
        </button>
      </div>
    </div>
  );
};
