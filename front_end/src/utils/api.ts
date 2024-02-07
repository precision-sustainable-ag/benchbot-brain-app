const baseUrl = "http://localhost:8042";

const imageUrl = "http://10.95.76.50:5000";

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

export const moveXandZ = async (x: number, z: number) => {
  console.log("move x", x, "move z", z);
  const url = baseUrl + `/clearcore?x=${x}&z=${z}`;
  const res = await (await fetch(url)).json();
  console.log(res);
};

export const moveY = async (y: number) => {
  // param is in meter scale
  console.log("move y", y);
  const url = baseUrl + `/move_yaxis/${y}`;
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
