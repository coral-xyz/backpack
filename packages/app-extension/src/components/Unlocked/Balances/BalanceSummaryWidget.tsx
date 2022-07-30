import { formatUSD } from "@coral-xyz/common";
import { Typography } from "@mui/material";
import { styles } from "@coral-xyz/themes";
import { useSolanaBalance } from "@coral-xyz/recoil";

const useStyles = styles((theme) => ({
  balancesHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    paddingLeft: "12px",
    paddingRight: "12px",
    marginLeft: "12px",
    marginRight: "12px",
    paddingTop: "12px",
    paddingBottom: "12px",
    borderRadius: "12px",
    boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
    backgroundColor: theme.custom.colors.nav,
  },
  headerLabel: {
    fontSize: "12px",
    fontWeight: 500,
    color: theme.custom.colors.secondary,
    lineHeight: "24px",
  },
  totalBalance: {
    fontWeight: 600,
    fontSize: "20px",
    color: theme.custom.colors.fontColor,
    lineHeight: "24px",
  },
  positive: {
    color: theme.custom.colors.positive,
    fontSize: "12px",
    lineHeight: "24px",
  },
  negative: {
    color: theme.custom.colors.negative,
    fontSize: "12px",
    lineHeight: "24px",
  },
}));

export function BalanceSummaryWidget() {
  const classes = useStyles();
  const { totalBalance, totalChange, percentChange } = useSolanaBalance();
  return (
    <div className={classes.balancesHeaderContainer}>
      <div>
        <Typography className={classes.headerLabel}>Total Balance</Typography>
        <Typography className={classes.totalBalance}>
          {formatUSD(totalBalance)}
        </Typography>
      </div>
      {Number.isFinite(percentChange) && (
        <div>
          <Typography className={classes.headerLabel}>Last 24 hrs</Typography>
          <Typography
            className={totalChange > 0 ? classes.positive : classes.negative}
          >
            {formatUSD(totalChange)} ({`${percentChange.toFixed(2)}%`})
          </Typography>
        </div>
      )}
    </div>
  );
}
