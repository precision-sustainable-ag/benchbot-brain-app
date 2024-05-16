import { BenchBotConfig, BenchBotData } from "../interfaces/BenchBotTypes";
const baseUrl = "http://localhost:8042";

const imageUrl = "http://10.95.76.50:5000";
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

interface APIConfig extends BenchBotConfig, BenchBotData {
  startedMotorHold: boolean;
}

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
  data: BenchBotData,
  startedMotorHold: boolean
) => {
  const url = baseUrl + "/saveConfig/";
  const res = await customFetch<APIConfig>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...config, ...data, startedMotorHold }),
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
  console.log("move x", x, "move z", z);
  const url = baseUrl + `/move_xz_axis?x=${x}&z=${z}`;
  const res = await (await fetch(url)).json();
  console.log(res);
};

export const moveY = async (y: number) => {
  // param is in meter scale
  console.log("move y", y);
  const url = baseUrl + `/move_y_axis/${y}`;
  const res = await (await fetch(url)).json();
  console.log(res);
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
      console.log("response", response);
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

// FIXME: update home function api param for clearcore
export const homeX = async () => {
  const url = baseUrl + `/home_x`;
  const res = await (await fetch(url)).json();
  console.log(res);
};

export const homeZ = async () => {
  const url = baseUrl + `/home_z`;
  const res = await (await fetch(url)).json();
  console.log(res);
};

export const updateIPandPort = async (ip: string, port: string) => {
  const url = baseUrl + `/udp_update?udp_ip=${ip}&udp_port=${port}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errMsg = await res.text();
    console.log(errMsg);
  }
  const data = await res.json();
  console.log(data);
};

const fetchData = async (url: string, options = {}) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Fetch Status: ${res.status} ${res.statusText}`);
    }
    // TODO: NOTE: there might be more res structure like res.text()
    return await res.json();
  } catch (error) {
    console.error("Error when fetching: ", error);
    throw error;
  }
};

export const nudge = async (direction: "left" | "right") => {
  const url = baseUrl + `/nudge_${direction}`;
  try {
    const res = await fetchData(url);
    console.log(res);
  } catch (err) {
    console.log(err);
  }
};

export const motorHold = async (param: "start" | "end") => {
  const url = baseUrl + `/${param}_motor_hold`;
  try {
    const res = await fetchData(url);
    console.log(res);
  } catch (err) {
    console.log(err);
  }
};