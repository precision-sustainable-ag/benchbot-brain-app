export interface BenchBotConfig {
  potsPerRow: number;
  numberOfRows: number;
  rowSpacing: number;
  potSpacing: number;
  species?: string;
}

export interface BenchBotData {
  location: number[];
  map: number[][];
  direction: number;
}
