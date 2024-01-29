import { BrowserRouter, Route, Link, Routes } from "react-router-dom";
import ManualControl from "./pages/ManualControl";
import BenchbotConfig from "./pages/BenchbotConfig";
import CameraConfig from "./pages/CameraConfig";

const LinkStyle = { color: "inherit", textDecoration: "none" };

// call to localhost:8042?x=1&z=-1

function App() {
  return (
    <BrowserRouter>
      <div style={{ width: "1280px", height: "800px", fontSize: "36px" }}>
        <nav style={{ textAlign: "left" }}>
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