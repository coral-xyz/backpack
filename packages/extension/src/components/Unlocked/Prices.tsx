import { IconButton } from "@mui/material";
import { Timeline } from "@mui/icons-material";
import { useCustomTheme } from "@coral-xyz/themes";

export function PriceButton() {
  const theme = useCustomTheme();
  return (
    <IconButton
      disableRipple
      style={{
        padding: 0,
      }}
    >
      <Timeline
        style={{
          color: theme.custom.colors.secondary,
        }}
      />
    </IconButton>
  );
}

function Prices() {
  return <div></div>;
}
