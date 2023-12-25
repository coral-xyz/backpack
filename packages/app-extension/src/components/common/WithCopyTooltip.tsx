import { useTheme } from "@coral-xyz/tamagui";
import { Tooltip } from "@mui/material";

export function WithCopyTooltip({ children, tooltipOpen, title }: any) {
  const theme = useTheme();
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
            bgcolor: theme.baseBackgroundL1.val,
            color: theme.baseTextHighEmphasis.val,
            "& .MuiTooltip-arrow": {
              color: theme.baseBackgroundL1.val,
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
