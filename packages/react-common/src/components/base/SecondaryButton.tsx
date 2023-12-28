import { temporarilyMakeStylesForBrowserExtension } from "@coral-xyz/tamagui";
import type { Button } from "@mui/material";

import { PrimaryButton } from "./PrimaryButton";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
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
  return (
    <PrimaryButton
      invert
      className={classes.secondaryButton}
      buttonLabelStyle={buttonLabelStyle}
      label={label}
      {...buttonProps}
      style={buttonProps.style}
    />
  );
}
