import { useEffect, useState } from "react";
import Row from "../components/Row";
import { loadBenchBotConfig, saveSpeciesMap } from "../utils/configs";
import {
  ControlButtonsMinus,
  ControlButtonsPlus,
} from "../components/ControlButtons";
import {
  PotData,
  SpeciesConfig,
  defaultSpeciesConfig,
  defaultPotData,
} from "../interfaces/BenchBotTypes";
import Button from "../components/Button";
import PotMap from "../components/PotMap";

const defaultSpecies = ["Barley", "Buckwheat", "Cereal Rye"];

export default function SpeciesMap() {
  const [potsPerRow, setPotsPerRow] = useState(0);
  const [speciesConfig, setSpeciesConfig] = useState<SpeciesConfig>({
    ...defaultSpeciesConfig,
    species: defaultSpecies[0],
  });
  const [speciesMap, setSpeciesMap] = useState<PotData[][]>([]);

  const setSpeciesConfigByParam = (param: string, value: number | string) => {
    setSpeciesConfig({ ...speciesConfig, [param]: value });
  };

  const addSpecies = () => {
    const { species, numberOfRows } = speciesConfig;
    const Pot = { ...defaultPotData, species };
    const speciesArray = new Array(numberOfRows).fill(
      new Array(potsPerRow).fill(Pot)
    );
    setSpeciesMap([...speciesMap, ...speciesArray]);
  };

  console.log("speciesMap", speciesMap);

  const resetSpecies = () => {
    setSpeciesMap([]);
  };

  // load benchbot config from localstorage
  useEffect(() => {
    const res = loadBenchBotConfig();
    if (!res) return;
    const { potsPerRow, numberOfRows, rowSpacing, potSpacing } = res;
    setPotsPerRow(potsPerRow);
    console.log("loaded: ", potsPerRow, numberOfRows, rowSpacing, potSpacing);
  }, []);

  const ValInput = ({
    name,
    configName,
    value,
    setValue,
    unit,
  }: {
    name: string;
    configName: string;
    value: number;
    setValue: (param: string, value: number | string) => void;
    unit?: string;
  }) => {
    return (
      <>
        <span style={{ width: "250px" }}>{name}</span>
        <ControlButtonsMinus
          setValue={(num) => setValue(configName, value + num)}
        />
        <div>
          <input
            type="number"
            value={value}
            onChange={(e) =>
              setValue(
                configName,
                e.target.value === "" ? 0 : parseInt(e.target.value)
              )
            }
            size={2}
            style={{ fontSize: "2rem", flex: 1, width: "50px" }}
          />
          {unit}
        </div>
        <ControlButtonsPlus
          setValue={(num) => setValue(configName, value + num)}
        />
      </>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "400px" }}>
        <h5 style={{ textAlign: "center", margin: "1rem" }}>Species Config</h5>
        <Row>
          <span style={{ width: "300px" }}>Pots Per Row: </span>
          <input
            value={potsPerRow}
            disabled
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
        </Row>

        <Row styles={{ gap: "0.2rem" }}>
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

        <Row>
          <Button name={"Add"} onClick={addSpecies} />
          <Button name={"Reset"} onClick={resetSpecies} />
        </Row>
        <Button
          name={"Save"}
          onClick={() => saveSpeciesMap(speciesMap)}
          styles={{ width: "400px" }}
        />
      </div>
      <div>
        <PotMap speciesMap={speciesMap} />
      </div>
    </div>
  );
}
