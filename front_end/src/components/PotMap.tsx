import { PotData } from "../interfaces/BenchBotTypes";

interface PotMapProps {
  speciesMap: PotData[][];
}

interface PotProps {
  data: PotData;
}

const Pot = ({ data }: PotProps) => {
  return (
    <div
      style={{
        fontSize: "0.75rem",
        width: "100px",
        height: "100px",
        border: "1px solid black",
      }}
    >
      <p>{data.species}</p>
      <p>{data.removed ? "removed" : ""}</p>
      <p>{data.visited ? "visited" : ""}</p>
    </div>
  );
};

export default function PotMap({ speciesMap }: PotMapProps) {
  return (
    <div
      style={{
        border: "1px solid black",
        padding: "10px",
        margin: "50px 50px",
      }}
    >
      {speciesMap.length === 0 ? (
        "No data available"
      ) : (
        <>
          {speciesMap.map((row, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: "10px", paddingBottom: "10px" }}
            >
              {row.map((pot, index) => {
                return <Pot key={index} data={pot} />;
              })}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
