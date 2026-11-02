"use client";

/**
 * Paper sound effects (Mixkit free sound effects, see public/sounds) played through
 * Web Audio. Audio can only start after a user gesture, so files are fetched and decoded
 * on the first pointer / key press. The mute choice is remembered in localStorage.
 */

export type SoundName = "quick" | "slide" | "turn" | "crinkle" | "tape" | "thunk" | "whoosh";

type Synth = "thunk" | "whoosh";

const FILES: Record<Exclude<SoundName, Synth>, string> = {
  quick: "/sounds/paper-quick.mp3",
  slide: "/sounds/paper-slide.mp3",
  turn: "/sounds/page-turn.mp3",
  crinkle: "/sounds/paper-crinkle.mp3",
  tape: "/sounds/tape.mp3",
};

const VOLUME: Record<SoundName, number> = { quick: 0.45, slide: 0.55, turn: 0.7, crinkle: 0.3, tape: 0.45, thunk: 0.7, whoosh: 0.5 };

const STORAGE_KEY = "hk-sound";
const listeners = new Set<() => void>();
let context: AudioContext | null = null;
const buffers = new Map<SoundName, AudioBuffer>();
const lastPlayed = new Map<SoundName, number>();

export function isMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "off";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? "off" : "on");
  } catch {
    // storage unavailable (private mode): the choice lasts for this page only
  }
  listeners.forEach((listener) => listener());
}

export function subscribeMuted(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Creates the audio context and loads the files. Call from a user gesture. */
export function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!context) {
    context = new AudioContext();
    (Object.keys(FILES) as (keyof typeof FILES)[]).forEach(async (name) => {
      try {
        const data = await (await fetch(FILES[name])).arrayBuffer();
        buffers.set(name, await context!.decodeAudioData(data));
      } catch {
        // a missing sound never breaks the page
      }
    });
  }
  if (context.state === "suspended") void context.resume();
}

/** A soft stamp "thunk": a falling low thump plus a short filtered tick. */
function thunk(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.value = volume;
  out.connect(ctx.destination);

  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  body.type = "sine";
  body.frequency.setValueAtTime(140, now);
  body.frequency.exponentialRampToValueAtTime(48, now + 0.14);
  bodyGain.gain.setValueAtTime(0.9, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  body.connect(bodyGain).connect(out);
  body.start(now);
  body.stop(now + 0.2);

  const noise = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
  const tick = ctx.createBufferSource();
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1800;
  tick.buffer = noise;
  tick.connect(band).connect(out);
  tick.start(now);
}

/** throttle: skip if this sound already played within that many ms (e.g. hover). */
/** A soft airy whoosh: band-passed noise sweeping up then down, for the stamp's flight. */
function whoosh(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const length = 0.55;
  const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * length), ctx.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = noise;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(380, now);
  band.frequency.exponentialRampToValueAtTime(2400, now + length * 0.45);
  band.frequency.exponentialRampToValueAtTime(600, now + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + length * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
  source.connect(band).connect(gain).connect(ctx.destination);
  source.start(now);
  source.stop(now + length);
}

export function playSound(name: SoundName, options: { volume?: number; duration?: number; throttle?: number } = {}) {
  if (typeof window === "undefined") return;
  const now = performance.now();
  if (options.throttle && now - (lastPlayed.get(name) ?? -Infinity) < options.throttle) return;
  lastPlayed.set(name, now);
  // test hook: tests create window.__sounds to record what played
  (window as unknown as { __sounds?: string[] }).__sounds?.push(name);
  if (!context || isMuted()) return;
  const volume = (options.volume ?? 1) * VOLUME[name];
  if (name === "thunk") {
    thunk(context, volume);
    return;
  }
  if (name === "whoosh") {
    whoosh(context, volume);
    return;
  }
  const buffer = buffers.get(name);
  if (!buffer) return;
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  source.playbackRate.value = 1 + (Math.random() - 0.5) * 0.08; // repeats never sound identical
  gain.gain.value = volume;
  source.connect(gain).connect(context.destination);
  source.start(0, 0, options.duration);
}

// ---------- pencil scratch: continuous while drawing, following the pencil's speed ----------
let scratch: { source: AudioBufferSourceNode; band: BiquadFilterNode; gain: GainNode } | null = null;

export function startScratch() {
  if (!context || isMuted() || scratch) return;
  const ctx = context;
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2600;
  band.Q.value = 1.4;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  source.connect(band).connect(gain).connect(ctx.destination);
  source.start();
  scratch = { source, band, gain };
}

/** speed in px per ms: faster strokes scratch louder and a little higher */
export function updateScratch(speed: number) {
  if (!context || !scratch) return;
  const now = context.currentTime;
  const level = Math.min(0.09, 0.015 + speed * 0.05);
  scratch.gain.gain.setTargetAtTime(level, now, 0.03);
  scratch.gain.gain.setTargetAtTime(0, now + 0.08, 0.05); // fades if the pencil stops
  scratch.band.frequency.setTargetAtTime(2200 + Math.min(speed, 3) * 600, now, 0.05);
}

export function stopScratch() {
  if (!context || !scratch) return;
  const { source, gain } = scratch;
  scratch = null;
  gain.gain.setTargetAtTime(0, context.currentTime, 0.03);
  source.stop(context.currentTime + 0.2);
}
