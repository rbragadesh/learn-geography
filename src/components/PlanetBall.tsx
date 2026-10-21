import type { Planet } from '../data/facts';

export function PlanetBall({ planet, size }: { planet: Planet; size: number }) {
  return (
    <span
      className={`planet-ball ${planet.ring ? 'ringed' : ''} planet-${planet.id}`}
      style={{ width: size, height: size, ['--pc' as string]: planet.color }}
      aria-hidden
    />
  );
}
