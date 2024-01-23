import { ReactNode } from "react";

interface RowProps {
  children: ReactNode;
}

const Row = ({ children }: RowProps) => {
  return (
    <div
      style={{
        padding: "10px 0",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
};

export default Row;
