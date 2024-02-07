import { useEffect, useState, useRef } from "react";
import Row from "../components/Row";
import Button from "../components/Button";
import { initBenchBotMap } from "../utils/calculation";
import { loadBenchBotConfig, saveBenchBotConfig } from "../utils/configs";
import {
  ControlButtonsMinus,
  ControlButtonsPlus,
} from "../components/ControlButtons";
import Log from "../components/Log";
import ImagePreview from "../components/ImagePreview";
import {
  BenchBotConfig,
  BenchBotData,
  Image,
} from "../interfaces/BenchBotTypes";
import { moveXandZ, moveY, takeImage } from "../utils/api";
import { defaultBenchBotConfig, defaultImage } from "../utils/constants";

export default function BenchbotConfig() {
  const [benchBotConfig, setBenchBotConfig] = useState<BenchBotConfig>(
    defaultBenchBotConfig
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [stop, setStop] = useState(false);

  const [Image, setImage] = useState<Image>(defaultImage);

  const stopRef = useRef(stop);

  const setBenchBotConfigByParam = (param: string, value: number | string) => {
    setBenchBotConfig({ ...benchBotConfig, [param]: value });
  };

  const appendLog = (log: string) => {
    const currentTime = new Date().toLocaleString();
    setLogs((prev) => [...prev, currentTime + ": " + log]);
  };

  const loadImage = async () => {
    appendLog("Taking image.");
    setImage({ ...Image, status: "pending" });
    const imageData = await takeImage();
    // console.log("imageData", imageData);
    if (!imageData.error && imageData.data) {
      appendLog("Loading image success.");
      setImage({
        ...Image,
        status: "success",
        image: imageData.data,
      });
    } else {
      appendLog("Failed loading image, retrying...");
      // retake image here
      const retakeImageData = await takeImage();
      if (!retakeImageData.error && retakeImageData.data) {
        appendLog("Loading image success.");
        setImage({
          ...Image,
          status: "success",
          image: retakeImageData.data,
        });
      } else {
        appendLog("Failed loading image. Skipped");
        setImage({
          ...Image,
          status: "error",
          errorMsg: retakeImageData.message,
        });
      }
    }
  };

  const startTraversal = () => {
    stopRef.current = false;
    setStop(false);
    const res = loadBenchBotConfig();
    if (!res) {
      const { location, map, direction } = initBenchBotMap(benchBotConfig);
      traverseBenchBot(benchBotConfig, { location, map, direction });
    } else {
      const {
        potsPerRow,
        numberOfRows,
        rowSpacing,
        potSpacing,
        location,
        map,
        direction,
      } = res;
      appendLog("Start BenchBot traversal.");
      traverseBenchBot(
        { potsPerRow, numberOfRows, rowSpacing, potSpacing },
        { location, map, direction }
      );
    }
  };

  const traverseBenchBot = async (
    config: BenchBotConfig,
    data: BenchBotData
  ) => {
    // mock sleep function
    const sleep = (delay: number) =>
      new Promise((resolve) => setTimeout(resolve, delay));

    let { location, map, direction } = data;
    let [row, pot] = location;
    let { potsPerRow, numberOfRows, rowSpacing, potSpacing } = config;

    for (; row < numberOfRows; row += 1) {
      for (; pot >= 0 && pot < potsPerRow; pot += 1 * direction) {
        // if this pot had visited, continue the loop
        if (map[row][pot] === 1) continue;
        await sleep(1000);
        await loadImage();
        if (stopRef.current) {
          appendLog("Traversal stopped.");
          let location = [row, pot];
          saveBenchBotConfig(
            { potsPerRow, numberOfRows, rowSpacing, potSpacing },
            { location, map, direction }
          );
          break;
        }
        map[row][pot] = 1;
        appendLog(`visited pot at row ${row} pot ${pot}`);
        if (
          !(
            (pot === 0 && direction === -1) ||
            (pot === potsPerRow - 1 && direction === 1)
          )
        ) {
          appendLog(`move X: ${direction * potSpacing}`);
          await moveXandZ(direction * potSpacing, 0);
        }
      }

      // break outside loop if stop triggered
      if (stopRef.current) break;

      if (row !== numberOfRows - 1) {
        await sleep(1000);
        appendLog(`move Y: ${rowSpacing / 100}`);
        await moveY(rowSpacing);
      }

      // set overflowed postPerRow back
      if (pot === potsPerRow) pot -= 1;
      if (pot === -1) pot += 1;
      direction *= -1;
    }
    if (!stopRef.current) {
      appendLog("BenchBot traversal finished.");
      let location = [row, pot];
      saveBenchBotConfig(
        { potsPerRow, numberOfRows, rowSpacing, potSpacing },
        { location, map, direction }
      );
    }
  };

  // load benchbot config from localstorage
  useEffect(() => {
    const res = loadBenchBotConfig();
    if (!res) return;
    const { potsPerRow, numberOfRows, rowSpacing, potSpacing } = res;
    setBenchBotConfig({
      ...benchBotConfig,
      potsPerRow,
      numberOfRows,
      rowSpacing,
      potSpacing,
    });
    appendLog("Loaded config from history");
  }, []);

  // update stopRef
  useEffect(() => {
    // stopRef.current = stop;
  }, [stop]);

  const ValInput = ({
    name,
    configName,
    value,
    setValue,
    unit,
  }: {
    name: string;
    configName: string;
    value: number;
    setValue: (param: string, value: number | string) => void;
    unit?: string;
  }) => {
    return (
      <>
        <span style={{ width: "300px" }}>{name}</span>
        <ControlButtonsMinus
          setValue={(num) => setValue(configName, value + num)}
        />
        <div>
          <input
            type="number"
            value={value}
            onChange={(e) =>
              setValue(
                configName,
                e.target.value === "" ? 0 : parseInt(e.target.value)
              )
            }
            size={2}
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
          {unit}
        </div>
        <ControlButtonsPlus
          setValue={(num) => setValue(configName, value + num)}
        />
      </>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "800px" }}>
        <h5 style={{ textAlign: "center", margin: "1rem" }}>Benchbot Config</h5>
        <Row>
          <ValInput
            name={"Pots per row:"}
            configName={"potsPerRow"}
            value={benchBotConfig.potsPerRow}
            setValue={setBenchBotConfigByParam}
          />
        </Row>
        <Row>
          <ValInput
            name={"Number of rows: "}
            configName={"numberOfRows"}
            value={benchBotConfig.numberOfRows}
            setValue={setBenchBotConfigByParam}
          />
        </Row>
        <Row>
          <ValInput
            name={"Row spacing: "}
            configName={"rowSpacing"}
            value={benchBotConfig.rowSpacing}
            setValue={setBenchBotConfigByParam}
            unit="cm"
          />
        </Row>
        <Row>
          <ValInput
            name={"Pot spacing: "}
            configName={"potSpacing"}
            value={benchBotConfig.potSpacing}
            setValue={setBenchBotConfigByParam}
            unit="cm"
          />
        </Row>

        <Row styles={{ justifyContent: "space-around" }}>
          <Button name="Init" onClick={() => initBenchBotMap(benchBotConfig)} />
          <Button
            name="Start"
            onClick={startTraversal}
            styles={{ color: "#61dac3" }}
          />
          <Button
            name="Pause"
            onClick={() => {
              appendLog("Paused BenchBot traversal.");
              setStop(true);
              stopRef.current = true;
            }}
            styles={{ color: "#f65a5b" }}
          />
        </Row>
      </div>
      <div>
        <Log logs={logs} clearLog={() => setLogs([])} />
        <ImagePreview
          status={Image.status}
          imagePreview={Image.image}
          imageErrMsg={Image.errorMsg}
          retry={() => {
            stopRef.current = false;
            startTraversal();
          }}
          showRetry={false}
        />
      </div>
    </div>
  );
}
