import { useEffect, useState, useRef } from "react";
import Row from "../components/Row";
import Button from "../components/Button";
import PotMap from "../components/PotMap";
import Log from "../components/Log";
import ImagePreview from "../components/ImagePreview";
import {
  BenchBotConfig,
  BenchBotData,
  Image,
} from "../interfaces/BenchBotTypes";
import { moveXandZ, moveY, takeImage } from "../utils/api";
import {
  defaultBenchBotConfig,
  defaultBenchBotData,
  defaultImage,
  defaultSpecies,
} from "../utils/constants";
import { loadBenchBotConfig, saveBenchBotConfig } from "../utils/configs";

export default function Traversal() {
  const [benchBotConfig, setBenchBotConfig] = useState<BenchBotConfig>(
    defaultBenchBotConfig
  );
  const [benchBotData, setBenchBotData] =
    useState<BenchBotData>(defaultBenchBotData);

  const [logs, setLogs] = useState<string[]>([]);
  const [Image, setImage] = useState<Image>(defaultImage);

  const stopRef = useRef(false);

  const appendLog = (log: string) => {
    const currentTime = new Date().toLocaleString();
    setLogs((prev) => [...prev, currentTime + ": " + log]);
  };

  const loadImage = async (): Promise<Image> => {
    appendLog("Taking image.");
    setImage({ ...Image, status: "pending" });
    const imageData = await takeImage();
    if (!imageData.error && imageData.data) {
      appendLog("Loading image success.");
      return {
        ...Image,
        status: "success",
        image: imageData.data,
      };
    } else {
      appendLog("Failed loading image, retrying...");
      // retake image here
      const retakeImageData = await takeImage();
      if (!retakeImageData.error && retakeImageData.data) {
        appendLog("Loading image success.");
        return {
          ...Image,
          status: "success",
          image: retakeImageData.data,
        };
      } else {
        appendLog("Failed loading image. Skipped");
        return {
          ...Image,
          status: "error",
          errorMsg: retakeImageData.message,
        };
      }
    }
  };

  const startTraversal = () => {
    stopRef.current = false;
    appendLog("Start BenchBot traversal.");
    traverseBenchBot(benchBotConfig, benchBotData);
  };

  const findNext = (row: number, col: number, direction: number) => {
    if (benchBotData.map.length === 0) return [0, 0];
    let totalCol = benchBotData.map[0].length;
    if (col === 0 && row % 2 === 1) {
      return [row + 1, col];
    } else if (col === totalCol - 1 && row % 2 === 0) {
      return [row + 1, col];
    } else return [row, col + direction];
  };

  const setStatus = (
    row: number,
    col: number,
    status: "unVisited" | "visiting" | "nextVisit" | "visited" | "failed"
  ) => {
    if (row < benchBotData.map.length) {
      let currMap = benchBotData.map;
      currMap[row][col].status = status;
      setBenchBotData({ ...benchBotData, map: currMap });
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
        setStatus(row, pot, "visiting");
        const [nextRow, nextPot] = findNext(row, pot, direction);
        setStatus(nextRow, nextPot, "nextVisit");
        // if this pot had visited or removed, continue the loop
        if (map[row][pot].status === "visited") {
          // setStatus(row, pot, "visited");
          continue;
        }
        if (map[row][pot].removed) {
          appendLog(`skipped pot at row ${row + 1} pot ${pot + 1}`);
        } else {
          const image = await loadImage();
          setImage(image);
          if (image.status === "error") {
            setStatus(row, pot, "failed");
            continue;
          }
          if (stopRef.current) {
            appendLog("Traversal stopped.");
            let location = [row, pot];
            setBenchBotConfig({
              ...benchBotConfig,
              potsPerRow,
              numberOfRows,
              rowSpacing,
              potSpacing,
            });
            setBenchBotData({ ...benchBotData, location, map, direction });
            // FIXME: temporary solution for benchbotdata would not updated here
            saveBenchBotConfig(benchBotConfig, {
              ...benchBotData,
              location,
              map,
              direction,
            });
            break;
          }
          // visit pot
          setStatus(row, pot, "visited");
          appendLog(`visited pot at row ${row + 1} pot ${pot + 1}`);
        }
        setStatus(row, pot, "visited");

        if (
          !(
            (pot === 0 && direction === -1) ||
            (pot === potsPerRow - 1 && direction === 1)
          )
        ) {
          appendLog(`move X: ${direction * potSpacing}`);
          await sleep(1000);
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
      setBenchBotConfig({
        ...benchBotConfig,
        potsPerRow,
        numberOfRows,
        rowSpacing,
        potSpacing,
      });
      setBenchBotData({ ...benchBotData, location, map, direction });
      saveBenchBotConfig(benchBotConfig, benchBotData);
    }
  };

  // load config from localStorage
  useEffect(() => {
    const res = loadBenchBotConfig();
    if (!res) return;
    const {
      potsPerRow,
      numberOfRows,
      rowSpacing,
      potSpacing,
      location,
      map,
      direction,
    } = res;
    setBenchBotConfig({
      ...benchBotConfig,
      potsPerRow,
      numberOfRows,
      rowSpacing,
      potSpacing,
    });
    setBenchBotData({ ...benchBotData, location, map, direction });
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "400px" }}>
        <h5 style={{ textAlign: "center", margin: "1rem" }}>Traversal</h5>
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
            value={benchBotConfig.numberOfRows}
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
        <PotMap speciesMap={benchBotData.map} species={defaultSpecies} />
        <Log logs={logs} clearLog={() => setLogs([])} />
      </div>
    </div>
  );
}
