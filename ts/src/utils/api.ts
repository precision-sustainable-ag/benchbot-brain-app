const baseUrl = "http://localhost:8042";

export const moveXandZ = async (x: number, z: number) => {
  console.log("move x", x, "move z", z);
  const url = baseUrl + `/clearcore?x=${x}&z=${z}`;
  const res = await (await fetch(url)).json();
  console.log(res);
};

export const moveY = async (y: number) => {
  console.log("move y", y);
  const url = baseUrl + `/move_yaxis/${y}`;
  const res = await (await fetch(url)).json();
  console.log(res);
};

export const takeImage = async () => {
  const url = baseUrl + "/image";
  const res = await (await fetch(url)).json();
  console.log(res);
};

export const Homing = async () => {
  // TODO: update 999 to correct number
  const url = baseUrl + `/clearcore?x=999&z=999`;
  const res = await (await fetch(url)).json();
};
