import {
  BenchBotConfig,
  BenchBotData,
  PotData,
} from "../interfaces/BenchBotTypes";

// const BenchBotConfigKey = "BenchBotConfig";
const CameraConfigKey = "CameraConfig";
// const SpeciesMapKey = "SpeciesMap";

interface CameraConfig {
  IP: string;
  port: string;
}

interface apiConfig {
  potsPerRow: number;
  numberOfRows: number;
  rowSpacing: number;
  potSpacing: number;
  location: number[];
  map: PotData[][];
  direction: number;
}

export const saveConfigUsingAPI = async (
  config: BenchBotConfig,
  data: BenchBotData
) => {
  // TODO: update url here and in the backend
  const url = "http://localhost:8042" + "/saveConfig/";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...config, ...data }),
    });
    if (!res.ok) throw new Error("Failed to post config!");
    const result: apiConfig = await res.json();
    console.log("Successfully save config!", result);
  } catch (err) {
    console.log("Error posting data:", err);
  }
};

export const loadConfigFromAPI = async () => {
  const url = "http://localhost:8042" + "/loadConfig";
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch config!");
    }
    const data: apiConfig = await res.json();
    console.log("result", data);
    return data;
  } catch (err) {
    console.log("Error fetching user data:", err);
    return null;
  }
};

export const loadBenchBotConfig = async () => {
  const res = await loadConfigFromAPI();
  if (!res) return null;
  const {
    potsPerRow,
    numberOfRows,
    rowSpacing,
    potSpacing,
    location,
    map,
    direction,
  } = res;

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
  saveConfigUsingAPI(config, data);
};

export const loadCameraConfig = () => {
  const data = localStorage.getItem(CameraConfigKey);
  if (!data) return;
  const { IP, port } = JSON.parse(data);
  console.log("loaded data", IP, port);
  return { IP, port };
};

export const saveCameraConfig = (cameraConfig: CameraConfig) => {
  console.log("saved data", cameraConfig);
  localStorage.setItem(CameraConfigKey, JSON.stringify(cameraConfig));
};
