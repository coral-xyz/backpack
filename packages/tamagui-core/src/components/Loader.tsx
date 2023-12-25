import CircularProgress from "@mui/material/CircularProgress";

import { darkThemeColors } from "../tokens";

export function Loader(props: {
  size?: number;
  iconStyle?: object;
  thickness?: number;
  id?: string;
}) {
  const size = props.size ?? 48;
  return (
    <CircularProgress
      size={size}
      style={{
        ...(props ?? {}).iconStyle,
        color: darkThemeColors.accentBlue.val,
      }}
      sx={{
        display: "block",
        marginLeft: "auto",
        marginRight: "auto",
        color: darkThemeColors.accentBlue.val,
      }}
      thickness={props.thickness ?? 4}
    />
  );
}
