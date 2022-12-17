import type {
  CustomTheme} from "@coral-xyz/themes";
import {
  HOVER_OPACITY,
  styles,
  useCustomTheme,
} from "@coral-xyz/themes";
import type { Button } from "@mui/material";

import { PrimaryButton } from "./PrimaryButton";

const useStyles = styles((theme: CustomTheme) => ({
  secondaryButton: {},
}));

export function SecondaryButton({
  buttonLabelStyle,
  label,
  ...buttonProps
}: {
  buttonLabelStyle?: React.CSSProperties;
  label?: string;
} & React.ComponentProps<typeof Button>) {
  const classes = useStyles();
  const theme = useCustomTheme();
  const buttonStyle = {
    backgroundColor: theme.custom.colors.secondaryButton,
    color: theme.custom.colors.secondaryButtonTextColor,
    ...buttonProps.style,
  };
  return (
    <PrimaryButton
      className={classes.secondaryButton}
      buttonLabelStyle={buttonLabelStyle}
      label={label}
      {...buttonProps}
      style={buttonStyle}
    />
  );
}
