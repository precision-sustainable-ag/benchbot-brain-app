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

export const saveConfigUsingAPI = async (
  config: BenchBotConfig,
  data: BenchBotData
) => {
  // TODO: update url here and in the backend
  const url = "http://localhost:8042" + "/saveConfig/";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...config, ...data }),
  });
  console.log("saved data to backend");
  console.log(res);
};

interface apiConfig {
  potsPerRow: number;
  numberOfRows: number;
  rowSpacing: number;
  potSpacing: number;
  location: number[];
  map: PotData[][];
  direction: number;
}

// TODO: need to define return type of the api
export const loadConfigFromAPI = async () => {
  const url = "http://localhost:8042" + "/loadConfig";
  try{
    // TODO: this returns even it's 404
    const res: apiConfig = await (await fetch(url)).json();
    console.log("result", res);
    return res;

  } catch(err) {
    console.log(err);
    return null;
  }
};

export const loadBenchBotConfig = async () => {
  // const data = localStorage.getItem(BenchBotConfigKey);
  // if (!data) return;
  // const {
  //   potsPerRow,
  //   numberOfRows,
  //   rowSpacing,
  //   potSpacing,
  //   location,
  //   map,
  //   direction,
  // } = JSON.parse(data);
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
  if (potsPerRow === undefined) return null;

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
  // localStorage.setItem(
  //   BenchBotConfigKey,
  //   JSON.stringify({ ...config, ...data })
  // );
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
