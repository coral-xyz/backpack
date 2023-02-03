import type { CustomTheme } from "@coral-xyz/themes";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";

import { PrimaryButton } from "./PrimaryButton";

const useStyles = styles((theme: CustomTheme) => ({
  successButton: {
    "&:hover": {
      opacity: HOVER_OPACITY,
      background: `${theme.custom.colors.successButton} !important`,
      backgroundColor: `${theme.custom.colors.successButton} !important,`,
    },
  },
}));

export function SuccessButton({ label, onClick, ...buttonProps }: any) {
  const classes = useStyles();
  const theme = useCustomTheme();

  return (
    <PrimaryButton
      className={classes.successButton}
      label={label}
      onClick={onClick}
      buttonLabelStyle={{
        color: theme.custom.colors.negativeButtonTextColor,
      }}
      {...buttonProps}
      style={{
        backgroundColor: theme.custom.colors.positive,
        ...(buttonProps.style || {}),
      }}
    />
  );
}
