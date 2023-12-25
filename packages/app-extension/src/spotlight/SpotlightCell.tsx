import { useTheme } from "@coral-xyz/tamagui";
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
  const theme = useTheme();
  return (
    <Box
      style={{
        display: "flex",
        padding: 12,
        background: selected ? SELECTED_BLUE : "",
        borderRadius: 8,
        color: theme.baseTextHighEmphasis.val,
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
