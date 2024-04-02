import { useEffect } from "react";

interface SnackBarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  text: string;
  setText: (text: string) => void;
}

const SnackBarStyles = {
  position: "fixed" as "fixed",
  bottom: "1rem",
  right: "1rem",
  zIndex: "999",
  padding: "1rem 0.5rem",
  borderRadius: "0.5rem",
  backgroundColor: "Gainsboro",
  transition: "opacity 0.2s ease-in-out",
  display: "flex",
  alignItems: "center",
};

export default function SnackBar({
  open,
  setOpen,
  text,
  setText,
}: SnackBarProps) {
  const style = open ? { ...SnackBarStyles, opacity: 1 } : { opacity: 0 };

  const closeSnackBar = () => {
    setOpen(false);
    setText("");
  };

  // auto close snackbar after 5s
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        closeSnackBar();
      }, 3000);
    }
  }, [open]);

  return (
    <div style={style}>
      <span style={{ fontSize: "1rem", paddingRight: "1rem" }}>{text}</span>
      <button
        onClick={closeSnackBar}
        style={{
          border: "none",
          background: "Gainsboro",
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: "1rem" }}>&#10006;</span>
      </button>
    </div>
  );
}
