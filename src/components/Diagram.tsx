import type { DiagramId } from '../data/types';

// Simple, bold illustrations of geography ideas. Top-down views use blue water and green land.
const WATER = '#60a5fa';
const LAND = '#86d97b';
const DARK = '#14532d';
const BROWN = '#a16207';
const SKY = '#e0f2fe';

function Label({ x, y, children, color = '#0f172a' }: { x: number; y: number; children: string; color?: string }) {
  return (
    <text x={x} y={y} fontSize={11} fontWeight={800} fill={color} textAnchor="middle" stroke="#fff" strokeWidth={3} paintOrder="stroke">
      {children}
    </text>
  );
}

export function Diagram({ id }: { id: DiagramId }) {
  return (
    <svg viewBox="0 0 200 140" className="diagram" role="img" aria-label={id}>
      {render(id)}
    </svg>
  );
}

function render(id: DiagramId) {
  switch (id) {
    case 'island':
      return (
        <>
          <rect width="200" height="140" fill={WATER} rx="12" />
          <path d="M70 60 C80 35 130 35 140 60 C150 85 120 105 95 98 C70 92 62 78 70 60Z" fill={LAND} stroke={DARK} strokeWidth="2" />
          <text x="104" y="74" fontSize="22" textAnchor="middle">🌴</text>
          <Label x={100} y={128}>Water all around</Label>
        </>
      );
    case 'peninsula':
      return (
        <>
          <rect width="200" height="140" fill={WATER} rx="12" />
          <path d="M0 0 H200 V40 C160 40 140 45 130 70 C120 100 110 120 100 120 C90 120 80 100 70 70 C60 45 40 40 0 40Z" fill={LAND} stroke={DARK} strokeWidth="2" />
          <Label x={100} y={30}>Land</Label>
          <Label x={40} y={95}>Water</Label>
          <Label x={160} y={95}>Water</Label>
          <Label x={100} y={134}>Water</Label>
        </>
      );
    case 'lake':
      return (
        <>
          <rect width="200" height="140" fill={LAND} rx="12" />
          <ellipse cx="100" cy="68" rx="55" ry="35" fill={WATER} stroke="#1d4ed8" strokeWidth="2" />
          <Label x={100} y={72}>Lake</Label>
          <Label x={100} y={128}>Land all around</Label>
        </>
      );
    case 'bay':
      return (
        <>
          <rect width="200" height="140" fill={WATER} rx="12" />
          <path d="M0 0 H200 V120 H150 C150 60 50 60 50 120 H0Z" fill={LAND} stroke={DARK} strokeWidth="2" />
          <Label x={100} y={105}>Bay</Label>
          <Label x={100} y={30}>Land</Label>
        </>
      );
    case 'strait':
      return (
        <>
          <rect width="200" height="140" fill={WATER} rx="12" />
          <path d="M0 0 H200 V52 C140 58 60 58 0 52Z" fill={LAND} stroke={DARK} strokeWidth="2" />
          <path d="M0 140 H200 V88 C140 82 60 82 0 88Z" fill={LAND} stroke={DARK} strokeWidth="2" />
          <Label x={100} y={74}>Strait (narrow water)</Label>
        </>
      );
    case 'isthmus':
      return (
        <>
          <rect width="200" height="140" fill={WATER} rx="12" />
          <ellipse cx="45" cy="70" rx="40" ry="50" fill={LAND} stroke={DARK} strokeWidth="2" />
          <ellipse cx="155" cy="70" rx="40" ry="50" fill={LAND} stroke={DARK} strokeWidth="2" />
          <rect x="80" y="62" width="40" height="16" fill={LAND} />
          <Label x={100} y={56}>Isthmus</Label>
          <Label x={100} y={100}>(narrow land)</Label>
        </>
      );
    case 'delta':
      return (
        <>
          <rect width="200" height="140" fill={LAND} rx="12" />
          <rect y="105" width="200" height="35" fill={WATER} />
          <path d="M100 0 C100 40 100 60 100 70 M100 70 L70 108 M100 70 L100 108 M100 70 L130 108 M100 80 L85 108 M100 80 L115 108" stroke={WATER} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M100 70 L55 106 H145Z" fill="#d9f99d" opacity="0.6" />
          <Label x={130} y={30}>River</Label>
          <Label x={100} y={98}>Delta</Label>
          <Label x={100} y={130}>Sea (river mouth)</Label>
        </>
      );
    case 'mountain':
      return (
        <>
          <rect width="200" height="140" fill={SKY} rx="12" />
          <path d="M10 125 L70 40 L95 70 L125 20 L190 125Z" fill={BROWN} />
          <path d="M112 38 L125 20 L138 40 L130 36 L124 42 L118 36Z" fill="#fff" />
          <Label x={125} y={14}>Peak</Label>
          <Label x={100} y={134}>Mountain</Label>
        </>
      );
    case 'valley':
      return (
        <>
          <rect width="200" height="140" fill={SKY} rx="12" />
          <path d="M0 30 L60 110 H140 L200 30 V140 H0Z" fill={BROWN} />
          <path d="M60 110 H140 V125 H60Z" fill={LAND} />
          <path d="M70 118 H130" stroke={WATER} strokeWidth="5" />
          <Label x={100} y={100}>Valley</Label>
        </>
      );
    case 'plateau':
      return (
        <>
          <rect width="200" height="140" fill={SKY} rx="12" />
          <path d="M0 125 L40 50 H160 L200 125Z" fill={BROWN} />
          <path d="M40 50 H160" stroke={DARK} strokeWidth="3" />
          <Label x={100} y={42}>Flat top</Label>
          <Label x={100} y={100}>Plateau</Label>
        </>
      );
    case 'plain':
      return (
        <>
          <rect width="200" height="140" fill={SKY} rx="12" />
          <rect y="85" width="200" height="55" fill={LAND} />
          <text x="40" y="84" fontSize="20">🌾</text>
          <text x="90" y="84" fontSize="20">🌾</text>
          <text x="140" y="84" fontSize="20">🏡</text>
          <Label x={100} y={120}>Plain - flat, low land</Label>
        </>
      );
    case 'volcano':
      return (
        <>
          <rect width="200" height="140" fill={SKY} rx="12" />
          <path d="M20 128 L85 45 H115 L180 128Z" fill="#78350f" />
          <path d="M85 45 C90 60 95 70 92 90 M115 45 C112 65 108 75 112 95" stroke="#f97316" strokeWidth="6" fill="none" />
          <circle cx="92" cy="25" r="12" fill="#9ca3af" />
          <circle cx="110" cy="15" r="14" fill="#6b7280" />
          <Label x={150} y={70} color="#c2410c">Lava</Label>
          <Label x={100} y={136}>Volcano</Label>
        </>
      );
    case 'layers':
      return (
        <>
          <circle cx="100" cy="70" r="64" fill="#a16207" />
          <circle cx="100" cy="70" r="58" fill="#f97316" />
          <circle cx="100" cy="70" r="34" fill="#facc15" />
          <circle cx="100" cy="70" r="16" fill="#fef08a" />
          <Label x={100} y={12}>Crust</Label>
          <Label x={100} y={30}>Mantle</Label>
          <Label x={100} y={50}>Outer core</Label>
          <Label x={100} y={74}>Inner core</Label>
        </>
      );
    case 'daynight':
      return (
        <>
          <rect width="200" height="140" fill="#0f172a" rx="12" />
          <circle cx="25" cy="70" r="22" fill="#fde047" />
          <path d="M42 50 L70 58 M45 70 L72 70 M42 90 L70 82" stroke="#fde047" strokeWidth="3" />
          <circle cx="130" cy="70" r="45" fill="#1e3a8a" />
          <path d="M130 25 A45 45 0 0 0 130 115Z" fill="#60a5fa" />
          <Label x={108} y={74}>Day</Label>
          <Label x={152} y={74} color="#1e293b">Night</Label>
          <text x="178" y="30" fontSize="18">🔄</text>
        </>
      );
    case 'compass':
      return (
        <>
          <circle cx="100" cy="70" r="62" fill="#fff7ed" stroke="#9a3412" strokeWidth="3" />
          <path d="M100 14 L112 70 L100 126 L88 70Z" fill="#fdba74" />
          <path d="M44 70 L100 58 L156 70 L100 82Z" fill="#fed7aa" />
          <path d="M100 14 L112 70 H88Z" fill="#dc2626" />
          <text x="100" y="12" fontSize="14" fontWeight="900" textAnchor="middle" fill="#dc2626">N</text>
          <text x="100" y="139" fontSize="14" fontWeight="900" textAnchor="middle">S</text>
          <text x="170" y="75" fontSize="14" fontWeight="900" textAnchor="middle">E</text>
          <text x="30" y="75" fontSize="14" fontWeight="900" textAnchor="middle">W</text>
          <text x="148" y="30" fontSize="9" fontWeight="800" textAnchor="middle">NE</text>
          <text x="52" y="30" fontSize="9" fontWeight="800" textAnchor="middle">NW</text>
          <text x="148" y="118" fontSize="9" fontWeight="800" textAnchor="middle">SE</text>
          <text x="52" y="118" fontSize="9" fontWeight="800" textAnchor="middle">SW</text>
        </>
      );
    case 'globe':
      return (
        <>
          <circle cx="100" cy="70" r="60" fill={WATER} stroke="#1d4ed8" strokeWidth="2" />
          <path d="M65 40 C80 30 100 40 95 55 C90 70 70 65 60 75 C55 60 55 48 65 40Z" fill={LAND} />
          <path d="M110 70 C130 60 150 70 145 90 C140 105 120 110 112 98 C105 88 100 78 110 70Z" fill={LAND} />
          <ellipse cx="100" cy="70" rx="60" ry="14" fill="none" stroke="#fff" strokeOpacity="0.7" />
          <ellipse cx="100" cy="70" rx="22" ry="60" fill="none" stroke="#fff" strokeOpacity="0.7" />
          <path d="M100 4 V10 M100 130 V136" stroke="#334155" strokeWidth="3" />
        </>
      );
    case 'watercycle':
      return (
        <>
          <rect width="200" height="140" fill={SKY} rx="12" />
          <circle cx="28" cy="25" r="14" fill="#fde047" />
          <path d="M0 110 Q50 100 100 112 V140 H0Z" fill={WATER} />
          <path d="M100 112 L150 60 L200 112 V140 H100Z" fill={BROWN} />
          <ellipse cx="120" cy="28" rx="30" ry="12" fill="#fff" stroke="#94a3b8" />
          <path d="M45 98 C50 70 70 50 92 36" stroke="#f97316" strokeWidth="2.5" fill="none" strokeDasharray="4 3" markerEnd="url(#a)" />
          <path d="M128 44 L132 64 M138 44 L142 64 M118 44 L122 64" stroke="#2563eb" strokeWidth="2.5" />
          <defs>
            <marker id="a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10Z" fill="#f97316" />
            </marker>
          </defs>
          <Label x={50} y={68} color="#c2410c">Evaporation</Label>
          <Label x={120} y={16}>Condensation</Label>
          <Label x={168} y={50} color="#1d4ed8">Rain</Label>
          <Label x={50} y={128}>Collection</Label>
        </>
      );
    case 'hemispheres':
      return (
        <>
          <circle cx="100" cy="70" r="60" fill={WATER} />
          <path d="M40 70 A60 60 0 0 1 160 70Z" fill="#93c5fd" />
          <path d="M40 70 H160" stroke="#dc2626" strokeWidth="3" />
          <Label x={100} y={45}>Northern</Label>
          <Label x={100} y={100}>Southern</Label>
          <Label x={100} y={67} color="#dc2626">Equator</Label>
          <text x="100" y="8" fontSize="10" fontWeight="800" textAnchor="middle">North Pole</text>
          <text x="100" y="139" fontSize="10" fontWeight="800" textAnchor="middle">South Pole</text>
        </>
      );
    case 'latlong':
      return (
        <>
          <circle cx="100" cy="70" r="60" fill={WATER} />
          {[-40, -20, 0, 20, 40].map((y) => (
            <ellipse key={y} cx="100" cy={70 + y} rx={Math.sqrt(3600 - y * y)} ry="5" fill="none" stroke={y === 0 ? '#dc2626' : '#fff'} strokeWidth={y === 0 ? 2.5 : 1.2} />
          ))}
          {[20, 40].map((rx) => (
            <ellipse key={rx} cx="100" cy="70" rx={rx} ry="60" fill="none" stroke="#fde047" strokeWidth="1.2" />
          ))}
          <path d="M100 10 V130" stroke="#fde047" strokeWidth="1.5" />
          <Label x={165} y={74} color="#dc2626">0°</Label>
          <Label x={30} y={34}>Latitude ↔</Label>
          <Label x={170} y={20} color="#a16207">Longitude ↕</Label>
        </>
      );
    case 'seasons':
      return (
        <>
          <rect width="200" height="140" fill="#0f172a" rx="12" />
          <ellipse cx="100" cy="70" rx="80" ry="40" fill="none" stroke="#475569" strokeDasharray="4 4" />
          <circle cx="100" cy="70" r="16" fill="#fde047" />
          <g transform="translate(22 70) rotate(23)">
            <circle r="12" fill="#3b82f6" />
            <path d="M0 -18 V18" stroke="#fff" strokeWidth="1.5" />
          </g>
          <g transform="translate(178 70) rotate(23)">
            <circle r="12" fill="#3b82f6" />
            <path d="M0 -18 V18" stroke="#fff" strokeWidth="1.5" />
          </g>
          <Label x={30} y={108}>North tilts in</Label>
          <Label x={30} y={121}>= summer</Label>
          <Label x={170} y={108}>North tilts</Label>
          <Label x={170} y={121}>away = winter</Label>
        </>
      );
  }
}
