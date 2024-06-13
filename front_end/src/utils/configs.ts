// const BenchBotConfigKey = "BenchBotConfig";
const CameraConfigKey = "CameraConfig";
// const SpeciesMapKey = "SpeciesMap";

interface CameraConfig {
  IP: string;
  port: string;
}

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
