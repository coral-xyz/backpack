import { temporarilyMakeStylesForBrowserExtension } from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";

import { Button } from "../../../../plugin/Component";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  headerButtonLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "14px",
    lineHeight: "24px",
    fontWeight: 500,
  },
}));

export function WithHeaderButton({
  style,
  labelComponent,
  label,
  onClick,
}: any) {
  const classes = useStyles();
  return (
    <Button style={style} onClick={onClick}>
      {labelComponent ? (
        labelComponent
      ) : (
        <Typography className={classes.headerButtonLabel}>{label}</Typography>
      )}
    </Button>
  );
}
