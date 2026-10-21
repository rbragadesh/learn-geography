import { useEffect } from 'react';
import { useRoute } from './components/ui';
import type { ZoneId } from './lib/curriculum';
import { loadMaps } from './lib/mapdata';
import { useAppState } from './lib/store';
import { Collection, Passport } from './screens/Collection';
import { IndiaExplorer, WorldExplorer } from './screens/Explore';
import { Home, Path, Zone } from './screens/Home';
import { Onboarding } from './screens/Onboarding';
import { Parent } from './screens/Parent';
import { Session } from './screens/Session';
import { SolarSystem } from './screens/Space';

// iOS only allows speech and audio after a user gesture; unlock both on the first touch.
function unlockAudioOnce() {
  const unlock = () => {
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis?.speak(u);
    } catch {
      // no speech support
    }
    window.removeEventListener('pointerdown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
}

export function App() {
  const app = useAppState();
  const route = useRoute();

  useEffect(() => {
    unlockAudioOnce();
    void loadMaps().catch(() => undefined);
  }, []);

  if (!app.onboarded) return <Onboarding />;

  const [page, arg] = route;
  const raw = window.location.hash;
  switch (page) {
    case 'zone':
      return <Zone id={arg as ZoneId} />;
    case 'play':
      return <Session key={raw} source={decodeURIComponent((arg ?? 'mission').split('?')[0])} />;
    case 'india-map':
      return <IndiaExplorer />;
    case 'world-map':
      return <WorldExplorer />;
    case 'solar':
      return <SolarSystem />;
    case 'passport':
      return <Passport />;
    case 'collection':
      return <Collection />;
    case 'path':
      return <Path />;
    case 'parent':
      return <Parent />;
    default:
      return <Home />;
  }
}
