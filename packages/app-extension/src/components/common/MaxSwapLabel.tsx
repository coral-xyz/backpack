import { styles, useCustomTheme } from "@coral-xyz/themes";
import { ethers, BigNumber } from "ethers";

const useStyles = styles((theme) => ({
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

export const MaxSwapLabel = ({
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
      <span style={{ color: theme.custom.colors.secondary }}>Max swap: </span>
      {amount !== null ? ethers.utils.formatUnits(amount, decimals) : "-"}
    </div>
  );
};
