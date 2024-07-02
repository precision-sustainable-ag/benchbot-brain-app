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
  const [stopTriggered, setStopTriggered] = useState(false);

  const stopRef = useRef<traversalStatus>("stopped");

  const appendLog = (log: string) => {
    const currentTime = new Date().toLocaleString();
    setLogs((prev) => [...prev, currentTime + ": " + log]);
  };

  const loadImage = async (): Promise<Image> => {
    let imageTakenNum = 0;
    appendLog("Taking image.");
    setImage((prev) => ({ ...prev, status: "pending" }));
    const imageData = await takeImage();
    if (!imageData.error && imageData.data) {
      appendLog("Loading image success.");
      console.log("image taken", 2);
      return {
        ...Image,
        status: "success",
        image: imageData.data,
        imageTaken: 2,
      };
    } else {
      appendLog("Failed loading image, retrying...");
      console.log("imageData", imageData);
      if (imageData.imageTaken) {
        console.log("imageTaken", imageData.imageTaken);
        imageTakenNum += imageData.imageTaken;
      }
      // retake image here
      const retakeImageData = await takeImage();
      if (!retakeImageData.error && retakeImageData.data) {
        appendLog("Loading image success.");
        console.log("image taken", 2);
        imageTakenNum += 2;
        return {
          ...Image,
          status: "success",
          image: retakeImageData.data,
          imageTaken: imageTakenNum,
        };
      } else {
        appendLog("Failed loading image. Skipped");
        if (imageData.imageTaken) {
          console.log("image taken", imageData.imageTaken);
          imageTakenNum += imageData.imageTaken;
        }
        return {
          ...Image,
          status: "error",
          errorMsg: retakeImageData.message,
          imageTaken: imageTakenNum,
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
    setOpen(true);
  };

  const pauseTraversal = () => {
    appendLog("Pausing BenchBot traversal.");
    stopRef.current = "paused";
  };

  // save current map to file
  const stopTraversal = async () => {
    if (stopRef.current === "stopped") {
      setStopTriggered(false);
      console.log("reset");
      const { location, map, direction } = resetBenchBotData(benchBotData.map);
      saveConfig(benchBotConfig, { ...benchBotData, location, map, direction });
      setBenchBotData({ ...benchBotData, location, map, direction });
      return;
    }
    setStopTriggered(true);
    appendLog("Stopping BenchBot traversal.");
    if (stopRef.current === "paused") {
      setStatusBarText("stopped");
      appendLog("Traversal stopped.");
    }
    stopRef.current = "stopped";
    await motorHold("end");
    const { location, map, direction } = resetBenchBotData(benchBotData.map);
    saveConfig(benchBotConfig, { ...benchBotData, location, map, direction });
  };

  const calculateImages = () => {
    const { map } = benchBotData;
    const { potsPerRow, numberOfRows } = benchBotConfig;
    let availablePots = 0;
    for (let i = 0; i < numberOfRows; i++) {
      for (let j = 0; j < potsPerRow; j++) {
        if (map[i][j].species !== "none") availablePots += 1;
      }
    }
    console.log("availablePots", availablePots);
    return 2 * availablePots;
  };

  const traverseBenchBot = async (
    config: BenchBotConfig,
    data: BenchBotData
  ) => {
    const totalImages = calculateImages();
    let imageTaken = 0;
    // mock sleep function
    const sleep = (delay: number) =>
      new Promise((resolve) => setTimeout(resolve, delay));
    let { location, map, direction } = data;
    let [row, pot] = location;
    let { potsPerRow, numberOfRows, rowSpacing, potSpacing } = config;

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
          imageTaken += image.imageTaken;
          setSnackBarContent(`Image taken: ${imageTaken} / ${totalImages}`);
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
        // TODO: comment snackbar message for now
        // setOpen(true);
        // setSnackBarContent("Traversal paused.");
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
          disabled={stopTriggered === true}
          styles={{
            width: "150px",
            color: stopTriggered ? "#61dac46a" : "#61dac3",
            marginLeft: "25px",
          }}
        />
        <Button
          name={"Pause"}
          onClick={pauseTraversal}
          disabled={stopRef.current === "paused"}
          styles={{
            width: "150px",
            color: stopRef.current === "paused" ? "#f65a5a79" : "#f65a5b",
            marginLeft: "25px",
          }}
        />
        <Button
          name={stopRef.current === "stopped" ? "Reset" : "Stop"}
          onClick={stopTraversal}
          styles={{ width: "150px", color: "#f65a5b", marginLeft: "25px" }}
        />
        <Button
          name={"👈left"}
          onClick={() => handleTurn("left")}
          disabled={stopRef.current === "stopped"}
          styles={{ width: "150px", marginLeft: "25px" }}
        />
        <Button
          name={"right👉"}
          onClick={() => handleTurn("right")}
          disabled={stopRef.current === "stopped"}
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
