import { ChangeEvent, useEffect, useState } from "react";
import Row from "./Row";
import Button from "./Button";
import {
  initBenchBotMap,
  loadBenchBotConfig,
  saveBenchBotConfig,
} from "../utils/calculation";
import ControlButtons from "./ControlButtons";
import Log from "./Log";
import { moveXandZ, moveY } from "../utils/api";

const defaultSpecies = ["Barley", "Buckwheat", "Cereal Rye"];

interface ValInputProps {
  name: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ValInput = ({ name, value, onChange }: ValInputProps) => {
  return (
    <>
      <span style={{ width: "400px" }}>{name}</span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        style={{ fontSize: "2rem", flex: 1 }}
      />
    </>
  );
};

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

export default function BenchbotConfig() {
  const [benchBotConfig, setBenchBotConfig] = useState<BenchBotConfig>(
    defaultBenchBotConfig
  );
  const [logs, setLogs] = useState([""]);
  const [stop, setStop] = useState(false);

  const setBenchBotConfigByParam = (param: string, value: number | string) => {
    setBenchBotConfig({ ...benchBotConfig, [param]: value });
  };

  const appendLog = (log: string) => {
    const currentTime = new Date().toLocaleString();
    setLogs((prev) => [currentTime + ": " + log, ...prev]);
  };

  const sleep = (delay: number) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  const traverseBenchBot = async (
    config: BenchBotConfig,
    data: BenchBotData
  ) => {
    let { location, map, direction } = data;
    let [row, pot] = location;
    let { potsPerRow, numberOfRows, rowSpacing, potSpacing } = config;
    for (; row < numberOfRows; row += 1) {
      for (; pot >= 0 && pot < potsPerRow; pot += 1 * direction) {
        map[row][pot] = 1;
        if (
          !(
            (pot === 0 && direction === -1) ||
            (pot === potsPerRow - 1 && direction === 1)
          )
        ) {
          // move benchbot by rowSpacing (not move when at two edge of a row)
          await sleep(1000);
          console.log(`visit pot at row ${row} pot ${pot}`);
          appendLog(
            `move X: ${direction * potSpacing}, visit pot at row ${row} pot ${pot}`
          );
          moveXandZ(direction * potSpacing, 0);
        }
        // test if stop button has triggered
        let a = false;
        setStop((prev) => {
          a = prev;
          return prev;
        });
        if (a) {
          // if hit stop button, save current info and break loop
          let location = [row, pot];
          saveBenchBotConfig(
            { potsPerRow, numberOfRows, rowSpacing, potSpacing },
            { location, map, direction }
          );
          break;
        }
      }
      let a = false;
      setStop((prev) => {
        a = prev;
        return prev;
      });
      if (a) {
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
        moveY(rowSpacing / 100);
      }

      // change here for postPerRow
      if (pot === potsPerRow) pot -= 1;
      if (pot === -1) pot += 1;
      direction *= -1;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "1000px" }}>
        <h1 style={{ textAlign: "center" }}>Benchbot Config</h1>
        <Row>
          <ValInput
            name={"Pots per row:"}
            value={benchBotConfig.potsPerRow}
            onChange={(e) =>
              setBenchBotConfigByParam(
                "potsPerRow",
                e.target.value === "" ? 0 : parseInt(e.target.value)
              )
            }
          />
          <ControlButtons
            setValue={(num) => {
              setBenchBotConfigByParam(
                "potsPerRow",
                benchBotConfig.potsPerRow + num
              );
            }}
          />
        </Row>
        <Row>
          <ValInput
            name={"Number of rows: "}
            value={benchBotConfig.numberOfRows}
            onChange={(e) =>
              setBenchBotConfigByParam(
                "numberOfRows",
                e.target.value === "" ? 0 : parseInt(e.target.value)
              )
            }
          />
          <ControlButtons
            setValue={(num) => {
              setBenchBotConfigByParam(
                "numberOfRows",
                benchBotConfig.numberOfRows + num
              );
            }}
          />
        </Row>
        <Row>
          <ValInput
            name={"Row spacing: "}
            value={benchBotConfig.rowSpacing}
            onChange={(e) =>
              setBenchBotConfigByParam(
                "rowSpacing",
                e.target.value === "" ? 0 : parseInt(e.target.value)
              )
            }
          />
          cm
          <ControlButtons
            setValue={(num) => {
              setBenchBotConfigByParam(
                "rowSpacing",
                benchBotConfig.rowSpacing + num
              );
            }}
          />
        </Row>
        <Row>
          <ValInput
            name={"Pot spacing: "}
            value={benchBotConfig.potSpacing}
            onChange={(e) =>
              setBenchBotConfigByParam(
                "potSpacing",
                e.target.value === "" ? 0 : parseInt(e.target.value)
              )
            }
          />
          cm
          <ControlButtons
            setValue={(num) => {
              setBenchBotConfigByParam(
                "potSpacing",
                benchBotConfig.potSpacing + num
              );
            }}
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
        <Row>
          <Button name="Save" onClick={() => initBenchBotMap(benchBotConfig)} />
          <Button name="Load" onClick={() => loadBenchBotConfig()} />
          <Button
            name="Start"
            onClick={() => {
              setStop(false);
              const res = loadBenchBotConfig();
              const {
                potsPerRow,
                numberOfRows,
                rowSpacing,
                potSpacing,
                location,
                map,
                direction,
              } = res!;
              console.log("start stop", stop);
              traverseBenchBot(
                { potsPerRow, numberOfRows, rowSpacing, potSpacing },
                { location, map, direction }
              );
            }}
            styles={{ color: "#f65a5b" }}
          />
          <Button
            name="Stop"
            onClick={() => {
              // console.log("clicked");
              setStop(true);
              console.log("stop", stop);
            }}
            styles={{ color: "#61dac3" }}
          />
        </Row>
      </div>
      <Log logs={logs} clearLog={() => setLogs([""])} />
    </div>
  );
}
