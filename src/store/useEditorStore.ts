import { create } from 'zustand';
import type { AspectRatio, MediaItem, TimelineClip, TimelineTrack } from '../types';
import { getInitialTracks, createSampleVideoBlob, createSampleAudioBlob } from '../utils/sampleMedia';

interface EditorState {
  mediaLibrary: MediaItem[];
  tracks: TimelineTrack[];
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  aspectRatio: AspectRatio;
  zoom: number; // pixels per second
  activeTool: 'select' | 'razor';
  isExporting: boolean;
  showExportModal: boolean;
  showCaptionsModal: boolean;

  // Actions
  addMedia: (media: MediaItem) => void;
  removeMedia: (id: string) => void;
  addClipToTrack: (trackId: string, mediaItem: MediaItem, startTime?: number) => string;
  addTextClip: (trackId?: string, text?: string) => string;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  deleteClip: (clipId: string) => void;
  duplicateClip: (clipId: string) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  moveClip: (clipId: string, newStartTime: number, targetTrackId?: string) => void;
  trimClip: (clipId: string, newStartTime: number, newDuration: number, newTrimStart: number) => void;
  
  setCurrentTime: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setSelectedClipId: (id: string | null) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setZoom: (zoom: number) => void;
  setActiveTool: (tool: 'select' | 'razor') => void;
  setShowExportModal: (show: boolean) => void;
  setShowCaptionsModal: (show: boolean) => void;
  
  toggleTrackMute: (trackId: string) => void;
  toggleTrackLock: (trackId: string) => void;
  toggleTrackHide: (trackId: string) => void;
  
  loadSampleProject: () => Promise<void>;
  getSelectedClip: () => TimelineClip | null;
}

const DEFAULT_TRANSFORM = {
  scale: 1,
  positionX: 0,
  positionY: 0,
  rotation: 0,
  opacity: 1,
};

const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
};

const DEFAULT_CHROMA_KEY = {
  enabled: false,
  targetColor: '#00ff00',
  similarity: 35,
  smoothness: 15,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  mediaLibrary: [],
  tracks: getInitialTracks(),
  currentTime: 0,
  totalDuration: 15,
  isPlaying: false,
  selectedClipId: null,
  aspectRatio: '9:16',
  zoom: 50,
  activeTool: 'select',
  isExporting: false,
  showExportModal: false,
  showCaptionsModal: false,

  addMedia: (media) => {
    set((state) => ({
      mediaLibrary: [media, ...state.mediaLibrary],
    }));
  },

  removeMedia: (id) => {
    set((state) => ({
      mediaLibrary: state.mediaLibrary.filter((m) => m.id !== id),
    }));
  },

  addClipToTrack: (trackId, mediaItem, startTime) => {
    const clipId = 'clip-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const start = startTime !== undefined ? Math.max(0, startTime) : get().currentTime;
    const duration = Math.min(mediaItem.duration || 5, 8);

    const newClip: TimelineClip = {
      id: clipId,
      mediaId: mediaItem.id,
      trackId,
      type: mediaItem.type,
      title: mediaItem.name,
      startTime: start,
      duration,
      trimStart: 0,
      trimEnd: duration,
      speed: 1.0,
      volume: 1.0,
      muted: false,
      transform: { ...DEFAULT_TRANSFORM },
      filters: { ...DEFAULT_FILTERS },
      chromaKey: { ...DEFAULT_CHROMA_KEY },
    };

    set((state) => {
      const updatedTracks = state.tracks.map((t) => {
        if (t.id === trackId) {
          return { ...t, clips: [...t.clips, newClip] };
        }
        return t;
      });

      const maxTime = Math.max(
        state.totalDuration,
        ...updatedTracks.flatMap((t) => t.clips.map((c) => c.startTime + c.duration)),
        15
      );

      return {
        tracks: updatedTracks,
        selectedClipId: clipId,
        totalDuration: maxTime,
      };
    });

    return clipId;
  },

  addTextClip: (trackId = 'track-text-1', text = 'Matn kiriting') => {
    const clipId = 'text-' + Date.now();
    const start = get().currentTime;
    const duration = 3.5;

    const newClip: TimelineClip = {
      id: clipId,
      mediaId: '',
      trackId,
      type: 'text',
      title: text,
      startTime: start,
      duration,
      trimStart: 0,
      trimEnd: duration,
      speed: 1.0,
      volume: 1.0,
      muted: false,
      transform: { ...DEFAULT_TRANSFORM },
      filters: { ...DEFAULT_FILTERS },
      chromaKey: { ...DEFAULT_CHROMA_KEY },
      textConfig: {
        text,
        fontSize: 38,
        fontFamily: 'system-ui',
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        align: 'center',
        bold: true,
      },
    };

    set((state) => {
      const updatedTracks = state.tracks.map((t) => {
        if (t.id === trackId) {
          return { ...t, clips: [...t.clips, newClip] };
        }
        return t;
      });

      const maxTime = Math.max(
        state.totalDuration,
        ...updatedTracks.flatMap((t) => t.clips.map((c) => c.startTime + c.duration)),
        15
      );

      return {
        tracks: updatedTracks,
        selectedClipId: clipId,
        totalDuration: maxTime,
      };
    });

    return clipId;
  },

  updateClip: (clipId, updates) => {
    set((state) => {
      const updatedTracks = state.tracks.map((t) => ({
        ...t,
        clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
      }));

      const maxTime = Math.max(
        ...updatedTracks.flatMap((t) => t.clips.map((c) => c.startTime + c.duration)),
        15
      );

      return {
        tracks: updatedTracks,
        totalDuration: maxTime,
      };
    });
  },

  deleteClip: (clipId) => {
    set((state) => ({
      tracks: state.tracks.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.id !== clipId),
      })),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
    }));
  },

  duplicateClip: (clipId) => {
    const clip = get().getSelectedClip();
    if (!clip || clip.id !== clipId) return;

    const newClip: TimelineClip = {
      ...clip,
      id: 'clip-' + Date.now(),
      startTime: clip.startTime + clip.duration + 0.1,
    };

    set((state) => {
      const updatedTracks = state.tracks.map((t) =>
        t.id === clip.trackId ? { ...t, clips: [...t.clips, newClip] } : t
      );
      return {
        tracks: updatedTracks,
        selectedClipId: newClip.id,
      };
    });
  },

  splitClip: (clipId, splitTime) => {
    set((state) => {
      let found = false;
      const updatedTracks = state.tracks.map((track) => {
        const targetIndex = track.clips.findIndex((c) => c.id === clipId);
        if (targetIndex === -1) return track;

        const clip = track.clips[targetIndex];
        // Split time must be strictly inside clip bounds
        if (splitTime <= clip.startTime + 0.1 || splitTime >= clip.startTime + clip.duration - 0.1) {
          return track;
        }

        found = true;
        const leftDuration = splitTime - clip.startTime;
        const rightDuration = clip.duration - leftDuration;

        const leftClip: TimelineClip = {
          ...clip,
          duration: leftDuration,
          trimEnd: clip.trimStart + leftDuration,
        };

        const rightClip: TimelineClip = {
          ...clip,
          id: 'clip-' + Date.now() + '-split',
          startTime: splitTime,
          duration: rightDuration,
          trimStart: clip.trimStart + leftDuration,
        };

        const nextClips = [...track.clips];
        nextClips.splice(targetIndex, 1, leftClip, rightClip);
        return { ...track, clips: nextClips };
      });

      if (!found) return state;

      return {
        tracks: updatedTracks,
      };
    });
  },

  moveClip: (clipId, newStartTime, targetTrackId) => {
    set((state) => {
      let targetClip: TimelineClip | null = null;
      let sourceTrackId = '';

      for (const track of state.tracks) {
        const found = track.clips.find((c) => c.id === clipId);
        if (found) {
          targetClip = found;
          sourceTrackId = track.id;
          break;
        }
      }

      if (!targetClip) return state;

      const destinationTrackId = targetTrackId || sourceTrackId;
      const clampedStartTime = Math.max(0, newStartTime);

      const updatedTracks = state.tracks.map((track) => {
        if (track.id === sourceTrackId && sourceTrackId !== destinationTrackId) {
          return {
            ...track,
            clips: track.clips.filter((c) => c.id !== clipId),
          };
        }
        if (track.id === destinationTrackId) {
          if (sourceTrackId === destinationTrackId) {
            return {
              ...track,
              clips: track.clips.map((c) =>
                c.id === clipId ? { ...c, startTime: clampedStartTime } : c
              ),
            };
          } else {
            return {
              ...track,
              clips: [
                ...track.clips,
                { ...targetClip!, trackId: destinationTrackId, startTime: clampedStartTime },
              ],
            };
          }
        }
        return track;
      });

      const maxTime = Math.max(
        ...updatedTracks.flatMap((t) => t.clips.map((c) => c.startTime + c.duration)),
        15
      );

      return {
        tracks: updatedTracks,
        totalDuration: maxTime,
      };
    });
  },

  trimClip: (clipId, newStartTime, newDuration, newTrimStart) => {
    set((state) => {
      const updatedTracks = state.tracks.map((t) => ({
        ...t,
        clips: t.clips.map((c) => {
          if (c.id !== clipId) return c;
          return {
            ...c,
            startTime: Math.max(0, newStartTime),
            duration: Math.max(0.2, newDuration),
            trimStart: Math.max(0, newTrimStart),
            trimEnd: Math.max(0, newTrimStart) + Math.max(0.2, newDuration),
          };
        }),
      }));

      return {
        tracks: updatedTracks,
      };
    });
  },

  setCurrentTime: (time) => {
    set({ currentTime: Math.max(0, time) });
  },

  setPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  setSelectedClipId: (id) => {
    set({ selectedClipId: id });
  },

  setAspectRatio: (ratio) => {
    set({ aspectRatio: ratio });
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(15, Math.min(200, zoom)) });
  },

  setActiveTool: (tool) => {
    set({ activeTool: tool });
  },

  setShowExportModal: (show) => {
    set({ showExportModal: show });
  },

  setShowCaptionsModal: (show) => {
    set({ showCaptionsModal: show });
  },

  toggleTrackMute: (trackId) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
    }));
  },

  toggleTrackLock: (trackId) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t)),
    }));
  },

  toggleTrackHide: (trackId) => {
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, hidden: !t.hidden } : t)),
    }));
  },

  getSelectedClip: () => {
    const { tracks, selectedClipId } = get();
    if (!selectedClipId) return null;
    for (const track of tracks) {
      const clip = track.clips.find((c) => c.id === selectedClipId);
      if (clip) return clip;
    }
    return null;
  },

  loadSampleProject: async () => {
    try {
      // 1. Generate 2 dynamic sample videos
      const sample1 = await createSampleVideoBlob('CapCut Pro Clone', '#0f172a', '#3b82f6', 6);
      const sample2 = await createSampleVideoBlob('Dynamic Motion', '#1e1b4b', '#ec4899', 6);
      
      // 2. Generate 1 sample upbeat audio track
      const audioSample = await createSampleAudioBlob(12);

      const mediaItems: MediaItem[] = [
        {
          id: 'media-v1',
          name: 'Summer Vlog Intro.mp4',
          type: 'video',
          url: sample1.url,
          duration: sample1.duration,
          width: 720,
          height: 1280,
        },
        {
          id: 'media-v2',
          name: 'City Lights Clip.mp4',
          type: 'video',
          url: sample2.url,
          duration: sample2.duration,
          width: 720,
          height: 1280,
        },
        {
          id: 'media-a1',
          name: 'Upbeat Background Track.mp3',
          type: 'audio',
          url: audioSample.url,
          duration: audioSample.duration,
        },
      ];

      // Assemble into default tracks
      const initialClipsV1: TimelineClip[] = [
        {
          id: 'clip-v1-1',
          mediaId: 'media-v1',
          trackId: 'track-video-1',
          type: 'video',
          title: 'Summer Vlog Intro',
          startTime: 0,
          duration: 5,
          trimStart: 0,
          trimEnd: 5,
          speed: 1.0,
          volume: 1.0,
          muted: false,
          transform: { ...DEFAULT_TRANSFORM },
          filters: { ...DEFAULT_FILTERS },
          chromaKey: { ...DEFAULT_CHROMA_KEY },
        },
        {
          id: 'clip-v1-2',
          mediaId: 'media-v2',
          trackId: 'track-video-1',
          type: 'video',
          title: 'City Lights Clip',
          startTime: 5,
          duration: 5,
          trimStart: 0,
          trimEnd: 5,
          speed: 1.0,
          volume: 1.0,
          muted: false,
          transform: { ...DEFAULT_TRANSFORM },
          filters: { ...DEFAULT_FILTERS },
          chromaKey: { ...DEFAULT_CHROMA_KEY },
        },
      ];

      const initialClipsAudio: TimelineClip[] = [
        {
          id: 'clip-audio-1',
          mediaId: 'media-a1',
          trackId: 'track-audio-1',
          type: 'audio',
          title: 'Upbeat Background Music',
          startTime: 0,
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          speed: 1.0,
          volume: 0.8,
          muted: false,
          transform: { ...DEFAULT_TRANSFORM },
          filters: { ...DEFAULT_FILTERS },
          chromaKey: { ...DEFAULT_CHROMA_KEY },
        },
      ];

      const initialTextClips: TimelineClip[] = [
        {
          id: 'clip-text-1',
          mediaId: '',
          trackId: 'track-text-1',
          type: 'text',
          title: 'Yozgi Sayohat 2026',
          startTime: 0.5,
          duration: 4,
          trimStart: 0,
          trimEnd: 4,
          speed: 1.0,
          volume: 1.0,
          muted: false,
          transform: { ...DEFAULT_TRANSFORM },
          filters: { ...DEFAULT_FILTERS },
          chromaKey: { ...DEFAULT_CHROMA_KEY },
          textConfig: {
            text: '🔥 CAPCUT PRO BEPUL',
            fontSize: 42,
            fontFamily: 'system-ui',
            color: '#38bdf8',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            align: 'center',
            bold: true,
          },
        },
        {
          id: 'clip-text-2',
          mediaId: '',
          trackId: 'track-text-1',
          type: 'text',
          title: 'Obuna Bo\'ling',
          startTime: 5.5,
          duration: 3.5,
          trimStart: 0,
          trimEnd: 3.5,
          speed: 1.0,
          volume: 1.0,
          muted: false,
          transform: { ...DEFAULT_TRANSFORM },
          filters: { ...DEFAULT_FILTERS },
          chromaKey: { ...DEFAULT_CHROMA_KEY },
          textConfig: {
            text: '✨ Bepul 4K Eksport & Subtitrlar',
            fontSize: 34,
            fontFamily: 'system-ui',
            color: '#f43f5e',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            align: 'center',
            bold: true,
          },
        },
      ];

      set({
        mediaLibrary: mediaItems,
        tracks: [
          {
            id: 'track-text-1',
            name: 'Matn & Subtitrlar',
            type: 'text',
            clips: initialTextClips,
            muted: false,
            locked: false,
            hidden: false,
          },
          {
            id: 'track-video-2',
            name: 'Overlay (V2)',
            type: 'video',
            clips: [],
            muted: false,
            locked: false,
            hidden: false,
          },
          {
            id: 'track-video-1',
            name: 'Asosiy Video (V1)',
            type: 'video',
            clips: initialClipsV1,
            muted: false,
            locked: false,
            hidden: false,
          },
          {
            id: 'track-audio-1',
            name: 'Musiqa (A1)',
            type: 'audio',
            clips: initialClipsAudio,
            muted: false,
            locked: false,
            hidden: false,
          },
        ],
        totalDuration: 12,
        selectedClipId: initialClipsV1[0].id,
      });
    } catch (e) {
      console.error('Error loading sample project:', e);
    }
  },
}));
