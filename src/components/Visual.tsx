import { flagOf } from '../data/countries';
import { PLANETS } from '../data/facts';
import type { Visual as V } from '../lib/curriculum';
import { Diagram } from './Diagram';
import { MapView } from './MapView';
import { PlanetBall } from './PlanetBall';

export function Visual({ visual, compact = false }: { visual?: V; compact?: boolean }) {
  if (!visual) return null;
  switch (visual.kind) {
    case 'emoji':
      return <div className={`visual-emoji ${compact ? 'compact' : ''}`}>{visual.value}</div>;
    case 'flag':
      return <div className="visual-flag">{flagOf(visual.iso2)}</div>;
    case 'diagram':
      return (
        <div className="visual-diagram">
          <Diagram id={visual.id} />
        </div>
      );
    case 'planets':
      return (
        <div className="visual-planets">
          <span className="sun-edge" />
          {visual.ids.map((id) => {
            const p = PLANETS.find((x) => x.id === id)!;
            return (
              <div key={id} className="planet-mini">
                <PlanetBall planet={p} size={Math.max(16, Math.min(54, Math.sqrt(p.diameterKm) / 6))} />
                <span>{p.name}</span>
              </div>
            );
          })}
        </div>
      );
    case 'grid':
      return <CompassGrid cells={visual.cells} />;
    case 'map':
      return (
        <div className="visual-map">
          <MapView
            map={visual.map}
            layer={visual.layer}
            highlight={visual.highlight}
            soft={visual.soft}
            focus={visual.focus}
            marker={visual.marker}
            tinyMarkers={visual.map === 'world'}
          />
        </div>
      );
  }
}

function CompassGrid({ cells }: { cells: (string | null)[] }) {
  return (
    <div className="compass-wrap">
      <div className="compass-grid">
        {cells.map((c, i) => (
          <div key={i} className={`cg-cell ${i === 4 ? 'home' : ''} ${c ? '' : 'empty'}`}>
            {c && (
              <>
                <span className="cg-emoji">{c.split(' ')[0]}</span>
                <span className="cg-name">{c.split(' ').slice(1).join(' ')}</span>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mini-compass" aria-hidden>
        <span className="n">N</span>
        <span className="e">E</span>
        <span className="s">S</span>
        <span className="w">W</span>
        <span className="needle">⬆️</span>
      </div>
    </div>
  );
}
