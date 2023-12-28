import { toDisplayBalance } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";
import type { BigNumber } from "ethers";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  leftLabel: {
    color: theme.baseTextHighEmphasis.val,
    fontSize: "16px",
    lineHeight: "16px",
    fontWeight: 500,
  },
  rightLabel: {
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "16px",
    color: theme.baseTextHighEmphasis.val,
  },
  wrapper: {
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "16px",
    color: theme.baseTextHighEmphasis.val,
  },
  clickable: {
    cursor: "pointer",
    "&:hover": {
      color: theme.baseTextHighEmphasis.val,
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
  const theme = useTheme();
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div
      className={[
        classes.wrapper,
        amount && !amount.isZero() ? classes.clickable : "",
      ].join(" ")}
      onClick={() => amount && onSetAmount(amount)}
    >
      <span style={{ color: theme.baseTextMedEmphasis.val, marginRight: 6 }}>
        {t("max")}
      </span>
      {amount !== null ? toDisplayBalance(amount, decimals) : "-"}
    </div>
  );
};
