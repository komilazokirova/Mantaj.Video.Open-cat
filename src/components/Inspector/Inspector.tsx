import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { 
  Sliders, 
  Sparkles, 
  Trash2, 
  Copy
} from 'lucide-react';

export const Inspector: React.FC = () => {
  const { 
    getSelectedClip, 
    updateClip, 
    deleteClip, 
    duplicateClip,
    aspectRatio 
  } = useEditorStore();

  const selectedClip = getSelectedClip();
  const [activeTab, setActiveTab] = useState<'transform' | 'color' | 'chroma' | 'audio' | 'text'>('transform');

  if (!selectedClip) {
    return (
      <aside className="w-80 bg-[#11141a] border-l border-[#1f242e] flex flex-col h-[calc(100vh-3.5rem)] p-4 select-none">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs border-b border-[#1f242e] pb-3">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Loyiha Sozlamalari</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#161a22] border border-[#232936] flex items-center justify-center text-slate-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-300">Hech qanday klip tanlanmagan</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Sozlamalarni o'zgartirish uchun pastdagi timelinedan video, rasm yoki matn klipini tanlang.
            </p>
          </div>
          <div className="w-full bg-[#161a22] rounded-lg p-3 text-left border border-[#232936] space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Joriy format:</span>
              <span className="text-cyan-400 font-mono font-medium">{aspectRatio}</span>
            </div>
            <div className="flex justify-between">
              <span>Kadrlar tezligi:</span>
              <span className="text-slate-200 font-mono">30 FPS</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const { transform, filters, chromaKey, textConfig } = selectedClip;

  return (
    <aside className="w-80 bg-[#11141a] border-l border-[#1f242e] flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Top Header with Clip info & Actions */}
      <div className="p-3 border-b border-[#1f242e] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 truncate" title={selectedClip.title}>
            {selectedClip.title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => duplicateClip(selectedClip.id)}
            className="p-1.5 rounded-lg bg-[#181d26] hover:bg-[#232936] text-slate-400 hover:text-white transition-colors"
            title="Nusxa olish (Duplicate)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => deleteClip(selectedClip.id)}
            className="p-1.5 rounded-lg bg-[#181d26] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
            title="O'chirish (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1f242e] bg-[#0d0f14] px-2 py-1 gap-1 text-[11px]">
        <button
          onClick={() => setActiveTab('transform')}
          className={`flex-1 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'transform' ? 'bg-[#181d26] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Harakat
        </button>

        {selectedClip.type === 'video' && (
          <>
            <button
              onClick={() => setActiveTab('color')}
              className={`flex-1 py-1.5 rounded font-medium transition-colors ${
                activeTab === 'color' ? 'bg-[#181d26] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ranglar
            </button>
            <button
              onClick={() => setActiveTab('chroma')}
              className={`flex-1 py-1.5 rounded font-medium transition-colors ${
                activeTab === 'chroma' ? 'bg-[#181d26] text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yashil fon
            </button>
          </>
        )}

        {selectedClip.type === 'text' && (
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'text' ? 'bg-[#181d26] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Matn
          </button>
        )}

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-1.5 rounded font-medium transition-colors ${
            activeTab === 'audio' ? 'bg-[#181d26] text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tezlik
        </button>
      </div>

      {/* Inspector Controls Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TRANSFORM TAB */}
        {activeTab === 'transform' && (
          <div className="space-y-4">
            {/* Scale */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Masshtab (Scale)</span>
                <span className="font-mono text-cyan-400">{Math.round(transform.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.05"
                value={transform.scale}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    transform: { ...transform, scale: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>

            {/* Position X */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Pozitsiya X (Gorizontal)</span>
                <span className="font-mono text-cyan-400">{Math.round(transform.positionX)}px</span>
              </div>
              <input
                type="range"
                min="-400"
                max="400"
                step="5"
                value={transform.positionX}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    transform: { ...transform, positionX: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>

            {/* Position Y */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Pozitsiya Y (Vertikal)</span>
                <span className="font-mono text-cyan-400">{Math.round(transform.positionY)}px</span>
              </div>
              <input
                type="range"
                min="-600"
                max="600"
                step="5"
                value={transform.positionY}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    transform: { ...transform, positionY: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>

            {/* Rotation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Aylantirish (Rotation)</span>
                <span className="font-mono text-cyan-400">{transform.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={transform.rotation}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    transform: { ...transform, rotation: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>

            {/* Opacity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Shaffoflik (Opacity)</span>
                <span className="font-mono text-cyan-400">{Math.round(transform.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={transform.opacity}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    transform: { ...transform, opacity: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>

            {/* Reset button */}
            <button
              onClick={() =>
                updateClip(selectedClip.id, {
                  transform: { scale: 1, positionX: 0, positionY: 0, rotation: 0, opacity: 1 },
                })
              }
              className="w-full py-2 bg-[#181d26] hover:bg-[#232936] text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Harakatni dastlabki holatga qaytarish
            </button>
          </div>
        )}

        {/* COLOR TAB */}
        {activeTab === 'color' && (
          <div className="space-y-4">
            {/* Brightness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Yorug'lik (Brightness)</span>
                <span className="font-mono text-cyan-400">{filters.brightness}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="1"
                value={filters.brightness}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    filters: { ...filters, brightness: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Kontrast (Contrast)</span>
                <span className="font-mono text-cyan-400">{filters.contrast}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="1"
                value={filters.contrast}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    filters: { ...filters, contrast: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">To'yinganlik (Saturation)</span>
                <span className="font-mono text-cyan-400">{filters.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="1"
                value={filters.saturation}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    filters: { ...filters, saturation: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>

            {/* Blur */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Xiralashtirish (Blur)</span>
                <span className="font-mono text-cyan-400">{filters.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={filters.blur}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    filters: { ...filters, blur: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={() =>
                updateClip(selectedClip.id, {
                  filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0 },
                })
              }
              className="w-full py-2 bg-[#181d26] hover:bg-[#232936] text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Ranglarni dastlabki holatga qaytarish
            </button>
          </div>
        )}

        {/* CHROMA KEY TAB (CapCut Pro Bepul) */}
        {activeTab === 'chroma' && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-emerald-300">Pro Imkoniyat: Bepul Xromakey</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Yashil yoki bir xil rangli fonni to'g'ridan-to'g'ri brauzerda tozalash.
                </p>
              </div>
            </div>

            {/* Toggle Enable */}
            <div className="flex items-center justify-between bg-[#161a22] p-3 rounded-xl border border-[#232936]">
              <span className="text-xs font-medium text-slate-200">Xromakeyni yoqish</span>
              <button
                onClick={() =>
                  updateClip(selectedClip.id, {
                    chromaKey: { ...chromaKey, enabled: !chromaKey.enabled },
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  chromaKey.enabled ? 'bg-emerald-500' : 'bg-[#2a303c]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    chromaKey.enabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {chromaKey.enabled && (
              <>
                {/* Target color */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Tozalanuvchi rang:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={chromaKey.targetColor}
                      onChange={(e) =>
                        updateClip(selectedClip.id, {
                          chromaKey: { ...chromaKey, targetColor: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded border border-[#232936] bg-transparent cursor-pointer"
                    />
                    <span className="font-mono text-slate-400">{chromaKey.targetColor}</span>
                  </div>
                </div>

                {/* Similarity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">O'xshashlik chegarasi</span>
                    <span className="font-mono text-emerald-400">{chromaKey.similarity}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="1"
                    value={chromaKey.similarity}
                    onChange={(e) =>
                      updateClip(selectedClip.id, {
                        chromaKey: { ...chromaKey, similarity: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-emerald-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && textConfig && (
          <div className="space-y-4">
            {/* Text Input */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-300">Matn mazmuni:</span>
              <textarea
                value={textConfig.text}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    title: e.target.value,
                    textConfig: { ...textConfig, text: e.target.value },
                  })
                }
                rows={3}
                className="w-full bg-[#161a22] border border-[#232936] focus:border-cyan-500 rounded-lg p-2.5 text-xs text-slate-200 outline-none"
              />
            </div>

            {/* Font size */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Shrift o'lchami</span>
                <span className="font-mono text-cyan-400">{textConfig.fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="96"
                step="2"
                value={textConfig.fontSize}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    textConfig: { ...textConfig, fontSize: parseInt(e.target.value) },
                  })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>

            {/* Text Color */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Matn rangi:</span>
              <input
                type="color"
                value={textConfig.color}
                onChange={(e) =>
                  updateClip(selectedClip.id, {
                    textConfig: { ...textConfig, color: e.target.value },
                  })
                }
                className="w-7 h-7 rounded border border-[#232936] bg-transparent cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* AUDIO & SPEED TAB */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            {/* Speed */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Ijro tezligi (Speed)</span>
                <span className="font-mono text-cyan-400">{selectedClip.speed}x</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => updateClip(selectedClip.id, { speed: spd })}
                    className={`py-1.5 rounded text-xs font-semibold transition-all ${
                      selectedClip.speed === spd
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-[#181d26] text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Ovoz balandligi</span>
                <span className="font-mono text-cyan-400">{Math.round(selectedClip.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={selectedClip.volume}
                onChange={(e) =>
                  updateClip(selectedClip.id, { volume: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 h-1.5 bg-[#232936] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
