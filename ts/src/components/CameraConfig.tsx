import { useState } from "react";
import Row from "./Row";
import Button from "./Button";

export default function CameraConfig() {
  const [ipAddress, setIpAddress] = useState("0.0.0.0");
  const [port, setPort] = useState("0000");

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Camera Config</h1>
      <Row>
        <span style={{ flex: 1 }}>IP Address: </span>
        <input
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          style={{ fontSize: "2rem", flex: 1 }}
        />
      </Row>
      <Row>
        <span style={{ flex: 1 }}>Port: </span>
        <input
          value={port}
          onChange={(e) => setPort(e.target.value)}
          style={{ fontSize: "2rem", flex: 1 }}
        />
      </Row>
      <Row>
        <Button name="Save" onClick={() => {}} />
      </Row>
    </div>
  );
}
