import { PotData } from "../interfaces/BenchBotTypes";

// reset benchbot map and traversal status
export const resetBenchBotData = (speciesMap: PotData[][]) => {
  const location = [0, 0];
  const direction = 1;
  const map = speciesMap.map((row) =>
    row.map((pot) => ({
      ...pot,
      status: "unVisited" as "unVisited",
    }))
  );
  return { location, map, direction };
};
