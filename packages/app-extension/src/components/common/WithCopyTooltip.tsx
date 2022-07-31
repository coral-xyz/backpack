import { Tooltip } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";

export function WithCopyTooltip({ children, tooltipOpen }: any) {
  const theme = useCustomTheme();
  return (
    <Tooltip
      arrow
      title={"Copied"}
      open={tooltipOpen}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      componentsProps={{
        tooltip: {
          sx: {
            fontSize: "14px",
            bgcolor: theme.custom.colors.activeNavButton,
            "& .MuiTooltip-arrow": {
              color: theme.custom.colors.activeNavButton,
            },
          },
        },
        popper: {
          sx: {
            // Hack: Without this, the root container of the app widens by 15 px,
            //       when the tooltip displays.
            position: "fixed",
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
}
