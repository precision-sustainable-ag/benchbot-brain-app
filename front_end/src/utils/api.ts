import { BenchBotConfig, BenchBotData } from "../interfaces/BenchBotTypes";
import { ip, port } from "../../../brain_api/common/mini_comp_config.json";
const baseUrl = "http://localhost:8042";

const imageUrl = `http://${ip}:${port}`;
// testing api
// const imageUrl = "http://localhost:5001";

// TODO: build a interface for error message, add error handling for all apis,
// if an error happens, show it in the log

interface apiResponse {
  error: boolean;
  message: string;
  data?: Blob;
}

const defaultResponse: apiResponse = {
  error: false,
  message: "",
};

interface FetchResult<T> {
  data?: T;
  error?: Error | undefined;
}

interface APIConfig extends BenchBotConfig, BenchBotData {}

const customFetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<FetchResult<T>> => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }
    const data: T = await res.json();
    return { data };
  } catch (error) {
    return { error: error as Error };
  }
};

export const saveConfig = async (
  config: BenchBotConfig,
  data: BenchBotData
) => {
  const url = baseUrl + "/saveConfig/";
  const res = await customFetch<APIConfig>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...config, ...data }),
  });

  if (res.error) {
    // TODO: show error message to snackbar
    console.log("Failed to save config:", res.error);
    return null;
  } else {
    console.log("Successfully saved config:", res.data);
    return res.data;
  }
};

export const loadConfig = async () => {
  const url = baseUrl + "/loadConfig";
  const res = await customFetch<APIConfig>(url);

  if (res.error) {
    console.log("Failed to load config:", res.error);
    return null;
  } else {
    console.log("Successfully loaded config:", res.data);
    return res.data;
  }
};

export const moveXandZ = async (x: number, z: number) => {
  const url = baseUrl + `/move_xz_axis?x=${x}&z=${z}`;
  const res = await customFetch(url);
  if (res.error) {
    console.log("Failed to move on x axis", res.error);
  } else {
    console.log("move x", x, "move z", z);
    return res.data;
  }
};

// param y is in meter scale
export const moveY = async (y: number) => {
  const url = baseUrl + `/move_y_axis/${y}`;
  const res = await customFetch(url);
  if (res.error) {
    console.log("Failed to move on y axis", res.error);
  } else {
    console.log("move y", y);
    return res.data;
  }
};

export const homeX = async () => {
  const url = baseUrl + `/home_x`;
  const res = await customFetch(url);
  if (res.error) {
    console.log("Failed to home x", res.error);
  } else {
    console.log("home x");
    return res.data;
  }
};

export const homeZ = async () => {
  const url = baseUrl + `/home_z`;
  const res = await customFetch(url);
  if (res.error) {
    console.log("Failed to home z", res.error);
  } else {
    console.log("home z");
    return res.data;
  }
};

export const takeImage = async () => {
  const response = defaultResponse;
  const url = imageUrl + "/image";
  try {
    const res = await fetch(url);
    if (!res.ok) {
      response.error = true;
      response.message = await res.text();
      return response;
    } else {
      response.error = false;
      response.data = await res.blob();
      console.log("taken image", response.data);
      return response;
    }
  } catch (error) {
    console.log("error", error);
    response.error = true;
    if (error instanceof TypeError) {
      response.message = error.message;
      return response;
    } else return response;
  }
};

// TODO: not used now
export const getImagePreview = async () => {
  const response = defaultResponse;
  const url = imageUrl + "/image_latest";
  try {
    const res = await fetch(url);
    if (!res.ok) {
      response.error = true;
      response.message = await res.text();
      return response;
    }
    response.data = await res.blob();
    return response;
  } catch (error) {
    response.error = true;
    if (error instanceof TypeError) {
      response.message = error.message;
      return response;
    } else return response;
  }
};

export const updateIPandPort = async (ip: string, port: string) => {
  const url = baseUrl + `/udp_update?udp_ip=${ip}&udp_port=${port}`;
  const res = await customFetch(url, { method: "POST" });
  if (res.error) {
    console.log(`Failed to update}`, res.error);
  } else {
    console.log(`updated Ip and port`);
    return res.data;
  }
};

export const nudge = async (direction: "left" | "right") => {
  const url = baseUrl + `/nudge_${direction}`;
  const res = await customFetch(url, { method: "PUT" });
  if (res.error) {
    console.log(`Failed to nudge ${direction}}`, res.error);
  } else {
    console.log(`nudge ${direction}`);
    return res.data;
  }
};

export const motorHold = async (param: "start" | "end") => {
  const url = baseUrl + `/${param}_motor_hold`;
  const res = await customFetch(url, { method: "PUT" });
  if (res.error) {
    console.log(`Failed to ${param} motor hold`, res.error);
  } else {
    console.log(`${param} motor hold`);
    return res.data;
  }
};

export const initializeWifi = async () => {
  const url = baseUrl + `/initialize_wifi`;
  const res = await customFetch(url, { method: "PUT" });
  if (res.error) {
    console.log("Error initializing Wifi.");
  } else {
    return res.data;
  }
};
