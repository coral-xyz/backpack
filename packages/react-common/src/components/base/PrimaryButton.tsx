import type { CustomTheme } from "@coral-xyz/themes";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import { Button, Typography } from "@mui/material";

const useStyles = styles((theme: CustomTheme) => ({
  button: {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: theme.custom.colors.primaryButton,
    "&.Mui-disabled": {
      opacity: 0.5,
      backgroundColor: theme.custom.colors.primaryButton,
    },
    "&:hover": {
      backgroundColor: theme.custom.colors.primaryButton,
    },
  },
  primaryButton: {
    "&:hover": {
      opacity: HOVER_OPACITY,
      background: `${theme.custom.colors.primaryButton} !important`,
      backgroundColor: `${theme.custom.colors.primaryButton} !important,`,
    },
  },
  secondaryButton: {
    color: `${theme.custom.colors.secondaryButtonTextColor} !important`,
    backgroundColor: `${theme.custom.colors.secondaryButton} !important`,
    "&:hover": {
      opacity: HOVER_OPACITY,
      background: `${theme.custom.colors.secondaryButton} !important`,
      backgroundColor: `${theme.custom.colors.secondaryButton} !important,`,
    },
  },
}));

export function PrimaryButton({
  buttonLabelStyle,
  label,
  className,
  invert,
  ...buttonProps
}: {
  buttonLabelStyle?: React.CSSProperties;
  label?: string | React.ReactNode;
  invert?: boolean;
} & React.ComponentProps<typeof Button>) {
  const theme = useCustomTheme();
  const classes = useStyles();
  return (
    <Button
      disableRipple
      disableElevation
      className={`${classes.button} ${
        className ?? (invert ? classes.secondaryButton : classes.primaryButton)
      }`}
      variant="contained"
      {...buttonProps}
      style={{
        backgroundColor: theme.custom.colors.primaryButton,
        color: theme.custom.colors.primaryButtonTextColor,
        fontWeight: 500,
        fontSize: "16px",
        lineHeight: "24px",
        textTransform: "none",
        ...buttonProps.style,
      }}
    >
      <Typography
        style={{
          fontWeight: 600,
          ...buttonLabelStyle,
        }}
        className={classes.buttonLabel}
      >
        {label}
      </Typography>
    </Button>
  );
}
