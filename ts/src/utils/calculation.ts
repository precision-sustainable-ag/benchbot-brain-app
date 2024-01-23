import { BenchBotConfig, BenchBotData } from "../components/BenchbotConfig";

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

export const initBenchBotMap = (config: BenchBotConfig) => {
  const { potsPerRow, numberOfRows } = config;
  const location = [0, 0];
  const map = Array(numberOfRows)
    .fill(0)
    .map(() => Array(potsPerRow).fill(0));
  const direction = 1;
  saveBenchBotConfig(config, { location, map, direction });
  return { location, map, direction };
};

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

export const traverseBenchBot = async (
  config: BenchBotConfig,
  data: BenchBotData,
  stop: boolean
) => {
  let { location, map, direction } = data;
  let [row, pot] = location;
  const { potsPerRow, numberOfRows } = config;
  for (; row < numberOfRows; row += 1) {
    // move benchbot by potSpacing(not move on first loop)
    // if (direction < 0) pot = potsPerRow - 1;
    for (; pot >= 0 && pot < potsPerRow; pot += 1 * direction) {
      map[row][pot] = 1;
      console.log(`visit pot at row ${row} pot ${pot}`, stop);
      await sleep(1000);
      console.log("calculation", stop);
      // move benchbot by rowSpacing
      if (stop) break;
    }
    if (stop) break;

    if (pot === potsPerRow) pot -= 1;
    if (pot === -1) pot += 1;
    direction *= -1;
  }
};
