import { BenchBotConfig, BenchBotData } from "../interfaces/BenchBotTypes";

const localStorageKey = "BenchBotConfig";

export const loadBenchBotConfig = () => {
  const data = localStorage.getItem(localStorageKey);
  if (!data) return;
  const {
    potsPerRow,
    numberOfRows,
    rowSpacing,
    potSpacing,
    location,
    map,
    direction,
  } = JSON.parse(data);

  console.log("loaded data", {
    config: { potsPerRow, numberOfRows, rowSpacing, potSpacing },
    data: { location, map, direction },
  });

  return {
    potsPerRow,
    numberOfRows,
    rowSpacing,
    potSpacing,
    location,
    map,
    direction,
  };
};

export const saveBenchBotConfig = (
  config: BenchBotConfig,
  data: BenchBotData
) => {
  console.log("saved data", config, data);
  localStorage.setItem(localStorageKey, JSON.stringify({ ...config, ...data }));
};
