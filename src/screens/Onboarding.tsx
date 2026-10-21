import { useState } from 'react';
import { COUNTRY_BY_ID, flagOf } from '../data/countries';
import { requestPersistentStorage, setState, useAppState } from '../lib/store';
import { speak } from '../lib/speech';
import { playWin } from '../lib/sound';

const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐨', '🐧', '🦄', '🐬', '🦋', '🐢', '🦉', '🐘'];

export function Onboarding() {
  const app = useAppState();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(app.settings.childName === 'Explorer' ? '' : app.settings.childName);
  const [avatar, setAvatar] = useState(app.settings.avatar);

  const finish = () => {
    setState((s) => ({ ...s, onboarded: true, settings: { ...s.settings, childName: name.trim() || 'Explorer', avatar } }));
    void requestPersistentStorage();
    playWin();
    speak(`Welcome, explorer ${name.trim()}! Let's go on an adventure!`, true);
  };

  if (step === 0) {
    return (
      <div className="screen onboarding">
        <div className="big-emoji wobble">🌏</div>
        <h1>Welcome to GeoExplorer!</h1>
        <p>Maps, countries, states, rivers, mountains and planets - one adventure a day.</p>
        <label className="field big">
          <span>What's the explorer's name?</span>
          <input value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="Type a name" autoFocus />
        </label>
        <div className="field">
          <span>Pick an explorer buddy</span>
          <div className="avatar-pick big">
            {AVATARS.map((a) => (
              <button key={a} className={a === avatar ? 'on' : ''} onClick={() => setAvatar(a)}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <button className="btn primary big" onClick={() => setStep(1)}>
          Next ➜
        </button>
      </div>
    );
  }

  return (
    <div className="screen onboarding">
      <div className="big-emoji">🛂</div>
      <h1>{name.trim() || 'Explorer'}'s passport</h1>
      <p>You have already been to these places! Let's find them on the map and learn about the whole world.</p>
      <div className="stamps">
        {app.passport.map((id) => (
          <div key={id} className="stamp mine">
            <span className="stamp-flag">{flagOf(COUNTRY_BY_ID[id].iso2)}</span>
            <span className="stamp-name">{COUNTRY_BY_ID[id].name}</span>
          </div>
        ))}
      </div>
      <p className="hint">Grown-ups can change this list later in 🔒 Grown-ups → Settings.</p>
      <button className="btn primary big" onClick={finish}>
        Start exploring! 🚀
      </button>
    </div>
  );
}
