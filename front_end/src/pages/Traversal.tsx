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
  PotStatus,
  traversalStatus,
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
import { resetBenchBotData } from "../utils/functions";

interface TraversalProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackBarContent: React.Dispatch<React.SetStateAction<string>>;
  setStatusBarText: React.Dispatch<React.SetStateAction<traversalStatus>>;
  benchBotConfig: BenchBotConfig;
  benchBotData: BenchBotData;
  setBenchBotData: React.Dispatch<React.SetStateAction<BenchBotData>>;
}

export default function Traversal({
  setOpen,
  setSnackBarContent,
  setStatusBarText,
  benchBotConfig,
  benchBotData,
  setBenchBotData,
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
    if (stopRef.current === "stopped") {
      await motorHold("start");
    }
    stopRef.current = "running";
    appendLog("Start BenchBot traversal.");
    setStatusBarText("running");
    traverseBenchBot(benchBotConfig, benchBotData);
  };

  const pauseTraversal = () => {
    appendLog("Pausing BenchBot traversal.");
    stopRef.current = "paused";
  };

  // save current map to file
  const stopTraversal = async () => {
    appendLog("Stopping BenchBot traversal.");
    stopRef.current = "stopped";
    await motorHold("end");
    const { location, map, direction } = resetBenchBotData(benchBotData.map);
    saveConfig(benchBotConfig, { ...benchBotData, location, map, direction });
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

  const setStatus = (row: number, col: number, status: PotStatus) => {
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

        // pause/stop traversal
        if (stopRef.current === "paused") {
          setStatusBarText("paused");
          appendLog("Traversal paused.");
          let location = [row, pot];
          setBenchBotData({ ...benchBotData, location, map, direction });
          saveConfig(benchBotConfig, {
            ...benchBotData,
            location,
            map,
            direction,
          });
          break;
        } else if (stopRef.current === "stopped") {
          // stop traversal if hit stop button
          setStatusBarText("stopped");
          appendLog("Traversal stopped.");
          return;
        }

        // visit pot, skip pot or take image
        if (map[row][pot].removed) {
          appendLog(`skipped pot at row ${row + 1} pot ${pot + 1}`);
          setStatus(row, pot, "skipped");
        } else {
          const image = await loadImage();
          setImage(image);
          appendLog(`visited pot at row ${row + 1} pot ${pot + 1}`);
          if (image.status === "error") {
            setStatus(row, pot, "failed");
          } else setStatus(row, pot, "visited");
        }

        // move x
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
      // move y
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
    // finish traversal
    if (stopRef.current !== "paused") {
      appendLog("BenchBot traversal finished.");
      stopRef.current = "stopped";
      setStatusBarText("stopped");
      await motorHold("end");
      let location = [row, pot];
      setBenchBotData({ ...benchBotData, location, map, direction });
      saveConfig(benchBotConfig, { ...benchBotData, location, map, direction });
    }
  };

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
          onClick={pauseTraversal}
          styles={{ width: "150px", color: "#f65a5b", marginLeft: "25px" }}
        />
        <Button
          name={"Stop"}
          onClick={stopTraversal}
          styles={{ width: "150px", color: "#f65a5b", marginLeft: "25px" }}
        />
        <Button
          name={"👈left"}
          onClick={() => handleTurn("left")}
          disabled={
            stopRef.current === "paused" || stopRef.current === "stopped"
          }
          styles={{ width: "150px", marginLeft: "25px" }}
        />
        <Button
          name={"right👉"}
          onClick={() => handleTurn("right")}
          disabled={
            stopRef.current === "paused" || stopRef.current === "stopped"
          }
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
