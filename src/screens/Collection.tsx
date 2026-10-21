import { COUNTRIES, COUNTRY_BY_ID, flagOf } from '../data/countries';
import { TopBar, go } from '../components/ui';
import { BADGES, STICKERS, stampedCountries } from '../lib/curriculum';
import { speak } from '../lib/speech';
import { useAppState } from '../lib/store';

export function Passport() {
  const app = useAppState();
  const stamped = stampedCountries(app.cards);
  const mine = app.passport.filter((id) => COUNTRY_BY_ID[id]);
  const earned = stamped.filter((id) => !mine.includes(id));
  const next = COUNTRIES.filter((c) => c.tier === 1 && !stamped.includes(c.id) && !mine.includes(c.id)).slice(0, 12);

  const stamp = (id: string, kind: 'mine' | 'earned' | 'next') => {
    const c = COUNTRY_BY_ID[id];
    return (
      <button key={id} className={`stamp ${kind}`} onClick={() => speak(`${c.name}. ${c.noCapitalQuiz ? '' : `Capital: ${c.capital}.`}`)}>
        <span className="stamp-flag">{flagOf(c.iso2)}</span>
        <span className="stamp-name">{c.name}</span>
        <span className="stamp-cap">{kind === 'next' ? '❔' : c.capital}</span>
      </button>
    );
  };

  return (
    <div className="screen passport">
      <TopBar title="🛂 My Passport" back="/" />
      <div className="passport-book">
        <div className="passport-cover">
          <span className="avatar">{app.settings.avatar}</span>
          <div>
            <div className="passport-name">{app.settings.childName}</div>
            <div className="passport-count">
              {stamped.length} of {COUNTRIES.length} countries learned
            </div>
          </div>
        </div>
        <h3>✈️ Places I've lived and visited</h3>
        <div className="stamps">{mine.map((id) => stamp(id, 'mine'))}</div>
        <h3>🛂 Stamps I've earned</h3>
        <p className="hint">Learn a country's capital, flag and place on the map to earn its stamp.</p>
        {earned.length ? <div className="stamps">{earned.map((id) => stamp(id, 'earned'))}</div> : <p className="hint">No stamps yet - keep exploring!</p>}
        {next.length > 0 && (
          <>
            <h3>🎯 Collect next</h3>
            <div className="stamps">{next.map((c) => stamp(c.id, 'next'))}</div>
            <button className="btn primary" onClick={() => go('/play/world-capitals')}>🌏 Practise countries</button>
          </>
        )}
      </div>
    </div>
  );
}

export function Collection() {
  const app = useAppState();
  const owned = new Set(app.stickers);
  return (
    <div className="screen collection">
      <TopBar title="🏅 Stickers & Badges" back="/" />
      <h3>Sticker book ({owned.size}/{STICKERS.length})</h3>
      <p className="hint">Finish a daily adventure to win a new sticker!</p>
      <div className="sticker-grid">
        {STICKERS.map((s) => (
          <div key={s} className={`sticker ${owned.has(s) ? 'owned' : ''}`}>
            {owned.has(s) ? s : '❔'}
          </div>
        ))}
      </div>
      <h3>Badges</h3>
      <div className="badge-grid">
        {BADGES.map((b) => (
          <div key={b.id} className={`badge ${app.badges[b.id] ? 'owned' : ''}`}>
            <span className="badge-emoji">{app.badges[b.id] ? b.emoji : '🔒'}</span>
            <b>{b.title}</b>
            <small>{b.how}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
