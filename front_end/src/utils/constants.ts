import {
  SpeciesConfig,
  PotData,
  BenchBotConfig,
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
};

export const defaultBenchBotConfig: BenchBotConfig = {
  potsPerRow: 0,
  numberOfRows: 0,
  rowSpacing: 0,
  potSpacing: 0,
};