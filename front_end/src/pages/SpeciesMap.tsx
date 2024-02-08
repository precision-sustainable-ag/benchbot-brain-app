import { useEffect, useState } from "react";
import Row from "../components/Row";
import { loadBenchBotConfig } from "../utils/configs";
import {
  ControlButtonsMinus,
  ControlButtonsPlus,
} from "../components/ControlButtons";
import {
  SpeciesConfig,
  BenchBotConfig,
  PotData,
} from "../interfaces/BenchBotTypes";
import {
  defaultSpeciesConfig,
  defaultPotData,
  defaultBenchBotConfig,
} from "../utils/constants";
import Button from "../components/Button";
import PotMap from "../components/PotMap";
import { defaultSpecies } from "../utils/constants";
import { initBenchBotConfig } from "../utils/calculation";

export default function SpeciesMap() {
  const [benchBotConfig, setBenchBotConfig] = useState<BenchBotConfig>(
    defaultBenchBotConfig
  );
  const [speciesConfig, setSpeciesConfig] = useState<SpeciesConfig>({
    ...defaultSpeciesConfig,
    species: defaultSpecies[0],
  });
  const [speciesMap, setSpeciesMap] = useState<PotData[][]>([]);

  const setSpeciesConfigByParam = (param: string, value: number | string) => {
    setSpeciesConfig({ ...speciesConfig, [param]: value });
  };
  const setBenchBotConfigByParam = (param: string, value: number | string) => {
    setBenchBotConfig({ ...benchBotConfig, [param]: value });
  };

  const addSpecies = () => {
    const { species, numberOfRows } = speciesConfig;
    const Pot = { ...defaultPotData, species };
    const { potsPerRow } = benchBotConfig;
    const speciesArray = new Array(numberOfRows).fill(
      new Array(potsPerRow).fill(Pot)
    );
    setSpeciesMap([...speciesMap, ...speciesArray]);
  };

  console.log("speciesMap", speciesMap);

  const resetSpecies = () => {
    setSpeciesMap([]);
  };

  const saveSpecies = () => {
    initBenchBotConfig(benchBotConfig, speciesMap);
  };

  // load benchbot config from localstorage
  useEffect(() => {
    const res = loadBenchBotConfig();
    if (!res) return;
    const { potsPerRow, rowSpacing, potSpacing, map } = res;
    setBenchBotConfig({
      ...benchBotConfig,
      potsPerRow,
      rowSpacing,
      potSpacing,
    });
    setSpeciesMap(map);
  }, []);

  const ValInput = ({
    name,
    configName,
    value,
    setValue,
    unit,
    disabled = false,
  }: {
    name: string;
    configName: string;
    value: number;
    setValue: (param: string, value: number | string) => void;
    unit?: string;
    disabled?: boolean;
  }) => {
    return (
      <>
        <span style={{ width: "250px" }}>{name}</span>
        <ControlButtonsMinus
          setValue={(num) => setValue(configName, value + num)}
        />
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <input
            type="number"
            value={value}
            onChange={(e) =>
              setValue(
                configName,
                e.target.value === "" ? 0 : parseInt(e.target.value)
              )
            }
            disabled={disabled}
            size={2}
            style={{ fontSize: "2rem", flex: 1, width: "50px" }}
          />
          <span style={{ fontSize: "1rem" }}>{unit}</span>
        </div>
        <ControlButtonsPlus
          setValue={(num) => setValue(configName, value + num)}
        />
      </>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "500px" }}>
        <h5 style={{ textAlign: "center", margin: "1rem" }}>Species Config</h5>
        <h6 style={{ margin: "0" }}>Map Setting: </h6>
        <Row>
          <ValInput
            name={"Pots per row:"}
            configName={"potsPerRow"}
            value={benchBotConfig.potsPerRow}
            setValue={setBenchBotConfigByParam}
            disabled={speciesMap.length > 0}
          />
        </Row>

        <Row>
          <ValInput
            name={"Row spacing: "}
            configName={"rowSpacing"}
            value={benchBotConfig.rowSpacing}
            setValue={setBenchBotConfigByParam}
            unit="cm"
            disabled={speciesMap.length > 0}
          />
        </Row>

        <Row>
          <ValInput
            name={"Pot spacing: "}
            configName={"potSpacing"}
            value={benchBotConfig.potSpacing}
            setValue={setBenchBotConfigByParam}
            unit="cm"
            disabled={speciesMap.length > 0}
          />
        </Row>

        <h6 style={{ margin: "1rem 0 0 0" }}>Add Species: </h6>

        <Row>
          <ValInput
            name={"Rows: "}
            configName={"numberOfRows"}
            value={speciesConfig.numberOfRows}
            setValue={setSpeciesConfigByParam}
          />
        </Row>

        <Row>
          <span style={{ width: "400px" }}>Species: </span>
          <select
            value={speciesConfig.species}
            onChange={(e) => setSpeciesConfigByParam("species", e.target.value)}
            style={{ fontSize: "2rem", flex: 1 }}
          >
            {defaultSpecies.map((species, i) => (
              <option value={species} key={i}>
                {species}
              </option>
            ))}
          </select>
        </Row>

        <Row styles={{ gap: "1rem" }}>
          <Button name={"Add"} onClick={addSpecies} />
          <Button name={"Reset"} onClick={resetSpecies} />
          <Button name={"Save"} onClick={saveSpecies} />
        </Row>
      </div>
      <div>
        <PotMap speciesMap={speciesMap} />
      </div>
    </div>
  );
}
