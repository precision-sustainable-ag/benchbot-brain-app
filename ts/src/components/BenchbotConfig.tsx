import { ChangeEvent, useEffect, useState, useRef } from "react";
import Row from "./Row";
import Button from "./Button";
import {
  initBenchBotMap,
  loadBenchBotConfig,
  saveBenchBotConfig,
} from "../utils/calculation";
import { ControlButtonsMinus, ControlButtonsPlus } from "./ControlButtons";
import Log from "./Log";
import { moveXandZ, moveY, takeImage } from "../utils/api";

const defaultSpecies = ["Barley", "Buckwheat", "Cereal Rye"];

export interface BenchBotConfig {
  potsPerRow: number;
  numberOfRows: number;
  rowSpacing: number;
  potSpacing: number;
  species?: string;
}

export interface BenchBotData {
  location: number[];
  map: number[][];
  direction: number;
}

const defaultBenchBotConfig = {
  potsPerRow: 0,
  numberOfRows: 0,
  rowSpacing: 0,
  potSpacing: 0,
  species: "",
};

// TODO:
// use map to test if visited
// test logic for traversal
// add a grid for the map on the right

export default function BenchbotConfig() {
  const [benchBotConfig, setBenchBotConfig] = useState<BenchBotConfig>(
    defaultBenchBotConfig
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [stop, setStop] = useState(false);

  const stopRef = useRef(stop);

  const setBenchBotConfigByParam = (param: string, value: number | string) => {
    setBenchBotConfig({ ...benchBotConfig, [param]: value });
  };

  const appendLog = (log: string) => {
    const currentTime = new Date().toLocaleString();
    setLogs((prev) => [...prev, currentTime + ": " + log]);
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
        // visit pot, take image
        map[row][pot] = 1;
        console.log(`visit pot at row ${row} pot ${pot}`);
        await takeImage();
        if (
          !(
            (pot === 0 && direction === -1) ||
            (pot === potsPerRow - 1 && direction === 1)
          )
        ) {
          // move benchbot by rowSpacing (not move when at two edge of a row)
          await sleep(1000);
          appendLog(`move X: ${direction * potSpacing}`);
          moveXandZ(direction * potSpacing, 0);
        }

        // test if stop button has triggered
        if (stopRef.current) {
          // if stop, save current info and break loop
          let location = [row, pot];
          saveBenchBotConfig(
            { potsPerRow, numberOfRows, rowSpacing, potSpacing },
            { location, map, direction }
          );
          break;
        }
      }

      if (stopRef.current) {
        let location = [row, pot];
        saveBenchBotConfig(
          { potsPerRow, numberOfRows, rowSpacing, potSpacing },
          { location, map, direction }
        );
        break;
      }

      // move benchbot by potSpacing
      await sleep(1000);
      if (row !== numberOfRows - 1) {
        appendLog(`move Y: ${rowSpacing / 100}`);
        moveY(rowSpacing);
      }

      // change here for postPerRow
      if (pot === potsPerRow) pot -= 1;
      if (pot === -1) pot += 1;
      direction *= -1;
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
  }, []);

  // update stopRef
  useEffect(() => {
    stopRef.current = stop;
    // console.log("stopRef.current", stopRef.current);
  }, [stop]);

  const ValInput = ({
    name,
    value,
    setValue,
    unit,
  }: {
    name: string;
    value: number;
    setValue: (param: string, value: number | string) => void;
    unit?: string;
  }) => {
    return (
      <>
        <span style={{ width: "300px" }}>{name}</span>
        <ControlButtonsMinus setValue={(num) => setValue(name, value + num)} />
        <div>
          <input
            type="number"
            value={value}
            onChange={(e) =>
              setValue(
                name,
                e.target.value === "" ? 0 : parseInt(e.target.value)
              )
            }
            size={2}
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
          {unit}
        </div>
        <ControlButtonsPlus setValue={(num) => setValue(name, value + num)} />
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
            value={benchBotConfig.potsPerRow}
            setValue={setBenchBotConfigByParam}
          />
        </Row>
        <Row>
          <ValInput
            name={"Number of rows: "}
            value={benchBotConfig.numberOfRows}
            setValue={setBenchBotConfigByParam}
          />
        </Row>
        <Row>
          <ValInput
            name={"Row spacing: "}
            value={benchBotConfig.rowSpacing}
            setValue={setBenchBotConfigByParam}
            unit="cm"
          />
        </Row>
        <Row>
          <ValInput
            name={"Pot spacing: "}
            value={benchBotConfig.potSpacing}
            setValue={setBenchBotConfigByParam}
            unit="cm"
          />
        </Row>
        <Row>
          <span style={{ width: "400px" }}>Species: </span>
          <select
            value={benchBotConfig.species}
            onChange={(e) =>
              setBenchBotConfigByParam("species", e.target.value)
            }
            style={{ fontSize: "2rem", flex: 1 }}
          >
            <option value=""></option>
            {defaultSpecies.map((species, i) => (
              <option value={species} key={i}>
                {species}
              </option>
            ))}
          </select>
        </Row>
        <Row styles={{ justifyContent: "space-around" }}>
          <Button name="Save" onClick={() => initBenchBotMap(benchBotConfig)} />
          <Button
            name="Start"
            onClick={() => {
              setStop(false);
              const res = loadBenchBotConfig();
              if (!res) {
                // const { location, map, direction } =
                //   initBenchBotMap(benchBotConfig);
                // traverseBenchBot(benchBotConfig, { location, map, direction });
              } else {
                appendLog("Loaded config from history");
                const {
                  potsPerRow,
                  numberOfRows,
                  rowSpacing,
                  potSpacing,
                  location,
                  map,
                  direction,
                } = res;
                appendLog("Started BenchBot traversal.");
                traverseBenchBot(
                  { potsPerRow, numberOfRows, rowSpacing, potSpacing },
                  { location, map, direction }
                );
              }
            }}
            styles={{ color: "#61dac3" }}
          />
          <Button
            name="Pause"
            onClick={() => {
              appendLog("Paused BenchBot traversal.");
              setStop(true);
            }}
            styles={{ color: "#f65a5b" }}
          />
        </Row>
      </div>
      <div>
        <Log logs={logs} clearLog={() => setLogs([])} />
      </div>
    </div>
  );
}
