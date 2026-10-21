import { useEffect, useRef, useState } from 'react';
import { COUNTRY_BY_ID, OCEANS } from '../data/countries';
import { STATE_BY_ID } from '../data/india';
import {
  BADGES, CARDS, DECK_BY_ID, UNITS, dailyMission, nextSticker, poolSession, questionFor,
  type McqStep, type MapFindStep, type OrderStep, type Step, type TeachStep,
} from '../lib/curriculum';
import { MapView, nearestOcean, type MapHit } from '../components/MapView';
import { Visual } from '../components/Visual';
import { Burst, ProgressBar, SpeakButton, go } from '../components/ui';
import { playCorrect, playWin, playWrong } from '../lib/sound';
import { speak, stopSpeaking } from '../lib/speech';
import {
  addStudyTime, awardBadges, awardSticker, getState, markMissionDone, recordAnswer, streak, todayLog, useAppState,
} from '../lib/store';
import { pick, shuffle } from '../lib/util';

const PRAISE = ['Awesome!', 'Brilliant!', 'You got it!', 'Super explorer!', 'Fantastic!', 'Well done!', 'Yes! Correct!', 'Amazing!'];
const OOPS = ['Oops! Nice try.', 'Almost!', 'Not quite.', 'Good try!'];

interface Result {
  right: number;
  wrong: number;
}

export function Session({ source }: { source: string }) {
  const app = useAppState();
  const [plan] = useState(() => {
    if (source === 'mission') return dailyMission(app.cards, app.settings, todayLog().newCards);
    if (source.startsWith('unit:')) {
      const unit = UNITS.find((u) => u.id === source.slice(5));
      return poolSession(unit?.cards ?? [], app.cards, app.settings.sessionLength);
    }
    return poolSession(DECK_BY_ID[source]?.cards ?? [], app.cards, app.settings.sessionLength);
  });
  const [queue, setQueue] = useState<Step[]>(plan.steps);
  const [index, setIndex] = useState(0);
  const answered = useRef(new Set<string>());
  const requeued = useRef(new Set<string>());
  const [result, setResult] = useState<Result>({ right: 0, wrong: 0 });
  const [burst, setBurst] = useState(0);
  const [summary, setSummary] = useState<{ sticker?: string; badges: string[] } | null>(null);
  const started = useRef(Date.now());

  useEffect(() => () => stopSpeaking(), []);

  const title = source === 'mission' ? "Today's Adventure" : source.startsWith('unit:') ? UNITS.find((u) => u.id === source.slice(5))?.title ?? 'Practice' : DECK_BY_ID[source]?.title ?? 'Practice';

  if (!queue.length) {
    return (
      <div className="screen center">
        <div className="big-emoji">🎉</div>
        <h2>Nothing to practise here right now!</h2>
        <button className="btn primary" onClick={() => go('/')}>Back home</button>
      </div>
    );
  }

  const answer = (card: string, correct: boolean) => {
    if (!answered.current.has(card)) {
      answered.current.add(card);
      recordAnswer(card, correct, plan.newCards.includes(card));
      setResult((r) => ({ right: r.right + (correct ? 1 : 0), wrong: r.wrong + (correct ? 0 : 1) }));
      if (!correct && !requeued.current.has(card)) {
        // Ask it once more at the end of this session, as practice.
        requeued.current.add(card);
        setQueue((q) => [...q, questionFor(card, getState().cards[card])]);
      }
    }
    if (correct) {
      playCorrect();
      setBurst((b) => b + 1);
    } else {
      playWrong();
    }
  };

  const finish = () => {
    addStudyTime(Date.now() - started.current);
    let sticker: string | undefined;
    if (source === 'mission' && !todayLog().mission) {
      markMissionDone();
      sticker = nextSticker(getState().stickers);
      awardSticker(sticker);
    }
    const s = getState();
    const missions = Object.values(s.days).filter((d) => d.mission).length;
    const fresh = BADGES.filter((b) => !s.badges[b.id] && b.check({ cards: s.cards, stars: s.stars, streak: streak(s), missions })).map((b) => b.id);
    awardBadges(fresh);
    playWin();
    setBurst((b) => b + 1);
    setSummary({ sticker, badges: fresh });
    const total = result.right + result.wrong;
    speak(total && result.right / total >= 0.8 ? `Wow! You got ${result.right} right! Great exploring!` : `You got ${result.right} right. Every explorer learns by trying!`);
  };

  const next = () => {
    stopSpeaking();
    if (index + 1 >= queue.length) finish();
    else setIndex((i) => i + 1);
  };

  if (summary) return <Summary result={result} sticker={summary.sticker} badges={summary.badges} source={source} burst={burst} />;

  const step = queue[index];
  return (
    <div className="screen session">
      <header className="session-top">
        <button className="icon-btn" aria-label="Stop" onClick={() => go('/')}>✖️</button>
        <div className="session-progress">
          <div className="session-title">{title}</div>
          <ProgressBar value={index / queue.length} />
        </div>
        <div className="star-count">⭐ {app.stars}</div>
      </header>
      <Burst trigger={burst} />
      <div className="session-body" key={index}>
        {step.type === 'teach' && <TeachView step={step} onNext={next} />}
        {step.type === 'mcq' && <McqView step={step} onAnswer={(ok) => answer(step.card, ok)} onNext={next} />}
        {step.type === 'mapFind' && <MapFindView step={step} onAnswer={(ok) => answer(step.card, ok)} onNext={next} />}
        {step.type === 'order' && <OrderView step={step} onAnswer={(ok) => answer(step.card, ok)} onNext={next} />}
      </div>
    </div>
  );
}

function TeachView({ step, onNext }: { step: TeachStep; onNext: () => void }) {
  useEffect(() => speak(step.say), [step]);
  const hasMap = step.visual?.kind === 'map';
  return (
    <div className={`teach ${hasMap ? 'with-map' : ''}`}>
      <div className="teach-visual">
        <Visual visual={step.visual} />
      </div>
      <div className="teach-card">
        <div className="new-badge">✨ New!</div>
        <h2>{step.title}</h2>
        {step.subtitle && <div className="teach-sub">{step.subtitle}</div>}
        <ul>
          {step.lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
        <div className="row">
          <SpeakButton text={step.say} />
          <button className="btn primary big" onClick={onNext}>
            Got it! ➜
          </button>
        </div>
      </div>
    </div>
  );
}

function McqView({ step, onAnswer, onNext }: { step: McqStep; onAnswer: (ok: boolean) => void; onNext: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => speak(step.say), [step]);
  const ok = picked === step.answer;
  const choose = (id: string) => {
    if (picked) return;
    setPicked(id);
    const right = id === step.answer;
    onAnswer(right);
    if (right) {
      speak(pick(PRAISE));
      setTimeout(onNext, 1500);
    } else {
      speak(`${pick(OOPS)} ${step.explain}`);
    }
  };
  const hasMap = step.visual?.kind === 'map';
  const flagOnly = step.options.every((o) => o.flag && !o.label);
  return (
    <div className={`quiz ${hasMap ? 'with-map' : ''}`}>
      {step.visual && (
        <div className="quiz-visual">
          <Visual visual={step.visual} />
        </div>
      )}
      <div className="quiz-panel">
        <div className="prompt">
          <h2>{step.prompt}</h2>
          <SpeakButton text={step.say} />
        </div>
        <div className={`options ${flagOnly ? 'flags' : ''} n${step.options.length}`}>
          {step.options.map((o) => {
            const state = picked ? (o.id === step.answer ? 'right' : o.id === picked ? 'wrong' : 'dim') : '';
            return (
              <button key={o.id} className={`option ${state}`} onClick={() => choose(o.id)}>
                {o.flag && <span className={flagOnly ? 'opt-flag big' : 'opt-flag'}>{o.flag}</span>}
                {o.emoji && <span className="opt-emoji">{o.emoji}</span>}
                {o.label && <span className="opt-label">{o.label}</span>}
              </button>
            );
          })}
        </div>
        {picked && <Feedback ok={ok} explain={step.explain} onNext={onNext} />}
      </div>
    </div>
  );
}

function Feedback({ ok, explain, onNext }: { ok: boolean; explain: string; onNext: () => void }) {
  return (
    <div className={`feedback ${ok ? 'ok' : 'bad'}`}>
      <div className="feedback-text">
        <strong>{ok ? '🎉 Correct!' : '💡 Let\'s learn it:'}</strong> {explain}
      </div>
      {!ok && (
        <div className="row">
          <SpeakButton text={explain} />
          <button className="btn primary" onClick={onNext}>
            Next ➜
          </button>
        </div>
      )}
    </div>
  );
}

function placeName(id: string): string {
  return STATE_BY_ID[id]?.name ?? COUNTRY_BY_ID[id]?.name ?? OCEANS.find((o) => o.id === id)?.name ?? id;
}

function MapFindView({ step, onAnswer, onNext }: { step: MapFindStep; onAnswer: (ok: boolean) => void; onNext: () => void }) {
  const [tries, setTries] = useState(0);
  const [flash, setFlash] = useState<{ id: string; ok: boolean } | null>(null);
  const [status, setStatus] = useState<'ask' | 'retry' | 'right' | 'reveal'>('ask');
  const [note, setNote] = useState('');
  useEffect(() => speak(step.say), [step]);

  const hint = () => {
    if (step.targetKind === 'state') return `Hint: look in ${STATE_BY_ID[step.target].region === 'Islands' ? 'the islands in the sea' : `${STATE_BY_ID[step.target].region} India`}.`;
    if (step.targetKind === 'country') return `Hint: it is in ${COUNTRY_BY_ID[step.target]?.continent}.`;
    return '';
  };

  const onTap = (hit: MapHit) => {
    if (status === 'right' || status === 'reveal') return;
    let id = hit.id;
    if (step.targetKind === 'ocean') {
      if (id) {
        setNote('That is land! Tap on the blue water.');
        speak('That is land! Tap on the water.');
        return;
      }
      if (!hit.ll) return;
      id = nearestOcean(hit.ll);
    }
    if (!id) return;
    const right = id === step.target || (step.accept ?? []).includes(id);
    if (right) {
      setFlash({ id, ok: true });
      setStatus('right');
      setNote(`${pick(PRAISE)} That's ${placeName(id)}!`);
      onAnswer(tries === 0);
      speak(`${pick(PRAISE)} That's ${placeName(id)}!`);
      setTimeout(onNext, 1800);
      return;
    }
    const n = tries + 1;
    setTries(n);
    setFlash({ id, ok: false });
    if (n >= 2) {
      setStatus('reveal');
      onAnswer(false);
      setTimeout(() => setFlash({ id: step.target, ok: true }), 700);
      setNote(`That's ${placeName(id)}. ${step.explain}`);
      speak(`That's ${placeName(id)}. Here is ${placeName(step.target)}. ${step.explain}`);
    } else {
      setStatus('retry');
      setNote(`That's ${placeName(id)}. Try again! ${hint()}`);
      speak(`That's ${placeName(id)}. Try again! ${hint()}`);
    }
  };

  const ocean = step.targetKind === 'ocean' ? OCEANS.find((o) => o.id === step.target) : undefined;
  return (
    <div className={`quiz find ${step.map}`}>
      <div className="prompt">
        <h2>👆 {step.prompt}</h2>
        <SpeakButton text={step.say} />
      </div>
      <div className="find-map">
        <MapView
          map={step.map}
          layer={step.layer}
          focus={step.focus}
          flash={flash}
          tinyMarkers
          marker={status === 'reveal' && ocean ? ocean.points[0] : undefined}
          onTap={onTap}
        />
      </div>
      <div className={`find-note ${status}`}>
        <span>{note || 'Pinch to zoom, then tap!'}</span>
        {status === 'reveal' && (
          <button className="btn primary" onClick={onNext}>
            Next ➜
          </button>
        )}
      </div>
    </div>
  );
}

function OrderView({ step, onAnswer, onNext }: { step: OrderStep; onAnswer: (ok: boolean) => void; onNext: () => void }) {
  const [items] = useState(() => shuffle(step.items));
  const [placed, setPlaced] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState<string | null>(null);
  const done = placed.length === step.items.length;
  useEffect(() => speak(step.say), [step]);

  const tap = (id: string) => {
    if (done || placed.includes(id)) return;
    if (id === step.items[placed.length].id) {
      const p = [...placed, id];
      setPlaced(p);
      speak(step.items.find((x) => x.id === id)!.label);
      if (p.length === step.items.length) {
        const ok = mistakes === 0;
        onAnswer(ok);
        speak(ok ? `${pick(PRAISE)} ${step.explain}` : `You did it! ${step.explain}`);
        if (ok) setTimeout(onNext, 2600);
      }
    } else {
      setMistakes((m) => m + 1);
      setShake(id);
      playWrong();
      setTimeout(() => setShake(null), 500);
    }
  };

  return (
    <div className="quiz order">
      <div className="prompt">
        <h2>{step.prompt}</h2>
        <SpeakButton text={step.say} />
      </div>
      <div className="order-slots">
        {step.items.map((it, i) => (
          <div key={it.id} className={`slot ${placed[i] ? 'filled' : ''}`}>
            <span className="slot-n">{i + 1}</span>
            {placed[i] ? step.items.find((x) => x.id === placed[i])!.label : ''}
          </div>
        ))}
      </div>
      <div className="order-chips">
        {items.map((it) => (
          <button key={it.id} className={`chip ${placed.includes(it.id) ? 'used' : ''} ${shake === it.id ? 'shake' : ''}`} onClick={() => tap(it.id)}>
            {CARDS[step.card]?.deck === 'planet-order' && <span className={`dot planet-${it.id}`} />}
            {it.label}
          </button>
        ))}
      </div>
      {done && (
        <div className={`feedback ${mistakes === 0 ? 'ok' : 'bad'}`}>
          <div className="feedback-text">
            <strong>{mistakes === 0 ? '🎉 Perfect!' : `✅ Done! (${mistakes} oops)`}</strong> {step.explain}
          </div>
          {mistakes > 0 && (
            <button className="btn primary" onClick={onNext}>
              Next ➜
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Summary({ result, sticker, badges, source, burst }: { result: Result; sticker?: string; badges: string[]; source: string; burst: number }) {
  const total = result.right + result.wrong;
  const pct = total ? result.right / total : 0;
  return (
    <div className="screen summary">
      <Burst trigger={burst} big />
      <div className="big-emoji">{pct >= 0.8 ? '🏆' : pct >= 0.5 ? '🌟' : '💪'}</div>
      <h1>{pct >= 0.8 ? 'Amazing exploring!' : pct >= 0.5 ? 'Great job!' : 'Good practice!'}</h1>
      <div className="summary-stats">
        <div>
          <b>{result.right}</b>
          <span>⭐ stars earned</span>
        </div>
        <div>
          <b>
            {result.right}/{total}
          </b>
          <span>right first time</span>
        </div>
      </div>
      {sticker && (
        <div className="sticker-won">
          <div className="sticker-big">{sticker}</div>
          <div>New sticker for your sticker book!</div>
        </div>
      )}
      {badges.length > 0 && (
        <div className="badges-won">
          {badges.map((id) => {
            const b = BADGES.find((x) => x.id === id)!;
            return (
              <div key={id} className="badge-won">
                <span>{b.emoji}</span>
                <b>{b.title}</b>
              </div>
            );
          })}
        </div>
      )}
      <div className="row center">
        <button className="btn" onClick={() => go('/')}>
          🏠 Home
        </button>
        <button className="btn primary" onClick={() => (window.location.hash = `/play/${source}?${Date.now()}`)}>
          🔁 Play again
        </button>
      </div>
    </div>
  );
}
