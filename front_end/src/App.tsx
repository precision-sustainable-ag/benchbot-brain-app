import { useState, useEffect } from "react";
import { BrowserRouter, Route, Link, Routes } from "react-router-dom";
import ManualControl from "./pages/ManualControl";
import CameraConfig from "./pages/CameraConfig";
import SpeciesMap from "./pages/SpeciesMap";
import Traversal from "./pages/Traversal";
import SnackBar from "./components/SnackBar";
import StatusBar from "./components/StatusBar";

import {
  BenchBotConfig,
  BenchBotData,
  traversalStatus,
} from "./interfaces/BenchBotTypes";
import { defaultBenchBotConfig, defaultBenchBotData } from "./utils/constants";
import { loadConfig } from "./utils/api";

const LinkStyle = { color: "inherit", textDecoration: "none" };

function App() {
  const [open, setOpen] = useState(false);
  const [snackBarContent, setSnackBarContent] = useState("");
  const [statusText, setStatusText] = useState<traversalStatus>("stopped");

  const [benchBotConfig, setBenchBotConfig] = useState<BenchBotConfig>(
    defaultBenchBotConfig
  );
  const [benchBotData, setBenchBotData] =
    useState<BenchBotData>(defaultBenchBotData);
  const [startedMotorHold, setStartedMotorHold] = useState(false);

  // load config from local file
  useEffect(() => {
    const fetchData = async () => {
      const res = await loadConfig();
      if (!res) return;
      const {
        potsPerRow,
        numberOfRows,
        rowSpacing,
        potSpacing,
        location,
        map,
        direction,
      } = res;
      setBenchBotConfig({
        ...benchBotConfig,
        potsPerRow,
        numberOfRows,
        rowSpacing,
        potSpacing,
      });
      setBenchBotData({ ...benchBotData, location, map, direction });
    };
    fetchData();
  }, []);

  return (
    <BrowserRouter>
      <div
        style={{
          width: "1200px",
          height: "800px",
          fontFamily: "Arial, sans-serif",
          fontSize: "32px",
        }}
      >
        <nav style={{ textAlign: "left" }}>
          <button style={{ fontSize: "2rem" }}>
            <Link to="/" style={LinkStyle}>
              Manual Control
            </Link>
          </button>
          <button style={{ fontSize: "2rem" }}>
            <Link to="/camera-config" style={LinkStyle}>
              Camera config
            </Link>
          </button>
          <button style={{ fontSize: "2rem" }}>
            <Link to="/species-map" style={LinkStyle}>
              Species Map
            </Link>
          </button>
          <button style={{ fontSize: "2rem" }}>
            <Link to="/traversal" style={LinkStyle}>
              Traversal
            </Link>
          </button>
        </nav>

        <Routes>
          <Route path="/" element={<ManualControl />} />
          <Route path="/camera-config" element={<CameraConfig />} />
          <Route
            path="/species-map"
            element={
              <SpeciesMap
                benchBotConfig={benchBotConfig}
                setBenchBotConfig={setBenchBotConfig}
                benchBotData={benchBotData}
                setBenchBotData={setBenchBotData}
                setStartedMotorHold={setStartedMotorHold}
              />
            }
          />
          <Route
            path="/traversal"
            element={
              <Traversal
                setOpen={setOpen}
                setSnackBarContent={setSnackBarContent}
                setStatusBarText={setStatusText}
                benchBotConfig={benchBotConfig}
                benchBotData={benchBotData}
                setBenchBotData={setBenchBotData}
                startedMotorHold={startedMotorHold}
                setStartedMotorHold={setStartedMotorHold}
              />
            }
          />
        </Routes>
        <SnackBar
          open={open}
          setOpen={setOpen}
          text={snackBarContent}
          setText={setSnackBarContent}
        />
        <StatusBar status={statusText} />
      </div>
    </BrowserRouter>
  );
}

export default App;
