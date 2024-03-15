import { CSSProperties } from "react";

const buttonStyle = {
  height: "75px",
  minWidth: "100px",
  fontSize: "36px",
};

interface ButtonProps {
  name: string;
  onClick: () => void;
  styles?: CSSProperties;
  disabled?: boolean;
}

function Button({ name, onClick, styles, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{ ...buttonStyle, ...styles }}
      disabled={disabled}
    >
      {name}
    </button>
  );
}

export default Button;
