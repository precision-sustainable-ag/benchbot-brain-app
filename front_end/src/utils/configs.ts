import {
  BenchBotConfig,
  BenchBotData,
  // PotData,
} from "../interfaces/BenchBotTypes";

const BenchBotConfigKey = "BenchBotConfig";
const CameraConfigKey = "CameraConfig";
// const SpeciesMapKey = "SpeciesMap";

interface CameraConfig {
  IP: string;
  port: string;
}

export const loadBenchBotConfig = () => {
  const data = localStorage.getItem(BenchBotConfigKey);
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

  // console.log("loaded data", {
  //   config: { potsPerRow, numberOfRows, rowSpacing, potSpacing },
  //   data: { location, map, direction },
  // });

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
  localStorage.setItem(
    BenchBotConfigKey,
    JSON.stringify({ ...config, ...data })
  );
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
