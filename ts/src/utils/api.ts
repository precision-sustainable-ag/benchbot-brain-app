const baseUrl = "http://localhost:8042";

const takeImageUrl = "http://10.95.76.50:5000/image";

const previewImageUrl = "http://10.95.76.50:5000/img_preview";

export const moveXandZ = async (x: number, z: number) => {
  console.log("move x", x, "move z", z);
  const url = baseUrl + `/clearcore?x=${x}&z=${z}`;
  const res = await (await fetch(url)).json();
  console.log(res);
};

export const moveY = async (y: number) => {
  // param is in meter scale
  console.log("move y", y * 100);
  const url = baseUrl + `/move_yaxis/${y}`;
  const res = await (await fetch(url)).json();
  console.log(res);
};

export const takeImage = async () => {
  console.log("take image");
  const url = takeImageUrl;
  const res = await fetch(url);
  console.log(res);
};

export const getImagePreview = async () => {
  console.log("take image");
  const url = previewImageUrl;
  const res = await fetch(url);
  const data = await res.blob();
  console.log(res, data);
  return data;
};

// TODO: temporary home function
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
