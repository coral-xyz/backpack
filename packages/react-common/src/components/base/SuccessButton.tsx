import {
  HOVER_OPACITY,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";

import { PrimaryButton } from "./PrimaryButton";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  successButton: {
    "&:hover": {
      opacity: HOVER_OPACITY,
      background: `${theme.greenText.val} !important`,
      backgroundColor: `${theme.baseTextHighEmphasis.val} !important,`,
    },
  },
}));

export function SuccessButton({ label, onClick, ...buttonProps }: any) {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <PrimaryButton
      className={classes.successButton}
      label={label}
      onClick={onClick}
      buttonLabelStyle={{
        color: theme.buttonPrimaryText.val,
      }}
      {...buttonProps}
      style={{
        backgroundColor: theme.greenBackgroundSolid.val,
        ...(buttonProps.style || {}),
      }}
    />
  );
}
