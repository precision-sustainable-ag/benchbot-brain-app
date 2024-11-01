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
  status: PotStatus;
}

export type PotStatus =
  | "unVisited"
  | "visiting"
  | "nextVisit"
  | "visited"
  | "failed"
  | "skipped";

export type traversalStatus = "stopped" | "running" | "paused";

export interface Image {
  status: "pending" | "success" | "error";
  image: Blob | null;
  errorMsg: string;
  imageTaken: number;
}
