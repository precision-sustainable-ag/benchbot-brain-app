import { BenchBotConfig, PotData } from "../interfaces/BenchBotTypes";
import { saveBenchBotConfig } from "./configs";

export const initBenchBotConfig = (
  config: BenchBotConfig,
  map: PotData[][]
) => {
  const numberOfRows = map.length;
  const location = [0, 0];
  const direction = 1;
  saveBenchBotConfig({ ...config, numberOfRows }, { location, map, direction });
  return { location, map, direction };
};
