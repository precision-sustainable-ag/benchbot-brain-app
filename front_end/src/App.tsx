import { useState } from "react";
import { BrowserRouter, Route, Link, Routes } from "react-router-dom";
import ManualControl from "./pages/ManualControl";
import CameraConfig from "./pages/CameraConfig";
import SpeciesMap from "./pages/SpeciesMap";
import Traversal from "./pages/Traversal";
import SnackBar from "./components/SnackBar";
import StatusBar from "./components/StatusBar";

const LinkStyle = { color: "inherit", textDecoration: "none" };

function App() {
  const [open, setOpen] = useState(false);
  const [snackBarContent, setSnackBarContent] = useState("");
  const [statusText, setStatusText] = useState("");

  return (
    <BrowserRouter>
      <div style={{ width: "1200px", height: "800px", fontSize: "36px" }}>
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
          <Route path="/species-map" element={<SpeciesMap />} />
          <Route
            path="/traversal"
            element={
              <Traversal
                setOpen={setOpen}
                setSnackBarContent={setSnackBarContent}
                setStatusText={setStatusText}
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
