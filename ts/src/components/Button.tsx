const buttonStyle = {
  height: "50px",
};

interface ButtonProps {
  name: string;
  onClick: () => void;
}

function Button({ name, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} style={buttonStyle}>
      {name}
    </button>
  );
}

export default Button;
