import { toDisplayBalance } from "@coral-xyz/common";
import type { CustomTheme } from "@coral-xyz/themes";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import type { BigNumber } from "ethers";
const useStyles = styles((theme: CustomTheme) => ({
  leftLabel: {
    color: (props: { labelColor?: string }) =>
      props.labelColor || theme.custom.colors.fontColor,
    fontSize: "16px",
    lineHeight: "16px",
    fontWeight: 500,
  },
  rightLabel: {
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "16px",
    color: (props: { labelColor?: string }) =>
      props.labelColor || theme.custom.colors.fontColor,
  },
  wrapper: {
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "16px",
    color: (props: { labelColor?: string }) =>
      props.labelColor || theme.custom.colors.fontColor,
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
  labelColor,
}: {
  leftLabel: string;
  rightLabel?: string;
  rightLabelComponent?: React.ReactNode;
  style?: any;
  labelColor?: string;
}) {
  const classes = useStyles({ labelColor });
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
  labelColor,
}: {
  amount: BigNumber | null;
  onSetAmount: (amount: BigNumber) => void;
  decimals: number;
  labelColor?: string;
}) => {
  const theme = useCustomTheme();
  const classes = useStyles({ labelColor });
  return (
    <div
      className={[
        classes.wrapper,
        amount && !amount.isZero() ? classes.clickable : "",
      ].join(" ")}
      onClick={() => amount && onSetAmount(amount)}
    >
      <span style={{ color: labelColor || theme.custom.colors.secondary }}>
        Max:{" "}
      </span>
      {amount !== null ? toDisplayBalance(amount, decimals) : "-"}
    </div>
  );
};
