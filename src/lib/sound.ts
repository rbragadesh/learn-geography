// Tiny synthesized sound effects - no audio files to download.
let ctx: AudioContext | null = null;
let enabled = true;

export function configureSound(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playTap() {
  tone(660, 0, 0.08, 'triangle', 0.06);
}

export function playCorrect() {
  tone(660, 0, 0.12, 'triangle');
  tone(880, 0.1, 0.12, 'triangle');
  tone(1320, 0.2, 0.25, 'triangle');
}

export function playWrong() {
  tone(300, 0, 0.18, 'sine', 0.1);
  tone(240, 0.15, 0.25, 'sine', 0.1);
}

export function playWin() {
  [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.1));
}
