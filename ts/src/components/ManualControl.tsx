import { useState } from "react";
import Button from "./Button";
import Row from "./Row";
import { homeX, homeZ, moveXandZ, moveY, takeImage } from "../utils/api";
import ControlButtons from "./ControlButtons";
import Log from "./Log";

function ManualControl() {
  const [xValue, setXValue] = useState(0);
  const [yValue, setYValue] = useState(0);
  const [zValue, setZValue] = useState(0);

  const [logs, setLogs] = useState<string[]>([]);

  const [imagePreview, setImagePreview] = useState<Blob | null>(null);

  const appendLog = (log: string) => {
    const currentTime = new Date().toLocaleString();
    setLogs([...logs, currentTime + ": " + log]);
  };

  const loadImage = async () => {
    const imageData = await takeImage();
    setImagePreview(imageData);
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "800px" }}>
        <h5 style={{ textAlign: "center", margin: "1rem" }}>Manual Control</h5>

        <Row>
          <Button name={"Home X"} onClick={homeX} />
          <Button name={"Home Z"} onClick={homeZ} />
        </Row>

        <Row>
          <input
            value={xValue}
            type="number"
            onChange={(e) =>
              setXValue(e.target.value === "" ? 0 : parseInt(e.target.value))
            }
            style={{ fontSize: "2rem", width: "300px" }}
          />
          cm
          <ControlButtons setValue={(num) => setXValue(xValue + num)} />
          <Button
            name={"+ X"}
            onClick={() => {
              appendLog(`move X: ${xValue}cm`);
              moveXandZ(xValue, 0);
            }}
          />
          <Button
            name={"- X"}
            onClick={() => {
              appendLog(`move X: ${-xValue}cm`);
              moveXandZ(-xValue, 0);
            }}
          />
        </Row>

        <Row>
          <input
            type="number"
            value={yValue}
            onChange={(e) => {
              setYValue(e.target.value === "" ? 0 : parseInt(e.target.value));
            }}
            style={{ fontSize: "2rem", width: "300px" }}
          />
          cm
          <ControlButtons setValue={(num) => setYValue(yValue + num)} />
          <Button
            name={"+ Y"}
            onClick={() => {
              appendLog(`move Y: ${yValue}cm`);
              moveY(yValue / 100);
            }}
          />
          <Button
            name={"- Y"}
            onClick={() => {
              appendLog(`move Y: ${-yValue}cm`);
              moveY(-yValue / 100);
            }}
          />
        </Row>

        <Row>
          <input
            type="number"
            value={zValue}
            onChange={(e) =>
              setZValue(e.target.value === "" ? 0 : parseInt(e.target.value))
            }
            style={{ fontSize: "2rem", width: "300px" }}
          />
          cm
          <ControlButtons setValue={(num) => setZValue(zValue + num)} />
          <Button
            name={"+ Z"}
            onClick={() => {
              appendLog(`move Z: ${zValue}cm`);
              moveXandZ(0, zValue);
            }}
          />
          <Button
            name={"- Z"}
            onClick={() => {
              appendLog(`move Z: ${-zValue}cm`);
              moveXandZ(0, -zValue);
            }}
          />
        </Row>

        <Row>
          <Button
            name={"Emergency Stop"}
            styles={{ color: "red", width: "300px" }}
            onClick={() => {}}
          />
          <Button
            name={"To this position"}
            styles={{ width: "300px" }}
            onClick={() => {
              moveXandZ(xValue, zValue);
              moveY(yValue);
            }}
          />
        </Row>

        <Row>
          <Button
            name={"Pause"}
            styles={{ width: "300px" }}
            onClick={() => {}}
          />
          <Button
            name={"Take Image"}
            styles={{ width: "300px" }}
            onClick={loadImage}
          />
        </Row>
      </div>

      <div>
        {/* <div
          style={{
            border: "1px solid black",
            width: "400px",
            height: "500px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            padding: "20px",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
            <button
              key={number}
              onClick={() => {}}
              style={{ padding: "10px", fontSize: "16px" }}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => {}}
            style={{
              padding: "10px",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            .
          </button>
          <button
            onClick={() => {}}
            style={{
              padding: "10px",
              fontSize: "16px",
            }}
          >
            Delete
          </button>
        </div> */}
        <Log logs={logs} clearLog={() => setLogs([])} />
        <img
          src={imagePreview ? URL.createObjectURL(imagePreview) : ""}
          alt="taken image"
          style={{ width: "400px", paddingLeft: "20px" }}
        />
      </div>
    </div>
  );
}

export default ManualControl;
