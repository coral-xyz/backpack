import CircularProgress from "@mui/material/CircularProgress";
import { CSSProperties } from "react";

import { darkThemeColors } from "../tokens";

export function Loader(props: {
  size?: number;
  iconStyle?: object;
  thickness?: number;
  id?: string;
  color?: CSSProperties["color"];
}) {
  const size = props.size ?? 48;
  return (
    <CircularProgress
      size={size}
      style={{
        ...(props ?? {}).iconStyle,
        color: props.color ?? darkThemeColors.accentBlue.val,
      }}
      sx={{
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        color: props.color ?? darkThemeColors.accentBlue.val,
      }}
      thickness={props.thickness ?? 4}
    />
  );
}
