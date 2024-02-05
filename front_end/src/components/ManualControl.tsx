import { useState } from "react";
import Button from "./Button";
import Row from "./Row";
import { homeX, homeZ, moveXandZ, moveY, takeImage } from "../utils/api";
import { ControlButtonsMinus, ControlButtonsPlus } from "./ControlButtons";
import Log from "./Log";
import ImagePreview from "./ImagePreview";

export interface Image {
  status: "pending" | "success" | "error";
  image: Blob | null;
  errorMsg: string;
}

export const defaultImage: Image = {
  status: "error",
  image: null,
  errorMsg: "No image available",
};

function ManualControl() {
  const [xValue, setXValue] = useState(0);
  const [yValue, setYValue] = useState(0);
  const [zValue, setZValue] = useState(0);

  const [logs, setLogs] = useState<string[]>([]);

  const [Image, setImage] = useState<Image>(defaultImage);

  const appendLog = (log: string) => {
    const currentTime = new Date().toLocaleString();
    setLogs([...logs, currentTime + ": " + log]);
  };

  const loadImage = async () => {
    setImage({ ...Image, status: "pending" });
    const imageData = await takeImage();
    if (!imageData.error && imageData.data)
      setImage({
        ...Image,
        status: "success",
        image: imageData.data,
      });
    else
      setImage({
        ...Image,
        status: "error",
        errorMsg: imageData.message,
      });
  };

  const moveRobot = (axis: "X" | "Y" | "Z", distance: number) => {
    appendLog(`move ${axis}: ${distance}cm`);
    if (axis === "X") moveXandZ(distance, 0);
    else if (axis === "Y") moveY(distance);
    else if (axis === "Z") moveXandZ(0, distance);
  };

  const AxisControl = ({
    axis,
    value,
    setAxisValue,
    moveRobot,
  }: {
    axis: "X" | "Y" | "Z";
    value: number;
    setAxisValue: (num: number) => void;
    moveRobot: (axis: "X" | "Y" | "Z", distance: number) => void;
  }) => {
    return (
      <>
        <ControlButtonsMinus setValue={(num) => setAxisValue(value + num)} />
        <div>
          <input
            value={value}
            type="number"
            onChange={(e) =>
              setAxisValue(e.target.value === "" ? 0 : parseInt(e.target.value))
            }
            style={{ fontSize: "2rem", width: "200px" }}
          />
          cm
        </div>
        <ControlButtonsPlus setValue={(num) => setAxisValue(value + num)} />
        <Button
          name={`+ ${axis}`}
          onClick={() => {
            moveRobot(axis, value);
          }}
        />
        <Button
          name={`- ${axis}`}
          onClick={() => {
            moveRobot(axis, -value);
          }}
        />
      </>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "800px" }}>
        <h5 style={{ textAlign: "center", margin: "1rem" }}>Manual Control</h5>

        <Row styles={{ justifyContent: "space-around" }}>
          <Button name={"Home X"} onClick={homeX} />
          <Button name={"Home Z"} onClick={homeZ} />
        </Row>

        <Row>
          <AxisControl
            axis="X"
            value={xValue}
            setAxisValue={setXValue}
            moveRobot={moveRobot}
          />
        </Row>

        <Row>
          <AxisControl
            axis="Y"
            value={yValue}
            setAxisValue={setYValue}
            moveRobot={moveRobot}
          />
        </Row>

        <Row>
          <AxisControl
            axis="Z"
            value={zValue}
            setAxisValue={setZValue}
            moveRobot={moveRobot}
          />
        </Row>

        <Row styles={{ justifyContent: "space-around" }}>
          <Button
            name={"Emergency Stop"}
            styles={{ color: "red", width: "300px" }}
            onClick={() => {}}
          />
          <Button
            name={"To this position"}
            styles={{ width: "300px" }}
            onClick={() => {
              appendLog(`move X: ${xValue}cm, Y: ${yValue}cm, Z: ${zValue}cm`);
              moveXandZ(xValue, zValue);
              moveY(yValue);
            }}
          />
        </Row>

        <Row styles={{ justifyContent: "space-around" }}>
          <Button
            name={"Pause"}
            styles={{ width: "300px" }}
            onClick={() => {}}
          />
          <Button
            name={"Take Image"}
            styles={{ width: "300px" }}
            onClick={() => {
              appendLog("Take Image.");
              loadImage();
            }}
          />
        </Row>
      </div>

      <div>
        <Log logs={logs} clearLog={() => setLogs([])} />
        <ImagePreview
          status={Image.status}
          imagePreview={Image.image}
          imageErrMsg={Image.errorMsg}
          retry={loadImage}
        />
      </div>
    </div>
  );
}

export default ManualControl;
