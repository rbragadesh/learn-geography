import { CARDS, DECKS, UNITS, ZONES, currentUnit, deckStats, orderedUnits, unitProgress, type ZoneId } from '../lib/curriculum';
import { Ring, TopBar, go } from '../components/ui';
import { streak, todayLog, useAppState } from '../lib/store';
import { MASTERED_BOX, isDue, type CardState } from '../lib/srs';
import { dayNumber } from '../lib/util';

export function Home() {
  const app = useAppState();
  const today = todayLog();
  const unit = currentUnit(app.settings.focus, app.cards);
  const dueCount = Object.keys(app.cards).filter((c) => CARDS[c] && isDue(app.cards[c], dayNumber())).length;
  const s = streak(app);
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="screen home">
      <header className="home-head">
        <div className="hello">
          <span className="avatar">{app.settings.avatar}</span>
          <div>
            <div className="hello-sub">{hello},</div>
            <div className="hello-name">{app.settings.childName}!</div>
          </div>
        </div>
        <div className="chips">
          <span className="chip-stat" title="Days in a row">🔥 {s}</span>
          <span className="chip-stat" title="Stars">⭐ {app.stars}</span>
        </div>
      </header>

      <button className={`mission-card ${today.mission ? 'done' : ''}`} onClick={() => go('/play/mission')}>
        <div className="mission-emoji">{today.mission ? '✅' : '🎒'}</div>
        <div className="mission-text">
          <div className="mission-title">{today.mission ? 'Adventure done today!' : "Today's Adventure"}</div>
          <div className="mission-sub">
            {today.mission
              ? 'Tap for a bonus round, or explore below.'
              : `Now exploring: ${unit.emoji} ${unit.title}${dueCount ? ` · ${dueCount} to review` : ''}`}
          </div>
        </div>
        <div className="mission-go">{today.mission ? '🔁' : '▶️'}</div>
      </button>

      <div className="zones">
        {ZONES.map((z) => (
          <ZoneTile key={z.id} zone={z.id} cards={app.cards} />
        ))}
      </div>

      <nav className="home-nav">
        <button onClick={() => go('/path')}>
          <span>🗺️</span>Adventure Path
        </button>
        <button onClick={() => go('/passport')}>
          <span>🛂</span>Passport
        </button>
        <button onClick={() => go('/collection')}>
          <span>🏅</span>Stickers
        </button>
        <button onClick={() => go('/parent')}>
          <span>🔒</span>Grown-ups
        </button>
      </nav>
    </div>
  );
}

function ZoneTile({ zone, cards }: { zone: ZoneId; cards: Record<string, CardState> }) {
  const z = ZONES.find((x) => x.id === zone)!;
  const unique = [...new Set(DECKS.filter((d) => d.zone === zone).flatMap((d) => d.cards))];
  const st = deckStats(unique, cards);
  const value = st.total ? (st.mastered + st.known * 0.5) / st.total : 0;
  return (
    <button className="zone-tile" style={{ ['--zone' as string]: z.color }} onClick={() => go(`/zone/${zone}`)}>
      <span className="zone-emoji">{z.emoji}</span>
      <span className="zone-title">{z.title}</span>
      <span className="zone-blurb">{z.blurb}</span>
      <span className="zone-bar">
        <span style={{ width: `${Math.round(value * 100)}%` }} />
      </span>
    </button>
  );
}

export function Zone({ id }: { id: ZoneId }) {
  const app = useAppState();
  const z = ZONES.find((x) => x.id === id);
  if (!z) return null;
  const decks = DECKS.filter((d) => d.zone === id);
  return (
    <div className="screen zone" style={{ ['--zone' as string]: z.color }}>
      <TopBar title={`${z.emoji} ${z.title}`} color={z.color} />
      <div className="deck-list">
        {decks.map((d) => {
          const st = deckStats(d.cards, app.cards);
          const value = st.total ? (st.mastered + st.known * 0.5) / st.total : 0;
          return (
            <button key={d.id} className="deck-card" onClick={() => go(d.screen ? `/${d.screen}` : `/play/${d.id}`)}>
              <span className="deck-emoji">{d.emoji}</span>
              <span className="deck-text">
                <span className="deck-title">{d.title}</span>
                <span className="deck-blurb">{d.blurb}</span>
              </span>
              {d.screen ? (
                <span className="deck-go">▶️</span>
              ) : (
                <Ring value={value} color={z.color}>
                  <span className="ring-num">{st.mastered + st.known}</span>
                </Ring>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Path() {
  const app = useAppState();
  const units = orderedUnits(app.settings.focus);
  const current = currentUnit(app.settings.focus, app.cards);
  return (
    <div className="screen path">
      <TopBar title="🗺️ Adventure Path" />
      <p className="path-intro">Each stop has new things to learn. Your daily adventure walks you along the path!</p>
      <div className="path-list">
        {units.map((u, i) => {
          const p = unitProgress(u, app.cards);
          const started = u.cards.some((c) => app.cards[c]);
          const mastered = u.cards.every((c) => (app.cards[c]?.box ?? 0) >= MASTERED_BOX);
          const isCurrent = u.id === current.id;
          return (
            <button
              key={u.id}
              className={`stone ${isCurrent ? 'current' : ''} ${started ? 'started' : 'locked'} ${i % 2 ? 'right' : 'left'}`}
              onClick={() => go(`/play/unit:${u.id}`)}
            >
              <Ring value={p} size={64} color={mastered ? '#eab308' : '#22c55e'}>
                <span className="stone-emoji">{mastered ? '🏅' : u.emoji}</span>
              </Ring>
              <span className="stone-text">
                <span className="stone-num">Stop {i + 1}</span>
                <span className="stone-title">{u.title}</span>
                {isCurrent && <span className="you-are-here">📍 You are here</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="path-intro small">{UNITS.length} stops · tap any stop to practise it</p>
    </div>
  );
}
