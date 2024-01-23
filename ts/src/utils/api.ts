const baseUrl = "http://localhost:8042";

const imageUrl = "http://10.95.76.50:5000/image";

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
  const url = imageUrl;
  const res = await fetch(url);
  const data = await res.blob();
  console.log(res);
  return data;
};

export const home = async () => {
  // TODO: update 999 to correct number
  const url = baseUrl + `/clearcore?x=999&z=999`;
  const res = await (await fetch(url)).json();
  console.log(res);
};
