import { PotData } from "../interfaces/BenchBotTypes";

interface PotMapProps {
  speciesMap: PotData[][];
  setSpeciesMap?: (speciesMap: PotData[][]) => void;
  species: string[];
}

interface PotProps {
  speciesMap: PotData[][];
  setSpeciesMap?: (speciesMap: PotData[][]) => void;
  row: number;
  col: number;
  species: string[];
}

const Pot = ({ speciesMap, setSpeciesMap, row, col, species }: PotProps) => {
  const potData = speciesMap[row][col];
  const bgColor = () => {
    switch (potData.status) {
      case "visited":
        return "silver";
      case "visiting":
        return "yellowgreen";
      case "nextVisit":
        return "lightyellow";
      default:
        return "";
    }
  };
  return (
    <div
      style={{
        fontSize: "0.75rem",
        width: "100px",
        height: "50px",
        border: "1px solid black",
        textAlign: "center",
        backgroundColor: bgColor(),
      }}
    >
      <select
        value={speciesMap[row][col].species}
        onChange={(e) => {
          if (setSpeciesMap !== undefined) {
            let currMap = speciesMap;
            currMap[row][col] = {
              ...currMap[row][col],
              species: e.target.value,
              removed: e.target.value === "",
            };
            setSpeciesMap([...currMap]);
          }
        }}
        disabled={setSpeciesMap === undefined}
        style={{ fontSize: "1.25rem", width: "90px" }}
      >
        <option value={""}></option>
        {species.map((s, i) => (
          <option value={s} key={i}>
            {s}
          </option>
        ))}
      </select>
      <p style={{ fontSize: "1.25rem", margin: "0" }}>
        {potData.visited ? "visited" : ""}
      </p>
    </div>
  );
};

export default function PotMap({
  speciesMap,
  setSpeciesMap,
  species,
}: PotMapProps) {
  const totalRows = speciesMap.length;
  const totalCols = speciesMap[0] === undefined ? 0 : speciesMap[0].length;
  return (
    <div
      style={{
        border: "1px solid black",
        padding: "10px",
        margin: "20px 20px",
      }}
    >
      {speciesMap.length === 0 ? (
        "No data available"
      ) : (
        <>
          {speciesMap.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{ display: "flex", gap: "10px", paddingBottom: "10px" }}
            >
              {row.map((_, colIndex) => {
                return (
                  <Pot
                    key={`${rowIndex},${colIndex}`}
                    speciesMap={speciesMap}
                    setSpeciesMap={setSpeciesMap}
                    species={species}
                    row={totalRows - 1 - rowIndex}
                    col={totalCols - 1 - colIndex}
                  />
                );
              })}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
