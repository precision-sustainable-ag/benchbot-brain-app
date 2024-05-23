import { traversalStatus } from "../interfaces/BenchBotTypes";

interface StatusBarProps {
  status: traversalStatus;
}

const StatusBarStyles = {
  position: "fixed" as "fixed",
  top: "0.5rem",
  right: "0.5rem",
  zIndex: "999",
  borderRadius: "0.5rem",
  transition: "opacity 0.2s ease-in-out",
  display: "flex",
  alignItems: "center",
  width: "200px",
  backgroundColor: "whitesmoke",
};

export default function StatusBar({ status }: StatusBarProps) {
  const statusBarBgColor = () => {
    switch (status) {
      case "running":
        return "#61dac3";
      case "paused":
        return "#FFD700";
      case "stopped":
      default:
        return "#f65a5b";
    }
  };

  const styles = {
    ...StatusBarStyles,
    backgroundColor: statusBarBgColor(),
  };

  return (
    <div style={styles}>
      <span>{status}</span>
    </div>
  );
}
