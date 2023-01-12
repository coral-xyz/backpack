import { toDisplayBalance } from "@coral-xyz/common";
import type { CustomTheme } from "@coral-xyz/themes";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import type { BigNumber } from "ethers";
const useStyles = styles((theme: CustomTheme) => ({
  leftLabel: {
    color: theme.custom.colors.fontColor,
    fontSize: "16px",
    lineHeight: "16px",
    fontWeight: 500,
  },
  rightLabel: {
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "16px",
    color: theme.custom.colors.fontColor,
  },
  wrapper: {
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "16px",
    color: theme.custom.colors.fontColor,
  },
  clickable: {
    cursor: "pointer",
    "&:hover": {
      color: theme.custom.colors.primaryButton,
    },
  },
}));

export function TextFieldLabel({
  leftLabel,
  rightLabel,
  rightLabelComponent,
  style,
}: {
  leftLabel: string;
  rightLabel?: string;
  rightLabelComponent?: React.ReactNode;
  style?: any;
}) {
  const classes = useStyles();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
        ...style,
      }}
    >
      <Typography className={classes.leftLabel}>{leftLabel}</Typography>
      {rightLabelComponent ? (
        rightLabelComponent
      ) : (
        <Typography className={classes.rightLabel}>{rightLabel}</Typography>
      )}
    </div>
  );
}

export const MaxLabel = ({
  amount,
  onSetAmount,
  decimals,
}: {
  amount: BigNumber | null;
  onSetAmount: (amount: BigNumber) => void;
  decimals: number;
}) => {
  const theme = useCustomTheme();
  const classes = useStyles();
  return (
    <div
      className={[
        classes.wrapper,
        amount && !amount.isZero() ? classes.clickable : "",
      ].join(" ")}
      onClick={() => amount && onSetAmount(amount)}
    >
      <span style={{ color: theme.custom.colors.secondary }}>Max: </span>
      {amount !== null ? toDisplayBalance(amount, decimals) : "-"}
    </div>
  );
};
