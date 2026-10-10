export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  duration: number; // in seconds
  width?: number;
  height?: number;
  thumbnail?: string;
  file?: File;
}

export interface ClipTransform {
  scale: number;
  positionX: number; // offset in px or %
  positionY: number;
  rotation: number;  // degrees
  opacity: number;   // 0 to 1
}

export interface ClipFilters {
  brightness: number; // 0 to 200, 100 normal
  contrast: number;   // 0 to 200, 100 normal
  saturation: number; // 0 to 200, 100 normal
  blur: number;       // 0 to 20 px
}

export interface ChromaKeyConfig {
  enabled: boolean;
  targetColor: string; // hex like #00ff00
  similarity: number;  // 0 to 100
  smoothness: number;  // 0 to 100
}

export interface TextStyleConfig {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  align: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
}

export interface TimelineClip {
  id: string;
  mediaId: string;
  trackId: string;
  type: 'video' | 'audio' | 'image' | 'text';
  title: string;
  startTime: number;    // timeline position in seconds
  duration: number;     // duration on timeline in seconds
  trimStart: number;    // start offset in source media in seconds
  trimEnd: number;      // end offset in source media in seconds
  speed: number;        // playback speed multiplier (default 1.0)
  volume: number;       // 0.0 to 2.0 (default 1.0)
  muted: boolean;
  noiseReduction?: boolean;
  
  // Visual transformations
  transform: ClipTransform;
  filters: ClipFilters;
  chromaKey: ChromaKeyConfig;
  
  // Text specific
  textConfig?: TextStyleConfig;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  clips: TimelineClip[];
  muted: boolean;
  locked: boolean;
  hidden: boolean;
}

export interface ExportSettings {
  resolution: '720p' | '1080p' | '4k';
  fps: 30 | 60;
  format: 'mp4' | 'webm';
}
