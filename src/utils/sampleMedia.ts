import type { TimelineTrack } from '../types';

// Helper to create synthetic audio tones / melody blob
export async function createSampleAudioBlob(durationSeconds = 10): Promise<{ url: string; duration: number }> {
  const sampleRate = 44100;
  const ctx = new OfflineAudioContext(2, sampleRate * durationSeconds, sampleRate);
  
  // Create an upbeat synth chord progression
  const chords = [
    [261.63, 329.63, 392.00], // C major
    [220.00, 261.63, 329.63], // A minor
    [174.61, 220.00, 261.63], // F major
    [196.00, 246.94, 293.66], // G major
  ];
  
  const chordDuration = 2.5;
  for (let i = 0; i < Math.ceil(durationSeconds / chordDuration); i++) {
    const chord = chords[i % chords.length];
    const startTime = i * chordDuration;
    
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + chordDuration - 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + chordDuration);
    });
  }

  const renderedBuffer = await ctx.startRendering();
  
  // Convert AudioBuffer to WAV blob
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  const url = URL.createObjectURL(wavBlob);
  return { url, duration: durationSeconds };
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // subchunk1size
  setUint16(1);  // PCM
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample
  setUint32(0x61746164); // "data" chunk
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

// Generate an offline animated sample video clip using HTML5 canvas & MediaRecorder
export async function createSampleVideoBlob(title: string, color1: string, color2: string, duration = 6): Promise<{ url: string; duration: number }> {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280; // 9:16 vertical
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Canvas context not available");

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const promise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };
  });

  recorder.start();

  const fps = 30;
  const totalFrames = duration * fps;
  let currentFrame = 0;

  const interval = setInterval(() => {
    if (currentFrame >= totalFrames) {
      clearInterval(interval);
      recorder.stop();
      return;
    }

    const t = currentFrame / fps;
    
    // Draw animated background
    const grad = ctx.createLinearGradient(0, 0, 720, 1280);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 1280);

    // Draw dynamic glowing circles
    const cx = 360 + Math.sin(t * 2) * 120;
    const cy = 640 + Math.cos(t * 2) * 160;
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    // Draw video badge & title
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.roundRect ? ctx.roundRect(60, 480, 600, 320, 24) : ctx.fillRect(60, 480, 600, 320);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 360, 580);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 32px monospace';
    ctx.fillText(`00:0${Math.floor(t)}:${(Math.floor((t % 1) * 30)).toString().padStart(2, '0')}`, 360, 650);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px sans-serif';
    ctx.fillText('⚡ CapCut Pro Sifatida Bepul', 360, 720);

    currentFrame++;
  }, 1000 / fps);

  const videoBlob = await promise;
  const url = URL.createObjectURL(videoBlob);
  return { url, duration };
}

// Initial sample tracks with default clips
export function getInitialTracks(): TimelineTrack[] {
  return [
    {
      id: 'track-text-1',
      name: 'Text & Captions',
      type: 'text',
      clips: [],
      muted: false,
      locked: false,
      hidden: false,
    },
    {
      id: 'track-video-2',
      name: 'Overlay V2',
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
      clips: [],
      muted: false,
      locked: false,
      hidden: false,
    },
    {
      id: 'track-audio-1',
      name: 'Musiqa (A1)',
      type: 'audio',
      clips: [],
      muted: false,
      locked: false,
      hidden: false,
    },
  ];
}
