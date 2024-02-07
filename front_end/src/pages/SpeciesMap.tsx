import { useEffect, useState } from "react";
import Row from "../components/Row";
import { loadBenchBotConfig } from "../utils/configs";
import {
  ControlButtonsMinus,
  ControlButtonsPlus,
} from "../components/ControlButtons";
import { SpeciesConfig } from "../interfaces/BenchBotTypes";
import Button from "../components/Button";

const defaultSpecies = ["Barley", "Buckwheat", "Cereal Rye"];

const defaultSpeciesConfig: SpeciesConfig = {
  numberOfRows: 0,
  species: "",
};

export default function SpeciesMap() {
  const [speciesConfig, setSpeciesConfig] =
    useState<SpeciesConfig>(defaultSpeciesConfig);
  const [potsPerRow, setPotsPerRow] = useState(0);

  const setSpeciesConfigByParam = (param: string, value: number | string) => {
    setSpeciesConfig({ ...speciesConfig, [param]: value });
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
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
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
            <option value=""></option>
            {defaultSpecies.map((species, i) => (
              <option value={species} key={i}>
                {species}
              </option>
            ))}
          </select>
        </Row>

        <Row>
          <Button name={"Add"} onClick={() => {}} />
          <Button name={"Reset"} onClick={() => {}} />
        </Row>
      </div>
    </div>
  );
}
