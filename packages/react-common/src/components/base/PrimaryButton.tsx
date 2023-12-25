import { useTheme } from "@coral-xyz/tamagui";
import { HOVER_OPACITY } from "@coral-xyz/tamagui";
import { Button, Typography } from "@mui/material";

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
  const theme = useTheme();
  return (
    <Button
      disableRipple
      disableElevation
      variant="contained"
      {...buttonProps}
      sx={() => ({
        width: "100%",
        height: "48px",
        borderRadius: "12px",
        "&.Mui-disabled": {
          opacity: 0.5,
          backgroundColor: theme.buttonPrimaryBackground.val,
        },
        ...(invert
          ? {
              color: `${theme.buttonSecondaryText.val} !important`,
              backgroundColor: `${theme.buttonSecondaryBackground.val} !important`,
              "&:hover": {
                opacity: HOVER_OPACITY,
                background: `${theme.buttonSecondaryBackground.val} !important`,
                backgroundColor: `${theme.buttonSecondaryBackground.val} !important,`,
              },
            }
          : {
              color: `${theme.buttonPrimaryText.val} !important`,
              backgroundColor: theme.buttonPrimaryBackground.val,
              "&:hover": {
                opacity: HOVER_OPACITY,
                background: `${theme.buttonPrimaryBackground.val} !important`,
                backgroundColor: `${theme.buttonPrimaryBackground.val} !important,`,
              },
            }),
      })}
      style={{
        backgroundColor: theme.buttonPrimaryBackground.val,
        color: theme.buttonPrimaryText.val,
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
      >
        {label}
      </Typography>
    </Button>
  );
}
