import { useEffect, useState, useRef } from "react";
import Row from "../components/Row";
import Button from "../components/Button";
import PotMap from "../components/PotMap";
import Log from "../components/Log";
import ImagePreview from "../components/ImagePreview";
import { initBenchBotMap } from "../utils/calculation";
import {
  BenchBotConfig,
  BenchBotData,
  PotData,
  Image,
} from "../interfaces/BenchBotTypes";
import { moveXandZ, moveY, takeImage } from "../utils/api";
import { defaultBenchBotConfig, defaultImage } from "../utils/constants";
import {
  loadBenchBotConfig,
  loadSpeciesMap,
  saveBenchBotConfig,
} from "../utils/configs";

export default function Traversal() {
  const [benchBotConfig, setBenchBotConfig] = useState<BenchBotConfig>(
    defaultBenchBotConfig
  );
  const [speciesMap, setSpeciesMap] = useState<PotData[][]>([]);

  const [logs, setLogs] = useState<string[]>([]);
  const [Image, setImage] = useState<Image>(defaultImage);

  const stopRef = useRef(false);

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
      // TODO: update numberOfRows
      traverseBenchBot(
        { potsPerRow, numberOfRows: speciesMap.length, rowSpacing, potSpacing },
        { location, map, direction }
      );
    }
  };

  const setPotVisited = (row: number, col: number) => {
    let currMap = speciesMap;
    currMap[row][col].visited = true;
    console.log("currMap", currMap);
    setSpeciesMap(currMap);
  };

  // TODO: the map in benchbotdata have different rows, need to be aligned with the speciesMap
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
        // visit pot
        map[row][pot] = 1;
        setPotVisited(row, pot);
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

  useEffect(() => {
    const res = loadBenchBotConfig();
    if (!res) return;
    setBenchBotConfig(res);
    const map = loadSpeciesMap();
    if (!map) return;
    setSpeciesMap(map);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "400px" }}>
        <h5 style={{ textAlign: "center", margin: "1rem" }}>Species Config</h5>
        <Row>
          <span style={{ width: "300px" }}>Pots Per Row: </span>
          <input
            value={benchBotConfig.potsPerRow}
            disabled
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
        </Row>

        <Row>
          <span style={{ width: "300px" }}>Total Rows: </span>
          <input
            value={speciesMap.length}
            disabled
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
        </Row>

        <Row>
          <span style={{ width: "300px" }}>Row Spacing: </span>
          <input
            value={benchBotConfig.rowSpacing}
            disabled
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
        </Row>

        <Row>
          <span style={{ width: "300px" }}>Pot Spacing: </span>
          <input
            value={benchBotConfig.potSpacing}
            disabled
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
        </Row>

        <Row>
          <Button
            name={"Start"}
            onClick={startTraversal}
            styles={{ width: "400px", color: "#61dac3" }}
          />
        </Row>
        <Row>
          <Button
            name={"Pause"}
            onClick={() => {
              appendLog("Paused BenchBot traversal.");
              stopRef.current = true;
            }}
            styles={{ width: "400px", color: "#f65a5b" }}
          />
        </Row>

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
      <div>
        <PotMap speciesMap={speciesMap} />
        <Log logs={logs} clearLog={() => setLogs([])} />
      </div>
    </div>
  );
}
