import { useCustomTheme } from "@coral-xyz/themes";
import { Tooltip } from "@mui/material";

export function WithCopyTooltip({ children, tooltipOpen, title }: any) {
  const theme = useCustomTheme();
  return (
    <Tooltip
      arrow
      title={title ?? "Copied"}
      open={tooltipOpen}
      disableFocusListener
      disableHoverListener
      disableTouchListener
      componentsProps={{
        tooltip: {
          sx: {
            fontSize: "14px",
            bgcolor: theme.custom.colors.copyTooltipColor,
            color: theme.custom.colors.copyTooltipTextColor,
            "& .MuiTooltip-arrow": {
              color: theme.custom.colors.copyTooltipColor,
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
