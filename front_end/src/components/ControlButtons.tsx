interface ControlButtonsProps {
  setValue: (num: number) => void;
  disabled?: boolean;
}

export function ControlButtonsPlus({
  setValue,
  disabled,
}: ControlButtonsProps) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <button
        onClick={() => setValue(1)}
        style={{ width: "40px", height: "40px", margin: "0 5px" }}
        disabled={disabled}
      >
        +1
      </button>
      <button
        onClick={() => setValue(10)}
        style={{ width: "40px", height: "40px", margin: "0 5px" }}
        disabled={disabled}
      >
        +10
      </button>
    </div>
  );
}

export function ControlButtonsMinus({
  setValue,
  disabled,
}: ControlButtonsProps) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <button
        onClick={() => setValue(-10)}
        style={{ width: "40px", height: "40px", margin: "0 5px" }}
        disabled={disabled}
      >
        -10
      </button>
      <button
        onClick={() => setValue(-1)}
        style={{ width: "40px", height: "40px", margin: "0 5px" }}
        disabled={disabled}
      >
        -1
      </button>
    </div>
  );
}

export default function ControlButtons({ setValue }: ControlButtonsProps) {
  return (
    <>
      <button
        onClick={() => setValue(1)}
        style={{ width: "40px", height: "40px", margin: "0 5px" }}
      >
        +1
      </button>
      <button
        onClick={() => setValue(10)}
        style={{ width: "40px", height: "40px", margin: "0 5px" }}
      >
        +10
      </button>
      <button
        onClick={() => setValue(-1)}
        style={{ width: "40px", height: "40px", margin: "0 5px" }}
      >
        -1
      </button>
      <button
        onClick={() => setValue(-10)}
        style={{ width: "40px", height: "40px", margin: "0 5px" }}
      >
        -10
      </button>
    </>
  );
}
