import { geoMercator, geoNaturalEarth1, geoPath, type GeoProjection } from 'd3-geo';
import type { Feature, Geometry } from 'geojson';
import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { CONTINENTS, COUNTRY_BY_ID, OCEANS } from '../data/countries';
import { INDIA_PHYSICAL, REGIONS, STATE_BY_ID } from '../data/india';
import type { LonLat } from '../data/types';
import { INDIA_AREA_IDS, INDIA_RIVER_IDS, WORLD_AREA_IDS, WORLD_RIVER_IDS } from '../data/world';
import type { Layer, MapKind } from '../lib/curriculum';
import { loadMaps, mapsIfLoaded, type GeoFeature, type MapData } from '../lib/mapdata';
import { clamp } from '../lib/util';

export interface MapHit {
  id: string | null;
  ll: LonLat | null;
}

interface Props {
  map: MapKind;
  layer?: Layer;
  highlight?: string[];
  soft?: string[];
  focus?: string[];
  marker?: LonLat;
  markers?: { ll: LonLat; emoji: string; label?: string }[];
  selected?: string | null;
  flash?: { id: string; ok: boolean } | null;
  colorBy?: 'region' | 'continent' | 'none';
  labels?: boolean;
  latLines?: boolean;
  interactive?: boolean;
  tinyMarkers?: boolean;
  /** In the physical layer, make rivers, ranges, areas and seas tappable (ids prefixed "p:"). */
  physicalTappable?: boolean;
  onTap?: (hit: MapHit) => void;
}

const SIZE = { india: [1000, 1100], world: [1000, 520] } as const;
// Places too small to tap reliably with a finger get a dot marker and a forgiving tap radius.
const TINY_STATES = ['DL', 'CH', 'GA', 'DD', 'PY', 'LD'];
const MAX_K = { india: 10, world: 40 } as const;

const COLORS = {
  sea: '#bfe3ff',
  land: '#fff4d6',
  context: '#ece5d6',
  border: '#8a7f6b',
  hi: '#ff7a1a',
  hiStroke: '#9a3412',
  soft: '#fed7aa',
  selected: '#1d4ed8',
  ok: '#22c55e',
  bad: '#ef4444',
  river: '#1e88e5',
  range: '#8b5a2b',
};

const AREA_COLOR: Record<string, string> = {
  desert: '#f4c27a',
  mountains: '#a16207',
  plateau: '#b45309',
  plain: '#65a30d',
  forest: '#15803d',
  wetland: '#0f766e',
  valley: '#65a30d',
};

const REGION_COLOR = Object.fromEntries(REGIONS.map((r) => [r.id, r.color]));
const CONTINENT_COLOR: Record<string, string> = Object.fromEntries(CONTINENTS.map((c) => [c.id, c.color]));

interface Geo {
  projection: GeoProjection;
  path: ReturnType<typeof geoPath>;
  main: { id: string; d: string; area: number; c: [number, number]; region?: string; cont?: string }[];
  context: { id: string; d: string }[];
  continents: { id: string; d: string; c: [number, number] }[];
  rivers: { id: string; d: string }[];
  areas: { id: string; d: string; kind: string; c: [number, number] }[];
  ranges: { id: string; d: string; c: [number, number] }[];
  tiny: { id: string; c: [number, number] }[];
}

function useMaps(): MapData | null {
  const [data, setData] = useState<MapData | null>(mapsIfLoaded());
  useEffect(() => {
    if (!data) loadMaps().then(setData).catch(() => setData(null));
  }, [data]);
  return data;
}

function buildGeo(kind: MapKind, data: MapData): Geo {
  const [W, H] = SIZE[kind];
  const isIndia = kind === 'india';
  const projection = isIndia
    ? geoMercator().fitExtent([[12, 12], [W - 12, H - 12]], { type: 'FeatureCollection', features: data.states } as never)
    : geoNaturalEarth1().fitExtent([[4, 4], [W - 4, H - 4]], { type: 'Sphere' });
  const path = geoPath(projection);
  const feats: GeoFeature[] = isIndia ? data.states : data.countries;
  const main = feats.map((f) => {
    const id = f.properties.id;
    const c: [number, number] = isIndia
      ? (path.centroid(largestPart(f)) as [number, number])
      : (projection([f.properties.lx ?? 0, f.properties.ly ?? 0]) as [number, number]);
    return {
      id, d: path(f) ?? '', area: path.area(f), c,
      region: isIndia ? STATE_BY_ID[id]?.region : undefined,
      cont: !isIndia ? f.properties.cont : undefined,
    };
  });
  const context = isIndia
    ? data.countries
        .filter((f) => f.properties.id !== 'IND' && intersects(f, [55, -2, 108, 44]))
        .map((f) => ({ id: f.properties.id, d: path(f) ?? '' }))
    : [];
  const continents = isIndia ? [] : data.continents.map((f) => ({ id: f.properties.id, d: path(f) ?? '', c: path.centroid(largestPart(f)) as [number, number] }));
  const riverIds = isIndia ? INDIA_RIVER_IDS : WORLD_RIVER_IDS;
  const rivers = data.rivers.filter((f) => riverIds.includes(f.properties.id)).map((f) => ({ id: f.properties.id, d: path(f) ?? '' }));
  const areaIds = isIndia ? INDIA_AREA_IDS : WORLD_AREA_IDS;
  const areas = data.regions
    .filter((f) => areaIds.includes(f.properties.id))
    .map((f) => ({ id: f.properties.id, d: path(f) ?? '', kind: f.properties.kind ?? '', c: path.centroid(f) as [number, number] }));
  const ranges = isIndia
    ? INDIA_PHYSICAL.filter((p) => p.line).map((p) => {
        const line = { type: 'LineString', coordinates: p.line! } as Geometry;
        const mid = p.line![Math.floor(p.line!.length / 2)];
        return { id: p.id, d: path(line) ?? '', c: projection(mid) as [number, number] };
      })
    : [];
  const tiny = main
    .filter((m) => (isIndia ? TINY_STATES.includes(m.id) : m.area < 4 && COUNTRY_BY_ID[m.id]))
    .map((m) => ({ id: m.id, c: m.c }));
  return { projection, path, main, context, continents, rivers, areas, ranges, tiny };
}

function largestPart(f: GeoFeature): Feature<Geometry> {
  const g = f.geometry;
  if (g.type !== 'MultiPolygon') return f;
  let best = g.coordinates[0];
  let bestLen = 0;
  for (const poly of g.coordinates) {
    const len = poly[0].length;
    if (len > bestLen) {
      best = poly;
      bestLen = len;
    }
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: best } };
}

function intersects(f: GeoFeature, [w, s, e, n]: number[]): boolean {
  let hit = false;
  const walk = (c: unknown): void => {
    if (hit) return;
    if (Array.isArray(c) && typeof c[0] === 'number') {
      const [x, y] = c as number[];
      if (x >= w && x <= e && y >= s && y <= n) hit = true;
    } else if (Array.isArray(c)) c.forEach(walk);
  };
  walk((f.geometry as { coordinates: unknown }).coordinates);
  return hit;
}

interface T {
  k: number;
  x: number;
  y: number;
}

export function MapView(props: Props) {
  const {
    map, layer = 'political', highlight = [], soft = [], focus, marker, markers = [], selected, flash,
    colorBy = 'none', labels = false, latLines = false, interactive = true, tinyMarkers = false, physicalTappable = false, onTap,
  } = props;
  const data = useMaps();
  const geo = useMemo(() => (data ? buildGeo(map, data) : null), [data, map]);
  const [W, H] = SIZE[map];
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const t = useRef<T>({ k: 1, x: 0, y: 0 });
  const [view, setView] = useState<T>(t.current);
  const pointers = useRef(new Map<number, { x: number; y: number; cx: number; cy: number }>());
  const gesture = useRef<{ start: number; cx: number; cy: number; moved: boolean; multi: boolean; pinch?: { d: number; k: number; mx: number; my: number; x: number; y: number } } | null>(null);
  const anim = useRef<number>(0);
  // Screen pixels per map unit at zoom 1, so labels and markers can stay a constant on-screen size.
  const [ppu, setPpu] = useState(0.7);

  const clampT = (n: T): T => {
    const k = clamp(n.k, 1, MAX_K[map]);
    return { k, x: clamp(n.x, W - W * k, 0), y: clamp(n.y, H - H * k, 0) };
  };
  const apply = (n: T, commit = false) => {
    t.current = clampT(n);
    gRef.current?.setAttribute('transform', `translate(${t.current.x},${t.current.y}) scale(${t.current.k})`);
    if (commit) setView(t.current);
  };
  const animateTo = (target: T) => {
    cancelAnimationFrame(anim.current);
    const from = t.current;
    const to = clampT(target);
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 450);
      const e = 1 - Math.pow(1 - p, 3);
      apply({ k: from.k + (to.k - from.k) * e, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }, p === 1);
      if (p < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  };

  // Fit to the focus features whenever they change.
  const focusKey = (focus ?? []).join(',');
  useEffect(() => {
    if (!geo) return;
    if (!focus || !focus.length) {
      animateTo({ k: 1, x: 0, y: 0 });
      return;
    }
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const feats = (map === 'india' ? data!.states : layer === 'continents' ? data!.continents : data!.countries).filter((f) => focus.includes(f.properties.id));
    for (const f of feats) {
      const [[a, b], [c, d]] = geo.path.bounds(f);
      x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d);
    }
    if (!isFinite(x0)) return;
    const pad = 1.35;
    const k = Math.min(W / ((x1 - x0) * pad || 1), H / ((y1 - y0) * pad || 1), map === 'world' ? 14 : 6);
    animateTo({ k, x: W / 2 - ((x0 + x1) / 2) * k, y: H / 2 - ((y0 + y1) / 2) * k });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, focusKey]);

  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const measure = () => {
      const r = svg.getBoundingClientRect();
      if (r.width && r.height) setPpu(Math.min(r.width / W, r.height / H));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(svg);
    return () => ro.disconnect();
  }, [W, H, geo]);

  const toSvg = (cx: number, cy: number) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = cx;
    pt.y = cy;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: p.x, y: p.y };
  };

  const onPointerDown = (e: RPointerEvent<SVGSVGElement>) => {
    cancelAnimationFrame(anim.current);
    svgRef.current?.setPointerCapture(e.pointerId);
    const p = toSvg(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, { ...p, cx: e.clientX, cy: e.clientY });
    if (pointers.current.size === 1) {
      gesture.current = { start: performance.now(), cx: e.clientX, cy: e.clientY, moved: false, multi: false };
    } else if (gesture.current) {
      gesture.current.multi = true;
      const [a, b] = [...pointers.current.values()];
      gesture.current.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: t.current.k, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, x: t.current.x, y: t.current.y };
    }
  };

  const onPointerMove = (e: RPointerEvent<SVGSVGElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev || !gesture.current) return;
    const p = toSvg(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, { ...p, cx: e.clientX, cy: e.clientY });
    if (Math.hypot(e.clientX - gesture.current.cx, e.clientY - gesture.current.cy) > 10) gesture.current.moved = true;
    if (!interactive) return;
    if (pointers.current.size >= 2 && gesture.current.pinch) {
      const [a, b] = [...pointers.current.values()];
      const pz = gesture.current.pinch;
      const k = clamp(pz.k * (Math.hypot(a.x - b.x, a.y - b.y) / (pz.d || 1)), 1, MAX_K[map]);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      // keep the point under the fingers' midpoint fixed
      const ux = (pz.mx - pz.x) / pz.k;
      const uy = (pz.my - pz.y) / pz.k;
      apply({ k, x: mx - ux * k, y: my - uy * k });
    } else if (pointers.current.size === 1 && gesture.current.moved && !gesture.current.multi) {
      apply({ k: t.current.k, x: t.current.x + (p.x - prev.x), y: t.current.y + (p.y - prev.y) });
    }
  };

  const onPointerUp = (e: RPointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) {
      if (g) g.pinch = undefined;
      return;
    }
    gesture.current = null;
    setView(t.current);
    if (!g || g.moved || g.multi || performance.now() - g.start > 900 || !onTap || !geo) return;
    onTap(hitTest(e.clientX, e.clientY));
  };

  const hitTest = (cx: number, cy: number): MapHit => {
    const p = toSvg(cx, cy);
    const mx = (p.x - t.current.x) / t.current.k;
    const my = (p.y - t.current.y) / t.current.k;
    const inv = geo!.projection.invert?.([mx, my]);
    const ll = inv ? ([inv[0], inv[1]] as LonLat) : null;
    const el = document.elementFromPoint(cx, cy);
    const id = el?.closest('[data-id]')?.getAttribute('data-id') ?? null;
    if (id && (layer === 'continents' || id.startsWith('p:') || !geo!.tiny.length)) return { id, ll };
    // Forgiving taps: a tap near a tiny place (Delhi, Goa, Singapore...) counts as that place.
    const scale = svgRef.current!.getScreenCTM()!.a * t.current.k;
    let best: string | null = null;
    let bestD = 30 / scale;
    for (const s of geo!.tiny) {
      const d = Math.hypot(s.c[0] - mx, s.c[1] - my);
      if (d < bestD) {
        best = s.id;
        bestD = d;
      }
    }
    if (best && (!id || bestD < 12 / scale)) return { id: best, ll };
    return { id, ll };
  };

  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const p = toSvg(e.clientX, e.clientY);
    const k = clamp(t.current.k * Math.exp(-e.deltaY * 0.002), 1, MAX_K[map]);
    const ux = (p.x - t.current.x) / t.current.k;
    const uy = (p.y - t.current.y) / t.current.k;
    apply({ k, x: p.x - ux * k, y: p.y - uy * k }, true);
  };

  const zoomBy = (f: number) => {
    const cx = W / 2, cy = H / 2;
    const ux = (cx - t.current.x) / t.current.k;
    const uy = (cy - t.current.y) / t.current.k;
    const k = clamp(t.current.k * f, 1, MAX_K[map]);
    animateTo({ k, x: cx - ux * k, y: cy - uy * k });
  };

  if (!geo) {
    return <div className="map-loading">🗺️ Loading map…</div>;
  }

  const k = view.k;
  const hi = new Set(highlight);
  const softSet = new Set(soft);
  const isIndia = map === 'india';
  const showContinents = layer === 'continents';

  const fillFor = (m: Geo['main'][number]) => {
    if (flash && flash.id === m.id) return flash.ok ? COLORS.ok : COLORS.bad;
    if (hi.has(m.id)) return COLORS.hi;
    if (softSet.has(m.id)) return COLORS.soft;
    if (colorBy === 'region' && m.region) return REGION_COLOR[m.region];
    if (colorBy === 'continent' && m.cont) return CONTINENT_COLOR[m.cont] ?? COLORS.land;
    return COLORS.land;
  };
  const fillOpacity = (m: Geo['main'][number]) => (colorBy !== 'none' && !hi.has(m.id) && !softSet.has(m.id) && !(flash && flash.id === m.id) ? 0.55 : 1);

  const physHi = layer === 'physical' ? hi : new Set<string>();
  const seaLabels = isIndia && layer === 'physical' ? INDIA_PHYSICAL.filter((p) => p.kind === 'sea') : [];
  const fs = (px: number) => px / (k * ppu);

  return (
    <div className="map-wrap">
      <svg
        ref={svgRef}
        className="map-svg"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        role="img"
        aria-label={isIndia ? 'Map of India' : 'Map of the world'}
      >
        <rect x={-W} y={-H} width={W * 3} height={H * 3} fill={COLORS.sea} />
        <g ref={gRef} transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          {geo.context.map((c) => (
            <path key={c.id} d={c.d} fill={COLORS.context} stroke="#b8ae9a" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
          ))}

          {showContinents
            ? geo.continents.map((c) => {
                const isHi = hi.has(c.id);
                const isFlash = flash && flash.id === c.id;
                return (
                  <path
                    key={c.id}
                    data-id={c.id}
                    d={c.d}
                    fill={isFlash ? (flash!.ok ? COLORS.ok : COLORS.bad) : isHi ? COLORS.hi : CONTINENT_COLOR[c.id] ?? COLORS.land}
                    fillOpacity={isHi || isFlash ? 1 : highlight.length ? 0.35 : 0.85}
                    stroke="#fff"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })
            : geo.main.map((m) => (
                <path
                  key={m.id}
                  data-id={m.id}
                  d={m.d}
                  fill={fillFor(m)}
                  fillOpacity={fillOpacity(m)}
                  stroke={COLORS.border}
                  strokeWidth={isIndia ? 0.9 : 0.5}
                  vectorEffect="non-scaling-stroke"
                />
              ))}

          {latLines && <LatLines geo={geo} fs={fs} />}

          {layer === 'physical' && (
            <g className="phys">
              {geo.areas.map((a) => (
                <path
                  key={a.id}
                  d={a.d}
                  fill={physHi.has(a.id) ? COLORS.hi : AREA_COLOR[a.kind] ?? '#b45309'}
                  fillOpacity={physHi.has(a.id) ? 0.85 : 0.35}
                  stroke="none"
                  data-id={physicalTappable ? `p:${a.id}` : undefined}
                  pointerEvents={physicalTappable ? 'fill' : 'none'}
                />
              ))}
              {geo.rivers.map((r) => (
                <path
                  key={r.id}
                  d={r.d}
                  fill="none"
                  stroke={physHi.has(r.id) ? COLORS.hi : COLORS.river}
                  strokeWidth={physHi.has(r.id) ? 5 : 1.8}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              ))}
              {physicalTappable &&
                [...geo.rivers, ...geo.ranges].map((r) => (
                  <path
                    key={`hit-${r.id}`}
                    data-id={`p:${r.id}`}
                    d={r.d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={22}
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="stroke"
                  />
                ))}
              {geo.ranges.map((r) => (
                <g key={r.id} pointerEvents="none">
                  <path
                    d={r.d}
                    fill="none"
                    stroke={physHi.has(r.id) ? COLORS.hi : COLORS.range}
                    strokeWidth={physHi.has(r.id) ? 9 : 5}
                    strokeDasharray={physHi.has(r.id) ? undefined : '2 6'}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    opacity={0.85}
                  />
                  <text x={r.c[0]} y={r.c[1]} fontSize={fs(physHi.has(r.id) ? 28 : 16)} textAnchor="middle" dominantBaseline="central">
                    ⛰️
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* outlines on top so highlighted places stay crisp */}
          {!showContinents &&
            geo.main
              .filter((m) => hi.has(m.id) || m.id === selected || (flash && flash.id === m.id))
              .map((m) => (
                <path
                  key={`o-${m.id}`}
                  d={m.d}
                  fill="none"
                  stroke={m.id === selected ? COLORS.selected : COLORS.hiStroke}
                  strokeWidth={m.id === selected ? 3 : 2}
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              ))}

          {(tinyMarkers || isIndia) &&
            !showContinents &&
            geo.tiny.map((s) => {
              const isHi = hi.has(s.id) || s.id === selected;
              const isFlash = flash && flash.id === s.id;
              return (
                <circle
                  key={`t-${s.id}`}
                  data-id={s.id}
                  cx={s.c[0]}
                  cy={s.c[1]}
                  r={fs(isHi || isFlash ? 9 : isIndia ? 6 : 4.5)}
                  fill={isFlash ? (flash!.ok ? COLORS.ok : COLORS.bad) : isHi ? COLORS.hi : softSet.has(s.id) ? COLORS.soft : '#ffffff'}
                  stroke={isHi ? COLORS.hiStroke : COLORS.border}
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}

          {seaLabels.map((s) => {
            const [x, y] = geo.projection(s.at!) as [number, number];
            return (
              <text
                key={s.id}
                x={x}
                y={y}
                className="sea-label"
                fontSize={fs(hi.has(s.id) ? 22 : 15)}
                fill={hi.has(s.id) ? COLORS.hiStroke : '#1e5a8a'}
                fontWeight={hi.has(s.id) ? 800 : 600}
                textAnchor="middle"
                data-id={physicalTappable ? `p:${s.id}` : undefined}
                pointerEvents={physicalTappable ? 'all' : 'none'}
              >
                {s.name}
              </text>
            );
          })}

          {labels && showContinents &&
            geo.continents.map((c) => (
              <text key={`l-${c.id}`} x={c.c[0]} y={c.c[1]} className="map-label" fontSize={fs(15)} textAnchor="middle" pointerEvents="none">
                {c.id}
              </text>
            ))}

          {labels && !showContinents &&
            geo.main
              .filter((m) => (isIndia ? STATE_BY_ID[m.id] : COUNTRY_BY_ID[m.id]) && m.area * (k * ppu) ** 2 > (isIndia ? 1800 : 1400))
              .map((m) => (
                <text key={`l-${m.id}`} x={m.c[0]} y={m.c[1]} className="map-label" fontSize={fs(isIndia ? 13 : 11)} textAnchor="middle" dominantBaseline="central" pointerEvents="none">
                  {isIndia ? STATE_BY_ID[m.id].name : COUNTRY_BY_ID[m.id].name}
                </text>
              ))}

          {markers.map((m, i) => {
            const p = geo.projection(m.ll);
            if (!p) return null;
            return (
              <g key={`m-${i}`} pointerEvents="none">
                <text x={p[0]} y={p[1]} fontSize={fs(22)} textAnchor="middle" dominantBaseline="central">
                  {m.emoji}
                </text>
                {m.label && (
                  <text x={p[0]} y={p[1] + fs(22)} className="map-label strong" fontSize={fs(15)} textAnchor="middle">
                    {m.label}
                  </text>
                )}
              </g>
            );
          })}

          {marker && (() => {
            const p = geo.projection(marker);
            if (!p) return null;
            return (
              <g pointerEvents="none">
                <circle cx={p[0]} cy={p[1]} r={fs(18)} className="pulse" fill={COLORS.hi} fillOpacity={0.35} />
                <text x={p[0]} y={p[1] - fs(4)} fontSize={fs(34)} textAnchor="middle">
                  📍
                </text>
              </g>
            );
          })()}
        </g>
        {showContinents && labels && <OceanLabels geo={geo} k={k} view={view} size={13 / ppu} />}
      </svg>
      {interactive && (
        <div className="zoom-btns">
          <button aria-label="Zoom in" onClick={() => zoomBy(1.8)}>＋</button>
          <button aria-label="Zoom out" onClick={() => zoomBy(1 / 1.8)}>－</button>
          <button aria-label="Reset map" onClick={() => animateTo({ k: 1, x: 0, y: 0 })}>⟲</button>
        </div>
      )}
    </div>
  );
}

function LatLines({ geo, fs }: { geo: Geo; fs: (px: number) => number }) {
  const lines = [
    { lat: 0, name: 'Equator', color: '#dc2626' },
    { lat: 23.44, name: 'Tropic of Cancer', color: '#ea580c' },
    { lat: -23.44, name: 'Tropic of Capricorn', color: '#ea580c' },
  ];
  return (
    <g pointerEvents="none">
      {lines.map((l) => {
        const coords: LonLat[] = [];
        for (let lon = -180; lon <= 180; lon += 2) coords.push([lon, l.lat]);
        const d = geo.path({ type: 'LineString', coordinates: coords } as Geometry) ?? '';
        const start = geo.projection([-175, l.lat])!;
        return (
          <g key={l.name}>
            <path d={d} fill="none" stroke={l.color} strokeWidth={1.5} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
            <text x={start[0] + 4} y={start[1] - 4} fontSize={fs(12)} fill={l.color} fontWeight={700} className="map-label">
              {l.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function OceanLabels({ geo, k, view, size }: { geo: Geo; k: number; view: T; size: number }) {
  return (
    <g pointerEvents="none">
      {OCEANS.map((o) => {
        const p = geo.projection(o.points[0]);
        if (!p) return null;
        return (
          <text key={o.id} x={p[0] * k + view.x} y={p[1] * k + view.y} className="sea-label" fontSize={size} fill="#1e5a8a" textAnchor="middle">
            {o.name}
          </text>
        );
      })}
    </g>
  );
}

/** Which ocean a tapped point belongs to (nearest ocean reference point). */
export function nearestOcean(ll: LonLat): string {
  let best = OCEANS[0].id;
  let bestD = Infinity;
  for (const o of OCEANS) {
    for (const p of o.points) {
      let dLon = Math.abs(p[0] - ll[0]);
      if (dLon > 180) dLon = 360 - dLon;
      const d = Math.hypot(dLon * Math.cos(((p[1] + ll[1]) / 2) * (Math.PI / 180)), p[1] - ll[1]);
      if (d < bestD) {
        best = o.id;
        bestD = d;
      }
    }
  }
  return best;
}
