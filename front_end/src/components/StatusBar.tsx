interface StatusBarProps {
  status: string;
}

const SnackBarStyles = {
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
  const styles = {
    ...SnackBarStyles,
    backgroundColor: status === "running" ? "#61dac3" : "#f65a5b",
  };
  return (
    <div style={styles}>
      <span>status: </span>
      <span>{status}</span>
    </div>
  );
}
