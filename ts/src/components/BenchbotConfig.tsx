import { useState } from "react";
import Row from "./Row";
import Button from "./Button";

const defaultSpecies = ["Barley", "Buckwheat", "Cereal Rye"];

export default function BenchbotConfig() {
  const [potsPerRow, setPotsPerRow] = useState(0);
  const [numberOfRows, setNumberOfRows] = useState(0);
  const [species, setSpecies] = useState("");

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Benchbot Config</h1>
      <Row>
        <span style={{ flex: 1 }}>Pots per row: </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={potsPerRow}
          onChange={(e) => setPotsPerRow(parseInt(e.target.value))}
          style={{ fontSize: "2rem", flex: 1 }}
        />
      </Row>
      <Row>
        <span style={{ flex: 1 }}>Number of rows: </span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={numberOfRows}
          onChange={(e) => setNumberOfRows(parseInt(e.target.value))}
          style={{ fontSize: "2rem", flex: 1 }}
        />
      </Row>
      <Row>
        <span style={{ flex: 1 }}>Number of rows: </span>
        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
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
        <Button name="Save" onClick={() => {}} />
      </Row>
    </div>
  );
}
