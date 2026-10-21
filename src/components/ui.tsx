import { useEffect, useState, type ReactNode } from 'react';
import { speak } from '../lib/speech';
import { playTap } from '../lib/sound';

export function go(path: string) {
  playTap();
  window.location.hash = path;
}

export function useRoute(): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function TopBar({ title, back = '/', right, color }: { title: string; back?: string | null; right?: ReactNode; color?: string }) {
  return (
    <header className="topbar" style={color ? { ['--zone' as string]: color } : undefined}>
      {back !== null ? (
        <button className="icon-btn" aria-label="Back" onClick={() => go(back)}>
          ⬅️
        </button>
      ) : (
        <span className="icon-spacer" />
      )}
      <h1>{title}</h1>
      <div className="topbar-right">{right ?? <span className="icon-spacer" />}</div>
    </header>
  );
}

export function SpeakButton({ text, label = 'Listen' }: { text: string; label?: string }) {
  return (
    <button className="speak-btn" aria-label={label} onClick={() => speak(text, true)}>
      🔊
    </button>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, background: color }} />
    </div>
  );
}

export function Ring({ value, size = 56, color = '#22c55e', children }: { value: number; size?: number; color?: string; children?: ReactNode }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth={6} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-inner">{children}</div>
    </div>
  );
}

const BURST = ['⭐', '🌟', '✨', '🎉', '💫'];

export function Burst({ trigger, big = false }: { trigger: number; big?: boolean }) {
  const [items, setItems] = useState<{ id: number; x: number; y: number; e: string; d: number }[]>([]);
  useEffect(() => {
    if (!trigger) return;
    const count = big ? 40 : 14;
    const now = Date.now();
    setItems(
      Array.from({ length: count }, (_, i) => ({
        id: now + i,
        x: (Math.random() - 0.5) * (big ? 900 : 420),
        y: -Math.random() * (big ? 700 : 320) - 60,
        e: BURST[i % BURST.length],
        d: Math.random() * 0.25,
      })),
    );
    const t = setTimeout(() => setItems([]), 1400);
    return () => clearTimeout(t);
  }, [trigger, big]);
  if (!items.length) return null;
  return (
    <div className="burst" aria-hidden>
      {items.map((it) => (
        <span key={it.id} style={{ ['--x' as string]: `${it.x}px`, ['--y' as string]: `${it.y}px`, animationDelay: `${it.d}s` }}>
          {it.e}
        </span>
      ))}
    </div>
  );
}
