import {
  SpeciesConfig,
  PotData,
  BenchBotConfig,
  Image,
  BenchBotData,
} from "../interfaces/BenchBotTypes";

export const defaultSpecies = ["Barley", "Buckwheat", "Cereal Rye"];

export const defaultSpeciesConfig: SpeciesConfig = {
  numberOfRows: 0,
  species: "",
};

export const defaultPotData: PotData = {
  species: "",
  removed: false,
  visited: false,
  status: "unVisited",
};

export const defaultBenchBotConfig: BenchBotConfig = {
  potsPerRow: 0,
  numberOfRows: 0,
  rowSpacing: 0,
  potSpacing: 0,
};

export const defaultBenchBotData: BenchBotData = {
  location: [0, 0],
  map: [],
  direction: 1,
};

export const defaultImage: Image = {
  status: "error",
  image: null,
  errorMsg: "No image available",
};
