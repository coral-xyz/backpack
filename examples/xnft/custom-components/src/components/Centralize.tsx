import { Custom } from "react-xnft";

export const Centralize = ({ children }) => {
  return (
    <Custom
      component={"div"}
      style={{ display: "flex", justifyContent: "center" }}
    >
      {children}
    </Custom>
  );
};
