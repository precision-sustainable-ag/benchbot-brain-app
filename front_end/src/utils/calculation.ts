import { BenchBotConfig, PotData } from "../interfaces/BenchBotTypes";
import { saveConfig } from "./api";

// TODO: init function for benchBorConfig and benchBotData, not used for now(in Species map page)
export const initBenchBotConfig = (
  config: BenchBotConfig,
  map: PotData[][]
) => {
  const numberOfRows = map.length;
  const location = [0, 0];
  const direction = 1;
  saveConfig({ ...config, numberOfRows }, { location, map, direction });
  return { location, map, direction };
};
