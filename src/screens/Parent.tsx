import { useMemo, useState } from 'react';
import { COUNTRIES, COUNTRY_BY_ID, flagOf } from '../data/countries';
import { STATES } from '../data/india';
import { COMPETITIONS, COVERAGE, SYLLABI } from '../data/syllabus';
import { TopBar } from '../components/ui';
import { CARDS, DECKS, currentUnit, deckStats, orderedUnits, totalCards, unitProgress } from '../lib/curriculum';
import { englishVoices, speak } from '../lib/speech';
import { KNOWN_BOX } from '../lib/srs';
import {
  exportBackup, importBackup, resetProgress, setPassport, streak, updateSettings, useAppState, type AppState, type Focus,
} from '../lib/store';
import { dayKey } from '../lib/util';

type Tab = 'progress' | 'plan' | 'syllabus' | 'settings' | 'backup';

export function Parent() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? <Dashboard /> : <Gate onPass={() => setUnlocked(true)} />;
}

function Gate({ onPass }: { onPass: () => void }) {
  const [q] = useState(() => ({ a: 12 + Math.floor(Math.random() * 8), b: 3 + Math.floor(Math.random() * 7) }));
  const [v, setV] = useState('');
  const [bad, setBad] = useState(false);
  const check = () => {
    if (Number(v) === q.a * q.b) onPass();
    else {
      setBad(true);
      setV('');
    }
  };
  return (
    <div className="screen">
      <TopBar title="🔒 Grown-ups only" />
      <div className="gate">
        <p>Please ask a grown-up to answer:</p>
        <div className="gate-q">
          {q.a} × {q.b} = ?
        </div>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={v}
          onChange={(e) => setV(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          aria-label="Answer"
          autoFocus
        />
        {bad && <p className="bad-text">Not quite - try again.</p>}
        <button className="btn primary big" onClick={check}>
          Open
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [tab, setTab] = useState<Tab>('progress');
  const tabs: [Tab, string][] = [
    ['progress', '📈 Progress'],
    ['plan', '🗓️ Plan'],
    ['syllabus', '📚 Syllabus'],
    ['settings', '⚙️ Settings'],
    ['backup', '💾 Backup'],
  ];
  return (
    <div className="screen parent">
      <TopBar title="👨‍👩‍👧 Grown-ups" />
      <nav className="tabs">
        {tabs.map(([id, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>
      <div className="parent-body">
        {tab === 'progress' && <ProgressTab />}
        {tab === 'plan' && <PlanTab />}
        {tab === 'syllabus' && <SyllabusTab />}
        {tab === 'settings' && <SettingsTab />}
        {tab === 'backup' && <BackupTab />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- progress

function lastDays(n: number): { key: string; label: string; date: Date }[] {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ key: dayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), date: d });
  }
  return out;
}

/** Estimate when every India state/UT capital + map card will have been introduced. */
export function indiaProjection(app: AppState) {
  const units = orderedUnits(app.settings.focus);
  const lastIdx = units.reduce((acc, u, i) => (u.cards.some((c) => c.startsWith('ic:')) ? i : acc), 0);
  const remaining = units.slice(0, lastIdx + 1).flatMap((u) => u.cards).filter((c) => !app.cards[c]).length;
  const studyDays = Math.ceil(remaining / Math.max(1, app.settings.newPerDay));
  const calendarDays = Math.ceil((studyDays * 7) / Math.max(1, app.settings.studyDaysPerWeek));
  const date = new Date();
  date.setDate(date.getDate() + calendarDays);
  return { remaining, studyDays, date };
}

function ProgressTab() {
  const app = useAppState();
  const days = lastDays(14);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const max = Math.max(1, ...days.map((d) => app.days[d.key]?.q ?? 0));
  const week = lastDays(7).map((d) => app.days[d.key]).filter(Boolean);
  const weekQ = week.reduce((a, d) => a + d!.q, 0);
  const weekRight = week.reduce((a, d) => a + d!.right, 0);
  const weekMin = Math.round(week.reduce((a, d) => a + d!.ms, 0) / 60000);
  const studied = Object.values(app.days).filter((d) => d.q > 0).length;
  const seen = Object.keys(app.cards).filter((c) => CARDS[c]);
  const known = seen.filter((c) => app.cards[c].box >= KNOWN_BOX).length;

  const capKnown = STATES.filter((s) => (app.cards[`ic:${s.id}`]?.box ?? 0) >= KNOWN_BOX).length;
  const mapKnown = STATES.filter((s) => (app.cards[`im:${s.id}`]?.box ?? 0) >= KNOWN_BOX).length;
  const proj = indiaProjection(app);

  const weak = seen
    .filter((c) => app.cards[c].wrong > 0)
    .sort((a, b) => app.cards[b].wrong - app.cards[b].right * 0.5 - (app.cards[a].wrong - app.cards[a].right * 0.5))
    .slice(0, 10);

  const mainDecks = DECKS.filter((d) => d.cards.length && d.id !== 'all-capitals');
  const picked = pickedDay ? days.find((d) => d.key === pickedDay) : null;

  return (
    <div className="ptab">
      <div className="tiles">
        <Tile label="Streak" value={`🔥 ${streak(app)} ${streak(app) === 1 ? 'day' : 'days'}`} />
        <Tile label="Days studied" value={String(studied)} />
        <Tile label="Last 7 days" value={`${weekQ} questions · ${weekMin} min`} />
        <Tile label="Accuracy (7 days)" value={weekQ ? `${Math.round((weekRight / weekQ) * 100)}%` : '–'} />
        <Tile label="Facts known" value={`${known} of ${seen.length} started`} sub={`${totalCards()} in the app`} />
        <Tile label="Stars" value={`⭐ ${app.stars}`} />
      </div>

      <section className="card-box">
        <h3>🎯 Semester goal: India's 36 states & UTs</h3>
        <GoalBar label="Capitals known" value={capKnown} total={36} />
        <GoalBar label="Can find on the map" value={mapKnown} total={36} />
        <p>
          {proj.remaining === 0
            ? 'Every state and UT has been introduced. Daily adventures will keep reviewing them until they stick.'
            : `At ${app.settings.newPerDay} new facts a day, ${app.settings.studyDaysPerWeek} days a week, every state and UT will be introduced by about `}
          {proj.remaining > 0 && <b>{proj.date.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</b>}
          {proj.remaining > 0 && ` (${proj.remaining} facts still to introduce, ~${proj.studyDays} study days). Allow about 2 more weeks of reviews after that for them to become solid.`}
        </p>
        {app.settings.focus === 'path' && proj.remaining > 0 && (
          <p className="hint">Want it sooner? Switch the focus to “India first” in Settings, or raise new facts per day.</p>
        )}
      </section>

      <section className="card-box">
        <h3>Questions answered, last 14 days</h3>
        <div className="bars" role="list">
          {days.map((d) => {
            const q = app.days[d.key]?.q ?? 0;
            const isMax = q === max && q > 0;
            return (
              <button
                key={d.key}
                role="listitem"
                className={`bar-col ${pickedDay === d.key ? 'picked' : ''}`}
                onClick={() => setPickedDay(pickedDay === d.key ? null : d.key)}
                aria-label={`${d.date.toDateString()}: ${q} questions`}
                title={`${d.date.toDateString()}: ${q} questions`}
              >
                <span className="bar-val">{isMax || pickedDay === d.key ? q : ''}</span>
                <span className="bar" style={{ height: `${(q / max) * 100}%` }} />
                <span className="bar-day">{d.label}</span>
              </button>
            );
          })}
        </div>
        <p className="hint">
          {picked
            ? `${picked.date.toDateString()}: ${app.days[picked.key]?.q ?? 0} questions, ${app.days[picked.key]?.right ?? 0} right, ${Math.round((app.days[picked.key]?.ms ?? 0) / 60000)} min${app.days[picked.key]?.mission ? ', adventure done ✓' : ''}`
            : 'Tap a bar to see that day.'}
        </p>
        <details>
          <summary>Show as a table</summary>
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Questions</th>
                <th>Right</th>
                <th>Minutes</th>
                <th>Adventure</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const l = app.days[d.key];
                return (
                  <tr key={d.key}>
                    <td>{d.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                    <td>{l?.q ?? 0}</td>
                    <td>{l?.right ?? 0}</td>
                    <td>{Math.round((l?.ms ?? 0) / 60000)}</td>
                    <td>{l?.mission ? '✓' : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </details>
      </section>

      <section className="card-box">
        <h3>Needs more practice</h3>
        {weak.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fact</th>
                <th>Right</th>
                <th>Wrong</th>
              </tr>
            </thead>
            <tbody>
              {weak.map((c) => (
                <tr key={c}>
                  <td>{CARDS[c].label}</td>
                  <td>{app.cards[c].right}</td>
                  <td>{app.cards[c].wrong}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="hint">Nothing yet - mistakes will show up here so you can talk about them together.</p>
        )}
      </section>

      <section className="card-box">
        <h3>Every activity</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Not started</th>
              <th>Learning</th>
              <th>Known</th>
              <th>Mastered</th>
            </tr>
          </thead>
          <tbody>
            {mainDecks.map((d) => {
              const st = deckStats(d.cards, app.cards);
              return (
                <tr key={d.id}>
                  <td>
                    {d.emoji} {d.title}
                  </td>
                  <td>{st.fresh}</td>
                  <td>{st.learning}</td>
                  <td>{st.known}</td>
                  <td>{st.mastered}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="hint">Learning = seen but shaky. Known = right on two separate days. Mastered = right after gaps of 1, 2 and 4 days.</p>
      </section>
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="tile">
      <div className="tile-label">{label}</div>
      <div className="tile-value">{value}</div>
      {sub && <div className="tile-sub">{sub}</div>}
    </div>
  );
}

function GoalBar({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="goal">
      <span className="goal-label">{label}</span>
      <span className="goal-track">
        <span style={{ width: `${(value / total) * 100}%` }} />
      </span>
      <span className="goal-num">
        {value}/{total}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- plan

function PlanTab() {
  const app = useAppState();
  const units = orderedUnits(app.settings.focus);
  const current = currentUnit(app.settings.focus, app.cards);
  return (
    <div className="ptab">
      <section className="card-box">
        <h3>How GeoExplorer teaches</h3>
        <ul className="plain">
          <li><b>One short daily adventure</b> (about 8-10 minutes): a few new facts are taught first, then quizzed, mixed with reviews of older facts.</li>
          <li><b>Spaced repetition:</b> each fact comes back after 1, 2, 4, 8, 16 and 32 days when answered right. A mistake brings it back the next day. This is what makes 36 capitals stick, not cramming.</li>
          <li><b>Read-aloud everything:</b> every question and explanation can be heard (🔊), so reading level is not a barrier.</li>
          <li><b>Maps, not lists:</b> states and countries are always learned with their place on the map.</li>
          <li><b>Free exploring:</b> the map explorers and the zones are open at any time for curiosity-led play.</li>
        </ul>
      </section>
      <section className="card-box">
        <h3>The Adventure Path ({units.length} stops)</h3>
        <p className="hint">The daily adventure introduces new facts from the first unfinished stop. Focus: {app.settings.focus === 'india-first' ? 'India first' : 'balanced mix'}.</p>
        <ol className="unit-list">
          {units.map((u) => {
            const p = unitProgress(u, app.cards);
            return (
              <li key={u.id} className={u.id === current.id ? 'current' : ''}>
                <span>
                  {u.emoji} {u.title}
                </span>
                <span className="unit-meta">
                  {u.cards.length} facts · {Math.round(p * 100)}%{u.id === current.id ? ' · ◀ now' : ''}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
      <section className="card-box">
        <h3>Ideas away from the screen</h3>
        <ul className="plain">
          <li>Put a big India map and a world map on the wall at her eye level. Point to places during dinner talk and news.</li>
          <li>Ask "which state is that?" on trips, in songs, on food packets (Darjeeling tea, Nagpur oranges, Kashmiri saffron).</li>
          <li>Use her own life: the Singapore-Korea-Taiwan-Indonesia flight paths, the weather in each, what money each uses.</li>
          <li>Let her teach you. Explaining a fact out loud is one of the strongest ways to remember it.</li>
        </ul>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- syllabus

function SyllabusTab() {
  return (
    <div className="ptab">
      <section className="card-box">
        <h3>The honest picture</h3>
        <p>
          At Class 1-2, no major board teaches geography as a separate subject - it is folded into EVS or Social Studies, and the content is basic (directions,
          maps, landforms, weather, my neighbourhood). Things like all 36 state capitals, world capitals and planet order are <b>beyond</b> every Grade 1-2
          syllabus. That is fine - young children memorise this kind of material easily - but it means this app goes well past what school will test.
        </p>
      </section>
      {SYLLABI.map((s) => (
        <section className="card-box" key={s.board}>
          <h3>{s.board}</h3>
          <div className="hint">{s.ages}</div>
          <p>{s.reality}</p>
          <ul className="plain">
            {s.topics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      ))}
      <section className="card-box">
        <h3>Where each zone fits</h3>
        <table className="data-table">
          <tbody>
            {COVERAGE.map((c) => (
              <tr key={c.zone}>
                <td>{c.zone}</td>
                <td>{c.strands}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card-box">
        <h3>Competitions - realistic targets</h3>
        <ul className="plain">
          {COMPETITIONS.map((c) => (
            <li key={c.name}>
              <b>{c.name}:</b> {c.fit}
            </li>
          ))}
        </ul>
        <p className="hint">Check each organiser's website for current dates, fees and age cut-offs before registering.</p>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- settings

const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐨', '🐧', '🦄', '🐬', '🦋', '🐢', '🦉', '🐘'];

function SettingsTab() {
  const app = useAppState();
  const s = app.settings;
  const voices = useMemo(() => englishVoices(), []);
  const [addId, setAddId] = useState('');
  return (
    <div className="ptab settings">
      <section className="card-box">
        <h3>Explorer</h3>
        <label className="field">
          <span>Name</span>
          <input value={s.childName} maxLength={20} onChange={(e) => updateSettings({ childName: e.target.value })} />
        </label>
        <div className="field">
          <span>Avatar</span>
          <div className="avatar-pick">
            {AVATARS.map((a) => (
              <button key={a} className={a === s.avatar ? 'on' : ''} onClick={() => updateSettings({ avatar: a })}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="card-box">
        <h3>Learning pace</h3>
        <label className="field">
          <span>New facts per day: {s.newPerDay}</span>
          <input type="range" min={2} max={12} value={s.newPerDay} onChange={(e) => updateSettings({ newPerDay: Number(e.target.value) })} />
        </label>
        <label className="field">
          <span>Questions per adventure: {s.sessionLength}</span>
          <input type="range" min={6} max={20} value={s.sessionLength} onChange={(e) => updateSettings({ sessionLength: Number(e.target.value) })} />
        </label>
        <label className="field">
          <span>Study days per week (for planning): {s.studyDaysPerWeek}</span>
          <input type="range" min={3} max={7} value={s.studyDaysPerWeek} onChange={(e) => updateSettings({ studyDaysPerWeek: Number(e.target.value) })} />
        </label>
        <div className="field">
          <span>Focus</span>
          <div className="seg">
            {([['path', 'Balanced mix'], ['india-first', 'India first']] as [Focus, string][]).map(([v, l]) => (
              <button key={v} className={s.focus === v ? 'on' : ''} onClick={() => updateSettings({ focus: v })}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="card-box">
        <h3>Sound</h3>
        <label className="check">
          <input type="checkbox" checked={s.voice} onChange={(e) => updateSettings({ voice: e.target.checked })} /> Read questions aloud
        </label>
        <label className="check">
          <input type="checkbox" checked={s.sounds} onChange={(e) => updateSettings({ sounds: e.target.checked })} /> Sound effects
        </label>
        <label className="field">
          <span>Voice speed: {s.rate.toFixed(2)}</span>
          <input type="range" min={0.6} max={1.2} step={0.05} value={s.rate} onChange={(e) => updateSettings({ rate: Number(e.target.value) })} />
        </label>
        {voices.length > 0 && (
          <label className="field">
            <span>Voice</span>
            <select value={s.voiceURI ?? ''} onChange={(e) => updateSettings({ voiceURI: e.target.value || undefined })}>
              <option value="">Automatic (Indian English if available)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </label>
        )}
        <button className="btn" onClick={() => speak('Thiruvananthapuram is the capital of Kerala.', true)}>
          🔊 Test voice
        </button>
        <p className="hint">On iPad, better voices can be downloaded in Settings → Accessibility → Spoken Content → Voices → English → India.</p>
      </section>
      <section className="card-box">
        <h3>Places she has lived or visited</h3>
        <p className="hint">These show in her passport and are highlighted on the world map.</p>
        <div className="stamps small">
          {app.passport.map((id) => (
            <button
              key={id}
              className="stamp mine"
              onClick={() => setPassport(app.passport.filter((x) => x !== id))}
              aria-label={`Remove ${COUNTRY_BY_ID[id]?.name}`}
            >
              <span className="stamp-flag">{flagOf(COUNTRY_BY_ID[id].iso2)}</span>
              <span className="stamp-name">{COUNTRY_BY_ID[id].name} ✖</span>
            </button>
          ))}
        </div>
        <div className="row">
          <select value={addId} onChange={(e) => setAddId(e.target.value)}>
            <option value="">Add a country…</option>
            {COUNTRIES.filter((c) => !app.passport.includes(c.id))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
          <button
            className="btn"
            disabled={!addId}
            onClick={() => {
              setPassport([...app.passport, addId]);
              setAddId('');
            }}
          >
            Add
          </button>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- backup

function BackupTab() {
  const [msg, setMsg] = useState('');
  const download = () => {
    const blob = new Blob([exportBackup()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geoexplorer-backup-${dayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setMsg('Backup saved. On iPad it goes to the Files app (Downloads).');
  };
  const upload = (file: File | undefined) => {
    if (!file) return;
    file.text().then((t) => setMsg(importBackup(t) ? '✅ Progress restored.' : '❌ That file is not a GeoExplorer backup.'));
  };
  return (
    <div className="ptab">
      <section className="card-box">
        <h3>📲 Install on the iPad (important)</h3>
        <ol className="plain">
          <li>Open this page in <b>Safari</b>.</li>
          <li>Tap the <b>Share</b> button, then <b>Add to Home Screen</b>.</li>
          <li>Always open GeoExplorer from the new home-screen icon.</li>
        </ol>
        <p>
          Why it matters: progress is saved only on this device. Safari may delete a website's saved data if it isn't opened for about a week - apps added
          to the Home Screen are protected from that, work offline, and open full-screen.
        </p>
      </section>
      <section className="card-box">
        <h3>Backup and restore</h3>
        <p className="hint">Make a backup now and then (e.g. every Sunday), or before changing devices.</p>
        <div className="row">
          <button className="btn primary" onClick={download}>
            💾 Save backup file
          </button>
          <label className="btn">
            📂 Restore from file
            <input type="file" accept="application/json,.json" hidden onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>
        {msg && <p>{msg}</p>}
      </section>
      <section className="card-box danger">
        <h3>Start over</h3>
        <p className="hint">Erases all progress, stars, stickers and badges on this device. Settings are kept.</p>
        <button
          className="btn danger"
          onClick={() => {
            if (window.confirm('Erase all progress? This cannot be undone.') && window.confirm('Really erase everything? Consider saving a backup first.')) {
              resetProgress();
              setMsg('Progress erased.');
            }
          }}
        >
          🗑️ Erase progress
        </button>
      </section>
    </div>
  );
}
