import { ReactNode, CSSProperties } from "react";

interface RowProps {
  children: ReactNode;
  styles?: CSSProperties;
}

const Row = ({ children, styles }: RowProps) => {
  return (
    <div
      style={{
        padding: "5px 0",
        display: "flex",
        alignItems: "center",
        ...styles,
      }}
    >
      {children}
    </div>
  );
};

export default Row;
