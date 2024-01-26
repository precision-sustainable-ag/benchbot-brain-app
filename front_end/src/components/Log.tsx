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
    <div style={{ width: "400px", paddingLeft: "20px" }}>
      <p style={{ margin: 0 }}>
        Log
        <button onClick={clearLog} style={{ marginLeft: "100px" }}>
          Clear All Logs
        </button>
      </p>

      <textarea
        ref={textareaRef}
        value={logs.join("\n")}
        style={{ width: "400px", height: "300px" }}
        readOnly
      />
    </div>
  );
}