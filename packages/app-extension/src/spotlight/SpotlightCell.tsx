import { useCustomTheme } from "@coral-xyz/themes";
import { Box } from "@mui/material";

import { SELECTED_BLUE } from "./colors";

export function SpotlightCell({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: any;
  children: any;
}) {
  const theme = useCustomTheme();
  return (
    <Box
      style={{
        display: "flex",
        padding: 12,
        background: selected ? SELECTED_BLUE : "",
        borderRadius: 8,
        color: theme.custom.colors.fontColor,
        cursor: "pointer",
      }}
      sx={{
        "&:hover": {
          background: SELECTED_BLUE,
        },
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  );
}
