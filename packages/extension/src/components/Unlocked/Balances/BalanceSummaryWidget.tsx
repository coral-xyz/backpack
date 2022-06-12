import { Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { useTotal } from "@200ms/recoil";
import { formatUSD } from "@200ms/common";

const useStyles = makeStyles((theme: any) => ({
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
    backgroundColor: theme.custom.colors.nav,
  },
  headerLabel: {
    fontSize: "12px",
    fontWeight: 500,
    color: theme.custom.colors.secondary,
    lineHeight: "24px",
  },
  totalBalance: {
    fontWeight: 500,
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

export function BalanceSummaryWidget({ blockchain }: { blockchain?: string }) {
  const classes = useStyles();
  const { totalBalance, totalChange, percentChange } = useTotal(blockchain);
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
