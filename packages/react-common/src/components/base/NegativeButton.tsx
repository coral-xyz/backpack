import {
  HOVER_OPACITY,
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";

import { PrimaryButton } from "./PrimaryButton";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  negativeButton: {
    "&:hover": {
      opacity: HOVER_OPACITY,
      background: `${theme.redBackgroundSolid.val} !important`,
      backgroundColor: `${theme.redBackgroundSolid.val} !important,`,
    },
  },
}));

export function NegativeButton({ label, onClick, ...buttonProps }: any) {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <PrimaryButton
      className={classes.negativeButton}
      label={label}
      onClick={onClick}
      style={{
        backgroundColor: theme.redBackgroundSolid.val,
      }}
      buttonLabelStyle={{
        color: theme.baseTextHighEmphasis.val,
      }}
      {...buttonProps}
    />
  );
}
