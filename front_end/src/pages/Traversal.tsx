import { useEffect, useState } from "react";
import Row from "../components/Row";
import Button from "../components/Button";
import PotMap from "../components/PotMap";
import { BenchBotConfig, PotData } from "../interfaces/BenchBotTypes";
import { defaultBenchBotConfig } from "../utils/constants";
import { loadBenchBotConfig, loadSpeciesMap } from "../utils/configs";

export default function Traversal() {
  const [benchBotConfig, setBenchBotConfig] = useState<BenchBotConfig>(
    defaultBenchBotConfig
  );
  const [speciesMap, setSpeciesMap] = useState<PotData[][]>([]);

  useEffect(() => {
    const res = loadBenchBotConfig();
    if (!res) return;
    setBenchBotConfig(res);
    const map = loadSpeciesMap();
    if (!map) return;
    setSpeciesMap(map);
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "400px" }}>
        <h5 style={{ textAlign: "center", margin: "1rem" }}>Species Config</h5>
        <Row>
          <span style={{ width: "300px" }}>Pots Per Row: </span>
          <input
            value={benchBotConfig.potsPerRow}
            disabled
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
        </Row>

        <Row>
          <span style={{ width: "300px" }}>Total Rows: </span>
          <input
            value={speciesMap.length}
            disabled
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
        </Row>

        <Row>
          <span style={{ width: "300px" }}>Row Spacing: </span>
          <input
            value={benchBotConfig.rowSpacing}
            disabled
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
        </Row>

        <Row>
          <span style={{ width: "300px" }}>Pot Spacing: </span>
          <input
            value={benchBotConfig.potSpacing}
            disabled
            style={{ fontSize: "2rem", flex: 1, width: "150px" }}
          />
        </Row>

        <Row>
          <Button
            name={"Start"}
            onClick={() => {}}
            styles={{ width: "400px" }}
          />
        </Row>
        <Row>
          <Button
            name={"Pause"}
            onClick={() => {}}
            styles={{ width: "400px" }}
          />
        </Row>
      </div>
      <div>
        <PotMap speciesMap={speciesMap} />
      </div>
    </div>
  );
}
