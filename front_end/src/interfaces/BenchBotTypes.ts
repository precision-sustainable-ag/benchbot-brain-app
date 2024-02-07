export interface BenchBotConfig {
  potsPerRow: number;
  numberOfRows: number;
  rowSpacing: number;
  potSpacing: number;
}

export interface BenchBotData {
  location: number[];
  map: number[][];
  direction: number;
}

export interface SpeciesConfig {
  numberOfRows: number;
  species: string;
}

export interface PotConfig {
  species: string;
  removed: boolean;
  visited: boolean;
}
