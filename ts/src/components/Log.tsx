import { useEffect, useRef } from "react";

interface LogProps {
  logs: string[];
  clearLog: () => void;
}

export default function Log({ logs, clearLog }: LogProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // automatically scroll to the bottom
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div style={{ width: "400px", paddingLeft: "40px" }}>
      <p style={{ margin: 0 }}>Log</p>
      <button onClick={clearLog}>Clear All Logs</button>

      <textarea
        ref={textareaRef}
        value={logs.reverse().join("\n")}
        style={{ width: "400px", height: "400px" }}
        readOnly
      />
    </div>
  );
}
