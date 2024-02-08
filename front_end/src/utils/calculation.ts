import { BenchBotConfig, PotData } from "../interfaces/BenchBotTypes";
import { saveBenchBotConfig } from "./configs";

// export const initBenchBotMap = (config: BenchBotConfig) => {
//   const { potsPerRow, numberOfRows } = config;
//   const location = [0, 0];
//   const map = Array(numberOfRows)
//     .fill(0)
//     .map(() => Array(potsPerRow).fill(0));
//   const direction = 1;
//   saveBenchBotConfig(config, { location, map, direction });
//   return { location, map, direction };
// };

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
