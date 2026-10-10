import React, { useState, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import type { MediaItem } from '../../types';
import { 
  Upload, 
  Film, 
  Music, 
  Type, 
  Wand2, 
  Mic, 
  Plus, 
  Trash2, 
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'media' | 'audio' | 'text' | 'filters'>('media');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { 
    mediaLibrary, 
    addMedia, 
    removeMedia, 
    addClipToTrack, 
    addTextClip,
    selectedClipId,
    updateClip
  } = useEditorStore();

  // Handle local file uploads (videos, images, audio)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const isImage = file.type.startsWith('image');

      const type: 'video' | 'audio' | 'image' = isVideo ? 'video' : isAudio ? 'audio' : 'image';

      if (isVideo || isAudio) {
        const mediaElem = document.createElement(isVideo ? 'video' : 'audio');
        mediaElem.src = url;
        mediaElem.onloadedmetadata = () => {
          const item: MediaItem = {
            id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            name: file.name,
            type,
            url,
            duration: mediaElem.duration || 5,
            width: isVideo ? (mediaElem as HTMLVideoElement).videoWidth : undefined,
            height: isVideo ? (mediaElem as HTMLVideoElement).videoHeight : undefined,
            file,
          };
          addMedia(item);
        };
      } else if (isImage) {
        const item: MediaItem = {
          id: 'media-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          type: 'image',
          url,
          duration: 5,
          file,
        };
        addMedia(item);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Microphone recording (Voiceover)
  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const item: MediaItem = {
          id: 'voice-' + Date.now(),
          name: `Ovoz Yozuvi ${new Date().toLocaleTimeString()}.webm`,
          type: 'audio',
          url,
          duration: 5,
        };
        addMedia(item);
        // Automatically add to audio track
        addClipToTrack('track-audio-1', item);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Mikrofonga ruxsat berilmadi yoki mikrofon topilmadi.");
    }
  };

  // Filter presets
  const filterPresets = [
    { name: 'Oddiy (Normal)', filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0 } },
    { name: 'Kino (Cinematic)', filters: { brightness: 95, contrast: 125, saturation: 85, blur: 0 } },
    { name: 'Cyberpunk Neon', filters: { brightness: 110, contrast: 135, saturation: 150, blur: 0 } },
    { name: 'Oq-qora (B&W)', filters: { brightness: 105, contrast: 120, saturation: 0, blur: 0 } },
    { name: 'Issiq Quyosh (Warm)', filters: { brightness: 108, contrast: 105, saturation: 130, blur: 0 } },
    { name: 'Retro VHS', filters: { brightness: 90, contrast: 115, saturation: 80, blur: 1 } },
  ];

  const applyFilterPreset = (preset: typeof filterPresets[0]) => {
    if (!selectedClipId) {
      alert("Iltimos, avval timelinedan biror video klipni tanlang!");
      return;
    }
    updateClip(selectedClipId, { filters: preset.filters });
  };

  return (
    <aside className="w-80 bg-[#11141a] border-r border-[#1f242e] flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Tab navigation */}
      <div className="flex border-b border-[#1f242e] bg-[#0d0f14] p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-all ${
            activeTab === 'media'
              ? 'bg-[#181d26] text-cyan-400 border border-[#262e3d] shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Film className="w-4 h-4 mb-1" />
          <span>Media</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-all ${
            activeTab === 'audio'
              ? 'bg-[#181d26] text-cyan-400 border border-[#262e3d] shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Music className="w-4 h-4 mb-1" />
          <span>Ovoz</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-all ${
            activeTab === 'text'
              ? 'bg-[#181d26] text-cyan-400 border border-[#262e3d] shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Type className="w-4 h-4 mb-1" />
          <span>Matn</span>
        </button>

        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 flex flex-col items-center justify-center py-2 rounded-md text-xs font-medium transition-all ${
            activeTab === 'filters'
              ? 'bg-[#181d26] text-cyan-400 border border-[#262e3d] shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-4 h-4 mb-1" />
          <span>Filtrlar</span>
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="video/*,audio/*,image/*"
              className="hidden"
            />

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#262e3d] hover:border-cyan-500/60 bg-[#161a22]/50 hover:bg-[#181e28] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-200">Fayllarni yuklash</p>
              <p className="text-[11px] text-slate-500 mt-0.5">MP4, WebM, MP3, PNG, JPG</p>
            </div>

            {/* Media list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Kutubxona ({mediaLibrary.length})</span>
              </div>

              {mediaLibrary.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Hozircha hech qanday media yo'q. Yuqoridan fayl yuklang yoki yuqoridagi 'Namunani qaytarish' tugmasini bosing.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {mediaLibrary.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#161a22] border border-[#232936] hover:border-slate-500 rounded-lg p-2 flex flex-col justify-between group transition-all relative overflow-hidden"
                    >
                      <div className="aspect-video bg-[#0b0d11] rounded flex items-center justify-center overflow-hidden mb-2 relative">
                        {item.type === 'video' ? (
                          <video src={item.url} className="w-full h-full object-cover" />
                        ) : item.type === 'audio' ? (
                          <Music className="w-8 h-8 text-cyan-400/80" />
                        ) : (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        )}

                        <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 py-0.5 bg-black/70 rounded text-slate-300">
                          {Math.round(item.duration)}s
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-200 truncate font-medium mb-1.5" title={item.name}>
                        {item.name}
                      </p>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const targetTrack = item.type === 'audio' ? 'track-audio-1' : 'track-video-1';
                            addClipToTrack(targetTrack, item);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 bg-[#232936] hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[10px] font-semibold py-1 rounded transition-colors"
                          title="Timelineda joylashtirish"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Timeline</span>
                        </button>
                        <button
                          onClick={() => removeMedia(item.id)}
                          className="p-1 rounded bg-[#232936] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AUDIO TAB */}
        {activeTab === 'audio' && (
          <div className="space-y-3">
            <div className="bg-[#161a22] border border-[#232936] rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Ovoz Yozish (Voiceover)</h4>
                  <p className="text-[11px] text-slate-400">Mikrofondan to'g'ridan-to'g'ri loyihaga ovoz yozing</p>
                </div>
              </div>

              <button
                onClick={toggleRecording}
                className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-[#232936] hover:bg-[#2b3342] text-slate-200 border border-[#31394a]'
                }`}
              >
                <Mic className={`w-4 h-4 ${isRecording ? 'text-white' : 'text-rose-400'}`} />
                <span>{isRecording ? "Yozishni to'xtatish" : "Ovoz yozishni boshlash"}</span>
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Tezkor musiqa shablonlari</span>
              
              <div
                onClick={() => {
                  const item: MediaItem = {
                    id: 'sample-lively-' + Date.now(),
                    name: 'Energetic Vlog Beat.mp3',
                    type: 'audio',
                    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
                    duration: 15,
                  };
                  addMedia(item);
                  addClipToTrack('track-audio-1', item);
                }}
                className="bg-[#161a22] hover:bg-[#1a202c] border border-[#232936] rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-200">Chill Lofi Beat</p>
                    <p className="text-[10px] text-slate-400">Fon musiqasi</p>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300">Matn shablonlari</span>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => addTextClip('track-text-1', 'SARLAVHA MATNI')}
                className="bg-[#161a22] hover:bg-[#1d232f] border border-[#232936] hover:border-cyan-500/50 rounded-xl p-3 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-white tracking-wide">KATTA SARLAVHA</span>
                  <Plus className="w-4 h-4 text-cyan-400 group-hover:scale-125 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Katta va qalin matn qatlami</p>
              </button>

              <button
                onClick={() => addTextClip('track-text-1', 'Bu yerga tavsif matni yoziladi...')}
                className="bg-[#161a22] hover:bg-[#1d232f] border border-[#232936] hover:border-cyan-500/50 rounded-xl p-3 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Oddiy Tavsif Matni</span>
                  <Plus className="w-4 h-4 text-cyan-400 group-hover:scale-125 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">O'rta o'lchamdagi standart matn</p>
              </button>

              <button
                onClick={() => addTextClip('track-text-1', '🔥 50% CHEGIRMA!')}
                className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 hover:from-amber-500/20 hover:to-rose-500/20 border border-amber-500/30 rounded-xl p-3 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 tracking-wider">🔥 REELS BANNER MATNI</span>
                  <Plus className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Ko'zga tashlanuvchi dinamik sarlavha</p>
              </button>
            </div>
          </div>
        )}

        {/* FILTERS TAB */}
        {activeTab === 'filters' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-300">Rang Filtrlari & LUTlar</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedClipId 
                  ? "Tanlangan klipga filtr berish uchun bosing:"
                  : "Filtr qo'llash uchun avval Timelinedan klipni tanlang"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {filterPresets.map((f, i) => (
                <button
                  key={i}
                  onClick={() => applyFilterPreset(f)}
                  className="bg-[#161a22] hover:bg-[#1d232f] border border-[#232936] hover:border-cyan-500/60 rounded-xl p-3 text-left transition-all flex flex-col justify-between h-20"
                >
                  <span className="text-xs font-semibold text-slate-200">{f.name}</span>
                  <div className="flex items-center gap-1 text-[10px] text-cyan-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Qo'llash</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
