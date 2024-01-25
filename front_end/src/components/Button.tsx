import { CSSProperties } from "react";

const buttonStyle = {
  height: "100px",
  minWidth: "100px",
  fontSize: "36px",
};

interface ButtonProps {
  name: string;
  onClick: () => void;
  styles?: CSSProperties;
}

function Button({ name, onClick, styles }: ButtonProps) {
  return (
    <button onClick={onClick} style={{ ...buttonStyle, ...styles }}>
      {name}
    </button>
  );
}

export default Button;
