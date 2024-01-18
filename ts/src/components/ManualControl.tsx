import { useState } from "react";
import Button from "./Button";
import Row from "./Row";

const logs = [
  "Jan 18 14:16:34 gold-garbanzo python3[476402]: /mnt/managed_home/farm-ng-user-ted-xu/benchbot-brain-app",
  'INFO:     127.0.0.1:51512 - "GET / HTTP/1.1" 304 Not Modified',
  'INFO:     127.0.0.1:51512 - "GET /assets/index-b572195d.js HTTP/1.1" 304 Not Modified',
];

function ManualControl() {
  const [xValue, setXValue] = useState(0);
  const [yValue, setYValue] = useState(0);
  const [zValue, setZValue] = useState(0);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Manual Control</h1>

      <Row>
        <Button name={"Home X"} onClick={() => {}} />
        <Button name={"Home Z"} onClick={() => {}} />
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
        <Button name={"+ X"} onClick={() => {}} />
        <Button name={"- X"} onClick={() => {}} />
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
        <Button name={"+ Y"} onClick={() => {}} />
        <Button name={"- Y"} onClick={() => {}} />
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
        <Button name={"+ Z"} onClick={() => {}} />
        <Button name={"- Z"} onClick={() => {}} />
      </Row>

      <Row>
        <Button
          name={"Emergency Stop"}
          onClick={() => {}}
          styles={{ color: "red" }}
        />
        <Button name={"To this position"} onClick={() => {}} />
        <Button name={"Pause"} onClick={() => {}} />
      </Row>
      <div>
        <div style={{ textAlign: "center" }}>Logs:</div>
        {logs.reverse().map((log, i) => (
          <p key={i} style={{ fontSize: "1rem" }}>
            {log}
          </p>
        ))}
      </div>
    </div>
  );
}

export default ManualControl;
