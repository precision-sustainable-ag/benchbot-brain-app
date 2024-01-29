import { useEffect, useState } from "react";
import Row from "../components/Row";
import Button from "../components/Button";
import { loadCameraConfig } from "../utils/configs";
import { updateIPandPort } from "../utils/api";

export default function CameraConfig() {
  const [ipAddress, setIpAddress] = useState("127.0.0.1");
  const [port, setPort] = useState("1234");

  const [ipAddressValidate, setIpAddressValidate] = useState(true);
  const [portValidate, setPortValidate] = useState(true);
  const [validateText, setValidateText] = useState("");

  const handleSave = async () => {
    const ipRegex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
    const ipTest = ipRegex.test(ipAddress) ? true : false;
    setIpAddressValidate(ipTest);

    const portNumber = parseInt(port);
    const portTest =
      isNaN(portNumber) || portNumber < 0 || portNumber > 65535 ? false : true;
    setPortValidate(portTest);
    if (ipTest && portTest) {
      // saveCameraConfig({ IP: ipAddress, port });
      // call backend to update ip and port
      await updateIPandPort(ipAddress, port);
      setValidateText("Camera config saved.");
    } else {
      setValidateText("Please check your input!");
    }
  };

  // initially load config
  useEffect(() => {
    const config = loadCameraConfig();
    if (!config) return;
    const { IP, port } = config;
    setIpAddress(IP);
    setPort(port);
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Camera Config</h1>
      <Row>
        <span style={{ width: "300px" }}>IP Address: </span>
        <input
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          style={{
            fontSize: "2rem",
            width: "300px",
            borderColor: ipAddressValidate ? "" : "red",
          }}
        />
      </Row>
      <Row>
        <span style={{ width: "300px" }}>Port: </span>
        <input
          value={port}
          onChange={(e) => setPort(e.target.value)}
          style={{
            fontSize: "2rem",
            width: "300px",
            borderColor: portValidate ? "" : "red",
          }}
        />
      </Row>
      <Row>
        <Button name="Save" onClick={handleSave} />
        <span>{validateText}</span>
      </Row>
    </div>
  );
}
