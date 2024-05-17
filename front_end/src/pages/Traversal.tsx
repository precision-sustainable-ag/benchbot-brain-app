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
import {
  motorHold,
  moveXandZ,
  moveY,
  nudge,
  saveConfig,
  takeImage,
} from "../utils/api";
import { defaultImage, defaultSpecies } from "../utils/constants";

interface TraversalProps {
  setOpen: (open: boolean) => void;
  setSnackBarContent: (content: string) => void;
  setStatusBarText: (status: string) => void;
  benchBotConfig: BenchBotConfig;
  setBenchBotConfig: (config: BenchBotConfig) => void;
  benchBotData: BenchBotData;
  setBenchBotData: (data: BenchBotData) => void;
  startedMotorHold: boolean;
  setStartedMotorHold: React.Dispatch<React.SetStateAction<boolean>>;
}

type traversalStatus = "stopped" | "running" | "paused";

export default function Traversal({
  setOpen,
  setSnackBarContent,
  setStatusBarText,
  benchBotConfig,
  setBenchBotConfig,
  benchBotData,
  setBenchBotData,
  startedMotorHold,
  setStartedMotorHold,
}: TraversalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [Image, setImage] = useState<Image>(defaultImage);

  const stopRef = useRef<traversalStatus>("stopped");

  const appendLog = (log: string) => {
    const currentTime = new Date().toLocaleString();
    setLogs((prev) => [...prev, currentTime + ": " + log]);
  };

  const loadImage = async (): Promise<Image> => {
    appendLog("Taking image.");
    setImage((prev) => ({ ...prev, status: "pending" }));
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

  const startTraversal = async () => {
    if (!startedMotorHold) {
      await motorHold("start");
      setStartedMotorHold(true);
    }
    stopRef.current = "running";
    appendLog("Start BenchBot traversal.");
    setStatusBarText("running");
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
    status:
      | "unVisited"
      | "visiting"
      | "nextVisit"
      | "visited"
      | "failed"
      | "skipped"
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
          continue;
        }
        if (map[row][pot].removed) {
          appendLog(`skipped pot at row ${row + 1} pot ${pot + 1}`);
        } else {
          const image = await loadImage();
          setImage(image);
          if (image.status === "error") {
            setStatus(row, pot, "failed");
          }
          if (stopRef.current === "paused") {
            setStatusBarText("paused");
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
            saveConfig(
              benchBotConfig,
              {
                ...benchBotData,
                location,
                map,
                direction,
              },
              // set startedMotorHold to true
              true
            );
            break;
          }
          // visit pot
          if (benchBotData.map[row][pot].status !== "failed") {
            setStatus(row, pot, "visited");
          }
          appendLog(`visited pot at row ${row + 1} pot ${pot + 1}`);
        }
        if (benchBotData.map[row][pot].status !== "failed") {
          setStatus(row, pot, "visited");
          if (map[row][pot].removed) setStatus(row, pot, "skipped");
        }

        if (
          !(
            (pot === 0 && direction === -1) ||
            (pot === potsPerRow - 1 && direction === 1)
          )
        ) {
          appendLog(`move X: ${direction * potSpacing}`);
          await sleep(1000);
          await moveXandZ(direction * potSpacing, 0);
          await sleep(potSpacing * 100);
          appendLog(`move completed.`);
        }
      }
      // break outside loop if stop triggered
      if (stopRef.current === "paused") break;
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
    if (stopRef.current !== "paused") {
      stopRef.current = "stopped";
      setStatusBarText("stopped");
      await motorHold("end");
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
      saveConfig(
        {
          ...benchBotConfig,
          potsPerRow,
          numberOfRows,
          rowSpacing,
          potSpacing,
        },
        { ...benchBotData, location, map, direction },
        // set startedMotorHold to true
        true
      );
    }
  };

  // TODO: call api for turning
  const handleTurn = async (direction: "left" | "right") => {
    if (direction === "left") {
      appendLog("nudge left");
      await nudge("left");
    }
    if (direction === "right") {
      appendLog("nudge right");
      await nudge("right");
    }
  };

  // stop traversal when leave the page
  useEffect(
    () => () => {
      if (stopRef.current === "running") {
        setStatusBarText("paused");
        stopRef.current = "paused";
        setOpen(true);
        setSnackBarContent("Traversal paused.");
      }
    },
    []
  );

  return (
    <div>
      <Row>
        <Button
          name={"Start"}
          onClick={startTraversal}
          styles={{ width: "150px", color: "#61dac3", marginLeft: "25px" }}
        />
        <Button
          name={"Pause"}
          onClick={() => {
            appendLog("Paused BenchBot traversal.");
            stopRef.current = "paused";
          }}
          styles={{ width: "150px", color: "#f65a5b", marginLeft: "25px" }}
        />
        <Button
          name={"Stop"}
          onClick={() => {}}
          styles={{ width: "150px", color: "#f65a5b", marginLeft: "25px" }}
        />
        <Button
          name={"👈left"}
          onClick={() => handleTurn("left")}
          // disabled={stopRef.current}
          styles={{ width: "150px", marginLeft: "25px" }}
        />
        <Button
          name={"right👉"}
          onClick={() => handleTurn("right")}
          // disabled={stopRef.current}
          styles={{ width: "150px", marginLeft: "25px" }}
        />
      </Row>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div>
          <Log logs={logs} clearLog={() => setLogs([])} />
          <ImagePreview
            status={Image.status}
            imagePreview={Image.image}
            imageErrMsg={Image.errorMsg}
            retry={() => {}}
            showRetry={false}
          />
        </div>
        <PotMap speciesMap={benchBotData.map} species={defaultSpecies} />
      </div>
    </div>
  );
}