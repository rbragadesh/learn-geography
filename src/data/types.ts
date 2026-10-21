export type LonLat = [number, number];

export type IndiaRegion = 'North' | 'West' | 'Central' | 'East' | 'Northeast' | 'South' | 'Islands';

export interface StateUT {
  id: string;
  name: string;
  type: 'state' | 'ut';
  capital: string;
  /** Extra detail about the capital (second capitals, renamed cities...). */
  capitalNote?: string;
  capitalLL: LonLat;
  region: IndiaRegion;
  language: string;
  emoji: string;
  famousFor: string[];
  funFact: string;
  /** How a text-to-speech voice should say the capital, when it tends to get it wrong. */
  sayCapital?: string;
}

export type Continent = 'Asia' | 'Europe' | 'Africa' | 'North America' | 'South America' | 'Oceania';

export interface Country {
  id: string; // ISO 3166-1 alpha-3, same as the map feature id
  iso2: string;
  name: string;
  capital: string;
  capitalNote?: string;
  continent: Continent;
  /** 1 = must know (her countries + neighbours + giants), 2 = important, 3 = everything else */
  tier: 1 | 2 | 3;
  fact?: string;
  /** Spans two continents - skip "which continent?" questions. */
  transcontinental?: boolean;
  /** Capital is disputed or undefined - skip capital questions. */
  noCapitalQuiz?: boolean;
}

export type DiagramId =
  | 'island' | 'peninsula' | 'lake' | 'bay' | 'strait' | 'isthmus' | 'delta' | 'mountain' | 'valley'
  | 'plateau' | 'plain' | 'volcano' | 'layers' | 'daynight' | 'compass' | 'globe' | 'watercycle'
  | 'hemispheres' | 'latlong' | 'seasons';

export interface Fact {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  q: string;
  a: string;
  wrong: string[];
  explain: string;
  emoji?: string;
  diagram?: DiagramId;
  /** Highlight these features on a map while asking. */
  map?: { kind: 'india' | 'world'; ids: string[] };
}

export interface MapFeatureRef {
  map: 'india' | 'world';
  id: string;
}
