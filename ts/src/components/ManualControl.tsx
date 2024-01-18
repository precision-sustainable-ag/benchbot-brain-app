import { useState } from "react";
import Button from "./Button";
import Row from "./Row";

const defaultLogs = [
  'INFO:     127.0.0.1:51512 - "GET /assets/index-b572195d.js HTTP/1.1" 304 Not Modified',
  'INFO:     127.0.0.1:51512 - "GET / HTTP/1.1" 304 Not Modified',
];

const baseUrl = "http://localhost:8042";

function ManualControl() {
  const [xValue, setXValue] = useState(0);
  const [yValue, setYValue] = useState(0);
  const [zValue, setZValue] = useState(0);

  const [logs, setLogs] = useState(defaultLogs);

  const moveRobot = async (x: number, y = 0, z: number) => {
    console.log("api call param", x, y, z);
    setLogs([`move x: ${x} z: ${z}`, ...logs]);
    const url = baseUrl + `/clearcore?x=${x}&z=${z}`;
    const res = await (await fetch(url)).json();
    console.log(res);
  };

  const moveY = async (y: number) => {
    console.log("api call move y",  y);
    setLogs([`move y: ${y}`, ...logs]);
    const url = baseUrl + `/move_yaxis/${y}`;
    const res = await (await fetch(url)).json();
    console.log(res);
  }

  const takeImage = async () => {
    
    const url = baseUrl + "/image";
    const res = await (await fetch(url)).json();
    console.log(res);
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Manual Control</h1>

      <Row>
        <Button name={"Home X"} onClick={() => {}} />
        <Button
          name={"Home Z"}
          onClick={() => {
            moveRobot(999, 0, 999);
          }}
        />
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
        <Button
          name={"+ X"}
          onClick={() => {
            moveRobot(xValue, 0, 0);
          }}
        />
        <Button
          name={"- X"}
          onClick={() => {
            moveRobot(-xValue, 0, 0);
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
        <Button name={"+ Y"} onClick={() => {
          moveY(yValue);
        }} />
        <Button name={"- Y"} onClick={() => {
          moveY(-yValue);
        }} />
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
        <Button
          name={"+ Z"}
          onClick={() => {
            moveRobot(0, 0, zValue);
          }}
        />
        <Button
          name={"- Z"}
          onClick={() => {
            moveRobot(0, 0, -zValue);
          }}
        />
      </Row>

      <Row>
        <Button
          name={"Emergency Stop"}
          styles={{ color: "red" }}
          onClick={() => {}}
        />
        <Button
          name={"To this position"}
          onClick={() => {
            moveRobot(xValue, 0, zValue);
            moveY(yValue);
          }}
        />
        <Button name={"Pause"} onClick={() => {}} />
        <Button name={"Take Image"} onClick={() => {
          takeImage();
        }} />
      </Row>

      <div>
        <div style={{ textAlign: "center" }}>Logs:</div>
        {logs.map((log, i) => (
          <p key={i} style={{ fontSize: "1rem" }}>
            {log}
          </p>
        ))}
      </div>
    </div>
  );
}

export default ManualControl;
