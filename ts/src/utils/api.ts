const baseUrl = "http://localhost:8042";

const takeImageUrl = "http://10.95.76.50:5000/image";

const previewImageUrl = "http://10.95.76.50:5000/img_preview";

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
  const url = takeImageUrl;
  const res = await fetch(url);
  // error handling
  if (!res.ok) {
    response.error = true;
    response.message = await res.json();
  }
  return response;
};

export const getImagePreview = async () => {
  const response = defaultResponse;
  const url = previewImageUrl;
  const res = await fetch(url);
  // error handling
  if (!res.ok) {
    response.error = true;
    response.message = await res.json();
    return response;
  }
  response.data = await res.blob();
  return response;
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
