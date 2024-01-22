interface LogProps {
  logs: string[];
  clearLog: () => void;
}

export default function Log({ logs, clearLog }: LogProps) {
  return (
    <div>
      <p style={{ margin: 0 }}>Log</p>
      <button onClick={clearLog}>Clear All Logs</button>

      <textarea
        value={logs.reverse().join("\n")}
        style={{ width: "400px", height: "400px" }}
      />
    </div>
  );
}
