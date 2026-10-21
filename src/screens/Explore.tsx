import { useState } from 'react';
import { CONTINENTS, COUNTRY_BY_ID, OCEANS, flagOf } from '../data/countries';
import { INDIA_PHYSICAL, REGIONS, STATES, STATE_BY_ID } from '../data/india';
import { WORLD_PHYSICAL } from '../data/world';
import type { LonLat } from '../data/types';
import { MapView, nearestOcean, type MapHit } from '../components/MapView';
import { SpeakButton, TopBar } from '../components/ui';
import { stampedCountries, type Layer } from '../lib/curriculum';
import { speak } from '../lib/speech';
import { useAppState } from '../lib/store';

interface Info {
  key: string;
  emoji: string;
  title: string;
  subtitle?: string;
  rows: [string, string][];
  lines: string[];
  say: string;
}

function Seg<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map(([v, label]) => (
        <button key={v} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)}>
      {label}
    </button>
  );
}

function InfoPanel({ info, empty }: { info: Info | null; empty: string }) {
  if (!info) return <div className="info-panel empty">{empty}</div>;
  return (
    <div className="info-panel" key={info.key}>
      <div className="info-head">
        <span className="info-emoji">{info.emoji}</span>
        <div>
          <h2>{info.title}</h2>
          {info.subtitle && <div className="info-sub">{info.subtitle}</div>}
        </div>
        <SpeakButton text={info.say} />
      </div>
      {info.rows.length > 0 && (
        <dl className="info-rows">
          {info.rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {info.lines.map((l, i) => (
        <p key={i}>{l}</p>
      ))}
    </div>
  );
}

function physicalInfo(id: string): Info | null {
  const p = INDIA_PHYSICAL.find((x) => x.id === id) ?? WORLD_PHYSICAL.find((x) => x.id === id);
  if (!p) return null;
  return { key: p.id, emoji: p.emoji, title: p.name, subtitle: p.kind === 'mountains' ? 'Mountain range' : p.kind[0].toUpperCase() + p.kind.slice(1), rows: [], lines: [p.fact], say: `${p.name}. ${p.fact}` };
}

export function IndiaExplorer() {
  const [layer, setLayer] = useState<Layer>('political');
  const [capitals, setCapitals] = useState(false);
  const [names, setNames] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [info, setInfo] = useState<Info | null>(null);

  const onTap = (hit: MapHit) => {
    if (!hit.id) return;
    if (hit.id.startsWith('p:')) {
      const i = physicalInfo(hit.id.slice(2));
      if (i) {
        setSelected(null);
        setInfo(i);
        speak(i.say);
      }
      return;
    }
    const s = STATE_BY_ID[hit.id];
    if (!s) return;
    setSelected(s.id);
    const i: Info = {
      key: s.id,
      emoji: s.emoji,
      title: s.name,
      subtitle: `${s.type === 'state' ? 'State' : 'Union Territory'} · ${REGIONS.find((r) => r.id === s.region)!.name}`,
      rows: [
        ['⭐ Capital', s.capital],
        ['🗣️ Language', s.language],
      ],
      lines: [...(s.capitalNote ? [s.capitalNote] : []), ...s.famousFor.map((f) => `✔️ ${f}`), `💡 ${s.funFact}`],
      say: `${s.name}. The capital is ${s.sayCapital ?? s.capital}. ${s.funFact}`,
    };
    setInfo(i);
    speak(i.say);
  };

  const sel = selected ? STATE_BY_ID[selected] : null;
  const markers: { ll: LonLat; emoji: string; label?: string }[] = capitals
    ? STATES.filter((s, i, all) => all.findIndex((x) => x.capital === s.capital) === i).map((s) => ({ ll: s.capitalLL, emoji: '⭐', label: names ? s.capital : undefined }))
    : sel
      ? [{ ll: sel.capitalLL, emoji: '⭐', label: sel.capital }]
      : [];

  return (
    <div className="screen explorer">
      <TopBar title="🇮🇳 India Explorer" back="/zone/india" />
      <div className="explorer-tools">
        <Seg value={layer} options={[['political', '🗺️ States'], ['physical', '🏞️ Rivers & mountains']]} onChange={setLayer} />
        <Toggle on={capitals} label="⭐ Capitals" onChange={setCapitals} />
        <Toggle on={names} label="🏷️ Names" onChange={setNames} />
      </div>
      <div className="explorer-body">
        <div className="explorer-map">
          <MapView
            map="india"
            layer={layer}
            colorBy={layer === 'political' ? 'region' : 'none'}
            labels={names}
            selected={selected}
            highlight={info && !selected ? [info.key] : []}
            markers={markers}
            physicalTappable={layer === 'physical'}
            onTap={onTap}
          />
        </div>
        <InfoPanel info={info} empty={layer === 'political' ? '👆 Tap any state to learn about it!' : '👆 Tap a river, mountain range, desert or sea!'} />
      </div>
      {layer === 'political' && (
        <div className="legend">
          {REGIONS.map((r) => (
            <span key={r.id}>
              <i style={{ background: r.color }} />
              {r.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorldExplorer() {
  const app = useAppState();
  const [layer, setLayer] = useState<Layer>('political');
  const [names, setNames] = useState(true);
  const [lines, setLines] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const stamped = new Set([...stampedCountries(app.cards), ...app.passport]);

  const show = (i: Info) => {
    setInfo(i);
    speak(i.say);
  };

  const onTap = (hit: MapHit) => {
    if (layer === 'continents') {
      if (hit.id) {
        const c = CONTINENTS.find((x) => x.id === hit.id);
        if (c) {
          setSelected(c.id);
          show({ key: c.id, emoji: c.emoji, title: c.id, subtitle: 'Continent', rows: [['Countries', c.countries]], lines: [c.fact], say: `${c.id}. ${c.fact}` });
        }
      } else if (hit.ll) {
        const o = OCEANS.find((x) => x.id === nearestOcean(hit.ll!))!;
        setSelected(null);
        show({ key: o.id, emoji: '🌊', title: o.name, subtitle: 'Ocean', rows: [], lines: [o.fact], say: `${o.name}. ${o.fact}` });
      }
      return;
    }
    if (!hit.id) return;
    if (hit.id.startsWith('p:')) {
      const i = physicalInfo(hit.id.slice(2));
      if (i) {
        setSelected(null);
        show(i);
      }
      return;
    }
    const c = COUNTRY_BY_ID[hit.id];
    setSelected(hit.id);
    if (!c) {
      show({ key: hit.id, emoji: '📍', title: 'A territory', rows: [], lines: ['This place belongs to another country.'], say: 'This place belongs to another country.' });
      return;
    }
    show({
      key: c.id,
      emoji: flagOf(c.iso2),
      title: c.name,
      subtitle: `${c.continent}${stamped.has(c.id) ? ' · 🛂 In my passport!' : ''}`,
      rows: [['⭐ Capital', c.capital]],
      lines: [...(c.fact ? [`💡 ${c.fact}`] : []), ...(c.capitalNote ? [c.capitalNote] : [])],
      say: `${c.name}. ${c.noCapitalQuiz ? '' : `The capital is ${c.capital}.`} ${c.fact ?? ''}`,
    });
  };

  return (
    <div className="screen explorer">
      <TopBar title="🌏 World Explorer" back="/zone/world" />
      <div className="explorer-tools">
        <Seg
          value={layer}
          options={[['political', '🏳️ Countries'], ['continents', '🌍 Continents & oceans'], ['physical', '🏔️ Rivers & mountains']]}
          onChange={(v) => {
            setLayer(v);
            setSelected(null);
            setInfo(null);
          }}
        />
        <Toggle on={names} label="🏷️ Names" onChange={setNames} />
        <Toggle on={lines} label="〰️ Equator" onChange={setLines} />
      </div>
      <div className="explorer-body world">
        <div className="explorer-map">
          <MapView
            map="world"
            layer={layer}
            colorBy={layer === 'political' ? 'continent' : 'none'}
            labels={names}
            latLines={lines}
            selected={selected}
            highlight={layer === 'continents' && selected ? [selected] : info && info.key.length > 3 && layer === 'physical' ? [info.key] : []}
            soft={layer === 'political' ? app.passport : []}
            tinyMarkers={layer === 'political'}
            physicalTappable={layer === 'physical'}
            onTap={onTap}
          />
        </div>
        <InfoPanel info={info} empty="👆 Tap a country to visit it! Pinch to zoom in on small ones like Singapore." />
      </div>
    </div>
  );
}
