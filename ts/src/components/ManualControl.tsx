import { useState } from "react";
import Button from "./Button";

function ManualControl() {
  const [xValue, setXValue] = useState(0);
  const [yValue, setYValue] = useState(0);
  const [zValue, setZValue] = useState(0);

  return (
    <div style={{ width: "500px" }}>
      <div>ManualControl Page</div>

      <div
        style={{
          padding: "10px 0",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Button name={"Home X"} onClick={() => {}} />
        <Button name={"Home Z"} onClick={() => {}} />
      </div>

      <div
        style={{
          padding: "10px 0",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <input
          value={xValue}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          onChange={(e) =>
            setXValue(e.target.value === "" ? 0 : parseInt(e.target.value))
          }
        />
        <Button name={"+ X"} onClick={() => {}} />
        <Button name={"- X"} onClick={() => {}} />
      </div>
      <div
        style={{
          padding: "10px 0",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <input
          value={yValue}
          onChange={(e) =>
            setYValue(e.target.value === "" ? 0 : parseInt(e.target.value))
          }
        />
        <Button name={"+ Y"} onClick={() => {}} />
        <Button name={"- Y"} onClick={() => {}} />
      </div>
      <div
        style={{
          padding: "10px 0",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <input
          value={zValue}
          onChange={(e) =>
            setZValue(e.target.value === "" ? 0 : parseInt(e.target.value))
          }
        />
        <Button name={"+ Z"} onClick={() => {}} />
        <Button name={"- Z"} onClick={() => {}} />
      </div>
      <div
        style={{
          padding: "10px 0",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Button name={"Emergency Stop"} onClick={() => {}} />
        <Button name={"Pause"} onClick={() => {}} />
      </div>
    </div>
  );
}

export default ManualControl;
