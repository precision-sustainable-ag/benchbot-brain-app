interface SnackBarProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
}

const SnackBarStyles = {
  position: "fixed" as "fixed",
  bottom: "4rem",
  right: "2rem",
  zIndex: "1000",
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
  // useEffect(() => {
  //   if (open) {
  //     setTimeout(() => {
  //       closeSnackBar();
  //     }, 5000);
  //   }
  // }, [open]);

  return (
    <div style={style}>
      <span style={{ fontSize: "2rem", padding: "1rem", paddingRight: "0" }}>
        {text}
      </span>
      <button
        onClick={closeSnackBar}
        style={{
          border: "none",
          background: "Gainsboro",
          fontSize: "1rem",
          padding: "1rem",
        }}
      >
        &#10006;
      </button>
    </div>
  );
}
