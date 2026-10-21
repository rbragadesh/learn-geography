import { useState } from 'react';
import { PLANETS } from '../data/facts';
import { PlanetBall } from '../components/PlanetBall';
import { SpeakButton, TopBar, go } from '../components/ui';
import { speak } from '../lib/speech';

const EXTRAS = [
  { id: 'sun', name: 'The Sun', emoji: '☀️', facts: ['A star - a giant ball of hot glowing gas', 'About 109 Earths would fit across it', 'Its light takes about 8 minutes to reach us'] },
  { id: 'moon', name: 'The Moon', emoji: '🌙', facts: ['Goes around the Earth about once a month', 'Has no air and no light of its own', 'India\'s Chandrayaan-3 landed near its south pole in 2023'] },
  { id: 'pluto', name: 'Pluto', emoji: '🪨', facts: ['A dwarf planet, far beyond Neptune', 'Smaller than our Moon', 'Has a heart-shaped icy plain!'] },
];

export function SolarSystem() {
  const [sel, setSel] = useState<string>('earth');
  const planet = PLANETS.find((p) => p.id === sel);
  const extra = EXTRAS.find((e) => e.id === sel);
  const name = planet?.name ?? extra!.name;
  const facts = planet?.facts ?? extra!.facts;
  const order = planet ? PLANETS.indexOf(planet) + 1 : 0;
  const say = `${name}. ${order ? `Planet number ${order} from the Sun.` : ''} ${facts.join('. ')}.`;

  const choose = (id: string) => {
    setSel(id);
    const p = PLANETS.find((x) => x.id === id);
    const e = EXTRAS.find((x) => x.id === id);
    const n = p?.name ?? e!.name;
    const o = p ? PLANETS.indexOf(p) + 1 : 0;
    speak(`${n}. ${o ? `Planet number ${o} from the Sun.` : ''} ${(p?.facts ?? e!.facts).join('. ')}.`);
  };

  return (
    <div className="screen space-screen">
      <TopBar title="🔭 Solar System" back="/zone/space" />
      <div className="solar-row">
        <button className={`sun ${sel === 'sun' ? 'sel' : ''}`} onClick={() => choose('sun')} aria-label="The Sun" />
        {PLANETS.map((p, i) => (
          <button key={p.id} className={`planet-btn ${sel === p.id ? 'sel' : ''}`} onClick={() => choose(p.id)}>
            <PlanetBall planet={p} size={Math.max(22, Math.min(120, Math.sqrt(p.diameterKm) / 2.9))} />
            <span className="planet-name">
              {i + 1}. {p.name}
            </span>
          </button>
        ))}
        <button className={`planet-btn small ${sel === 'pluto' ? 'sel' : ''}`} onClick={() => choose('pluto')}>
          <span className="pluto" />
          <span className="planet-name">Pluto*</span>
        </button>
      </div>
      <div className="mnemonic">
        🧠 <b>M</b>y <b>V</b>ery <b>E</b>ducated <b>M</b>other <b>J</b>ust <b>S</b>erved <b>U</b>s <b>N</b>oodles
      </div>
      <div className="space-panel" key={sel}>
        <div className="info-head">
          <span className="info-emoji">{extra?.emoji ?? (sel === 'earth' ? '🌍' : '🪐')}</span>
          <div>
            <h2>{name}</h2>
            {order > 0 && <div className="info-sub">Planet #{order} from the Sun</div>}
          </div>
          <SpeakButton text={say} />
        </div>
        <ul>
          {facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <div className="row">
          <button className="btn" onClick={() => choose('moon')}>🌙 The Moon</button>
          <button className="btn primary" onClick={() => go('/play/planet-order')}>🪐 Play: planet order</button>
        </div>
      </div>
      <p className="note-small">Sizes are to scale with each other (except the Sun, which is far too big to fit!). Distances are not to scale.</p>
    </div>
  );
}
