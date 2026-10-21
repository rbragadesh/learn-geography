import type { Feature, FeatureCollection, Geometry, LineString, MultiLineString } from 'geojson';
import { feature, neighbors } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';

export interface Props {
  id: string;
  name?: string;
  cont?: string;
  kind?: string;
  lx?: number;
  ly?: number;
}

export type GeoFeature = Feature<Geometry, Props>;

export interface MapData {
  states: GeoFeature[];
  countries: GeoFeature[];
  continents: GeoFeature[];
  rivers: Feature<LineString | MultiLineString, Props>[];
  regions: GeoFeature[];
  stateNeighbors: Record<string, string[]>;
  countryNeighbors: Record<string, string[]>;
}

let promise: Promise<MapData> | null = null;
let loaded: MapData | null = null;

async function getJSON(name: string): Promise<Topology> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${name}`);
  if (!res.ok) throw new Error(`Could not load ${name}`);
  return res.json();
}

function features(topo: Topology, key: string): GeoFeature[] {
  const fc = feature(topo, topo.objects[key]) as unknown as FeatureCollection<Geometry, Props>;
  return fc.features;
}

function neighborMap(topo: Topology, key: string): Record<string, string[]> {
  const obj = topo.objects[key] as GeometryCollection<Props>;
  const ids = obj.geometries.map((g) => (g.properties as Props).id);
  const nb = neighbors(obj.geometries as never);
  const out: Record<string, string[]> = {};
  nb.forEach((list, i) => {
    out[ids[i]] = [...new Set(list.map((j) => ids[j]))].filter((x) => x !== ids[i]);
  });
  return out;
}

// Enclaves whose borders don't share map arcs: Mahé (Puducherry) sits inside Kerala, Yanam inside Andhra Pradesh.
const EXTRA_STATE_NEIGHBORS: [string, string][] = [
  ['PY', 'KL'],
  ['PY', 'AP'],
];

function withExtras(map: Record<string, string[]>, extras: [string, string][]): Record<string, string[]> {
  for (const [a, b] of extras) {
    if (!map[a].includes(b)) map[a].push(b);
    if (!map[b].includes(a)) map[b].push(a);
  }
  return map;
}

export function loadMaps(): Promise<MapData> {
  if (!promise) {
    promise = Promise.all([getJSON('india.json'), getJSON('world.json'), getJSON('physical.json')]).then(([india, world, phys]) => {
      // Continents get their name as the id so they can be targeted like any other feature.
      const continents = features(world, 'continents').map((f) => ({ ...f, properties: { ...f.properties, id: f.properties.cont ?? '' } }));
      loaded = {
        states: features(india, 'states'),
        countries: features(world, 'countries'),
        continents,
        rivers: features(phys, 'rivers') as MapData['rivers'],
        regions: features(phys, 'regions'),
        stateNeighbors: withExtras(neighborMap(india, 'states'), EXTRA_STATE_NEIGHBORS),
        countryNeighbors: neighborMap(world, 'countries'),
      };
      return loaded;
    });
    promise.catch(() => {
      promise = null;
    });
  }
  return promise;
}

export function mapsIfLoaded(): MapData | null {
  return loaded;
}
