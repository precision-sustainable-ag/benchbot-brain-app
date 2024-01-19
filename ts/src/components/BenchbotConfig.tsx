import { ChangeEvent, useState } from "react";
import Row from "./Row";
import Button from "./Button";
import {
  initBenchBotMap,
  loadBenchBotConfig,
  saveBenchBotConfig,
} from "../utils/calculation";

const defaultSpecies = ["Barley", "Buckwheat", "Cereal Rye"];

interface NumInputProps {
  name: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ValInput = ({ name, value, onChange }: NumInputProps) => {
  return (
    <>
      <span style={{ width: "400px" }}>{name}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
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

  const [stop, setStop] = useState(false);

  console.log(stop);

  const setBenchBotConfigByParam = (param: string, value: number | string) => {
    setBenchBotConfig({ ...benchBotConfig, [param]: value });
  };

  const sleep = (delay: number) =>
    new Promise((resolve) => setTimeout(resolve, delay));

  const traverseBenchBot = async (
    config: BenchBotConfig,
    data: BenchBotData
  ) => {
    let { location, map, direction } = data;
    let [row, pot] = location;
    const { potsPerRow, numberOfRows, rowSpacing, potSpacing } = config;
    for (; row < numberOfRows; row += 1) {
      if (row !== 0) moveY(rowSpacing / 100);
      // move benchbot by potSpacing(not move on first loop)
      for (; pot >= 0 && pot < potsPerRow; pot += 1 * direction) {
        map[row][pot] = 1;
        console.log(`visit pot at row ${row} pot ${pot}`, stop);
        await sleep(1000);
        // move benchbot by rowSpacing
        moveX(direction * potSpacing);
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

      if (pot === potsPerRow) pot -= 1;
      if (pot === -1) pot += 1;
      direction *= -1;
    }
  };

  const baseUrl = "http://localhost:8042";

  const moveX = async (x: number) => {
    console.log("api call param", x);
    const url = baseUrl + `/clearcore?x=${x}&z=0`;
    const res = await (await fetch(url)).json();
    console.log(res);
  };

  const moveY = async (y: number) => {
    console.log("api call move y", y);
    const url = baseUrl + `/move_yaxis/${y}`;
    const res = await (await fetch(url)).json();
    console.log(res);
  };

  return (
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
      </Row>
      <Row>
        <span style={{ width: "400px" }}>Species: </span>
        <select
          value={benchBotConfig.species}
          onChange={(e) => setBenchBotConfigByParam("species", e.target.value)}
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
  );
}
