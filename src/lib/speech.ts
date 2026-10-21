// Read-aloud using the browser's built-in voices (works offline on iPad).
// Prefers an Indian English voice so Indian place names sound right.
import { stripEmoji } from './util';

let enabled = true;
let rate = 0.9;
let preferredURI: string | undefined;

export function configureSpeech(opts: { enabled: boolean; rate: number; voiceURI?: string }) {
  enabled = opts.enabled;
  rate = opts.rate;
  preferredURI = opts.voiceURI;
}

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

export function englishVoices(): SpeechSynthesisVoice[] {
  const s = synth();
  if (!s) return [];
  return s.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
}

function chooseVoice(): SpeechSynthesisVoice | undefined {
  const voices = englishVoices();
  if (preferredURI) {
    const v = voices.find((x) => x.voiceURI === preferredURI);
    if (v) return v;
  }
  const byLang = (prefix: string) => voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(prefix));
  for (const lang of ['en-in', 'en-gb', 'en-au', 'en-us']) {
    const list = byLang(lang);
    if (list.length) return list.find((v) => v.localService) ?? list[0];
  }
  return voices[0];
}

export function speak(text: string, force = false) {
  const s = synth();
  if (!s || (!enabled && !force)) return;
  const clean = stripEmoji(text);
  if (!clean) return;
  if (s.speaking || s.pending) s.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  const v = chooseVoice();
  if (v) {
    u.voice = v;
    u.lang = v.lang;
  } else {
    u.lang = 'en-IN';
  }
  u.rate = rate;
  u.pitch = 1.05;
  s.speak(u);
}

export function stopSpeaking() {
  synth()?.cancel();
}

// Voices load asynchronously on iOS/Chrome; touching getVoices early warms the list.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => window.speechSynthesis.getVoices());
}
