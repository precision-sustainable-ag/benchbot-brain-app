import { BrowserRouter, Route, Link, Routes } from "react-router-dom";
import ManualControl from "./ManualControl";
import BenchbotConfig from "./BenchbotConfig";
import CameraConfig from "./CameraConfig";

const LinkStyle = { color: "inherit", textDecoration: "none" };

function App() {
  return (
    <BrowserRouter>
      <div style={{ width: "800px", fontSize: "36px" }}>
        <nav style={{ textAlign: "center" }}>
          <button style={{ fontSize: "2rem" }}>
            <Link to="/" style={LinkStyle}>
              Manual Control
            </Link>
          </button>
          <button style={{ fontSize: "2rem" }}>
            <Link to="/benchbot-config" style={LinkStyle}>
              Benchbot config
            </Link>
          </button>
          <button style={{ fontSize: "2rem" }}>
            <Link to="/camera-config" style={LinkStyle}>
              Camera config
            </Link>
          </button>
        </nav>

        <Routes>
          <Route path="/" element={<ManualControl />} />
          <Route path="/benchbot-config" element={<BenchbotConfig />} />
          <Route path="/camera-config" element={<CameraConfig />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
