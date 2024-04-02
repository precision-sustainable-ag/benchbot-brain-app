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
  // config for map properties
  const [benchBotConfig, setBenchBotConfig] = useState<BenchBotConfig>(
    defaultBenchBotConfig
  );
  // config for current species
  const [speciesConfig, setSpeciesConfig] = useState<SpeciesConfig>({
    ...defaultSpeciesConfig,
    species: defaultSpecies[0],
  });
  const [speciesMap, setSpeciesMap] = useState<PotData[][]>([]);
  const [helperText, setHelperText] = useState("");
  const [operations, setOperations] = useState<number[]>([]);

  // function for updating configs
  const setSpeciesConfigByParam = (param: string, value: number | string) => {
    setSpeciesConfig({ ...speciesConfig, [param]: value });
  };
  const setBenchBotConfigByParam = (param: string, value: number | string) => {
    setBenchBotConfig({ ...benchBotConfig, [param]: value });
  };

  // function to add rows for one species
  const addSpecies = () => {
    const { species, numberOfRows } = speciesConfig;
    const Pot = { ...defaultPotData, species };
    const { potsPerRow } = benchBotConfig;
    const speciesArray = new Array(numberOfRows);
    for (let i = 0; i < numberOfRows; i++) {
      speciesArray[i] = new Array(potsPerRow).fill(Pot);
    }
    setSpeciesMap([...speciesMap, ...speciesArray]);
    // add operation
    setOperations([...operations, numberOfRows]);
    setHelperText(`Added ${numberOfRows} rows of ${species}.`);
  };

  // function to undo last operation
  const undo = () => {
    const removeRowNumber = operations.pop();
    if (removeRowNumber === undefined) return;
    // remove last operation from map
    setSpeciesMap([...speciesMap.slice(0, -removeRowNumber)]);
    setOperations([...operations]);
    setHelperText("Undo last operation.");
  };

  // reset the map and configs
  const resetSpecies = () => {
    setSpeciesMap([]);
    setBenchBotConfig(defaultBenchBotConfig);
    setSpeciesConfig(defaultSpeciesConfig);
    setHelperText("Reset species map.");
  };

  // FIXME: temporary function to remove all visited stage of the map
  const setMapUnvisited = () => {
    const clearedMap = speciesMap.map((row) =>
      row.map((pot) => ({
        ...pot,
        visited: false,
        status: "unVisited" as "unVisited",
      }))
    );
    return clearedMap;
  };

  // save current map to localstorage
  const saveSpecies = () => {
    const clearedMap = setMapUnvisited();
    setSpeciesMap(clearedMap);
    initBenchBotConfig(benchBotConfig, clearedMap);
    setHelperText("Species map saved!");
  };

  // load benchbot config from localstorage
  useEffect(() => {
    const fetchData = async () => {
      const res = await loadBenchBotConfig();
      const { potsPerRow, rowSpacing, potSpacing, map } = res;
      setBenchBotConfig({
        ...benchBotConfig,
        potsPerRow,
        rowSpacing,
        potSpacing,
      });
      setSpeciesMap(map);
    };
    fetchData();
  }, []);

  // custom component for a single textbox and control buttons around it
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
          setValue={(num) => {
            if (value + num < 0) setValue(configName, 0);
            else setValue(configName, value + num);
          }}
          disabled={disabled}
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
          disabled={disabled}
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
          <span style={{ width: "400px" }}>Species: </span>
          <select
            value={speciesConfig.species}
            onChange={(e) => setSpeciesConfigByParam("species", e.target.value)}
            style={{ fontSize: "2rem", flex: 1 }}
          >
            <option value={"none"}>none</option>
            {defaultSpecies.map((species, i) => (
              <option value={species} key={i}>
                {species}
              </option>
            ))}
          </select>
        </Row>

        <Row>
          <ValInput
            name={"Rows: "}
            configName={"numberOfRows"}
            value={speciesConfig.numberOfRows}
            setValue={setSpeciesConfigByParam}
          />
        </Row>

        <Row styles={{ gap: "1rem" }}>
          <Button name={"Add Species"} onClick={addSpecies} />
          <Button
            name={"Undo"}
            onClick={undo}
            disabled={operations.length === 0}
          />
        </Row>
        <Row styles={{ gap: "1rem" }}>
          <Button name={"Reset"} onClick={resetSpecies} />
          <Button name={"Save"} onClick={saveSpecies} />
        </Row>
        <Row>
          <div>{helperText}</div>
        </Row>
      </div>
      <div>
        <PotMap
          speciesMap={speciesMap}
          setSpeciesMap={setSpeciesMap}
          species={defaultSpecies}
        />
      </div>
    </div>
  );
}
