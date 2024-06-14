import { useEffect, useRef, useState } from "react";
import Row from "../components/Row";
import Button from "../components/Button";
import { loadCameraConfig } from "../utils/configs";
import { updateIPandPort } from "../utils/api";
import Keyboard, { KeyboardReactInterface } from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

export default function CameraConfig() {
  const [ipAddress, setIpAddress] = useState("127.0.0.1");
  const [port, setPort] = useState("1234");

  const [ipAddressValidate, setIpAddressValidate] = useState(true);
  const [portValidate, setPortValidate] = useState(true);
  const [validateText, setValidateText] = useState("");
  const [numpadSetText, setNumpadSetText] = useState<any>(null);

  const numpadRef = useRef<KeyboardReactInterface>();

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
    <div style={{ display: "flex" }}>
      <div style={{ width: "800px" }}>
        <h5 style={{ textAlign: "center" }}>Camera Config</h5>
        <Row>
          <span style={{ width: "300px" }}>IP Address: </span>
          <input
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            onFocus={() => {
              numpadRef.current!.setInput(ipAddress);
              setNumpadSetText(() => setIpAddress);
            }}
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
            onFocus={() => {
              numpadRef.current!.setInput(port);
              setNumpadSetText(() => setPort);
            }}
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
      <div style={{ width: "400px" }}>
        <Keyboard
          keyboardRef={(r: any) => (numpadRef.current = r)}
          onChange={(input: string) => {
            numpadSetText(input);
          }}
          layout={{
            default: ["1 2 3", "4 5 6", "7 8 9", "- 0 .", "{bksp}"],
          }}
          theme={"hg-theme-default hg-layout-numeric numeric-theme"}
        />
      </div>
    </div>
  );
}
