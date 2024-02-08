export interface BenchBotConfig {
  potsPerRow: number;
  numberOfRows: number;
  rowSpacing: number;
  potSpacing: number;
}

export interface BenchBotData {
  location: number[];
  map: PotData[][];
  direction: number;
}

export interface SpeciesConfig {
  numberOfRows: number;
  species: string;
}

export interface PotData {
  species: string;
  removed: boolean;
  visited: boolean;
}

export interface Image {
  status: "pending" | "success" | "error";
  image: Blob | null;
  errorMsg: string;
}
