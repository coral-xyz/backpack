import { Typography } from "@mui/material";
import { formatUSD } from "@coral-xyz/common";
import { styles, useCustomTheme, HOVER_OPACITY } from "@coral-xyz/themes";
import { useSolanaBalance, useActiveWallet } from "@coral-xyz/recoil";

const useStyles = styles((theme) => ({
  button: {
    color: "#fff",
    "&:hover": {
      opacity: 1,
    },
    "&:hover p": {
      opacity: HOVER_OPACITY,
    },
  },
  balancesHeaderContainer: {
    paddingLeft: "24px",
    paddingRight: "24px",
    paddingTop: "20px",
    //    boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
    //    background: "url(assets/coral-balances.png)",
    backgroundRepeat: "round",
    height: "110px",
    width: "100%",
    borderRadius: "12px",
  },
  headerLabel: {
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
  },
  totalBalance: {
    fontWeight: 600,
    fontSize: "36px",
    lineHeight: "40px",
    color: "inherit",
  },
  positive: {
    color: `${theme.custom.colors.positive} !important`,
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
  const theme = useCustomTheme();
  const classes = useStyles();
  const { totalBalance, totalChange, percentChange } = useSolanaBalance();

  return (
    <div style={{ display: "flex" }}>
      <div
        className={classes.balancesHeaderContainer}
        style={{
          textAlign: "center",
          marginLeft: "12px",
          marginRight: "12px",
          borderRadius: "12px",
        }}
      >
        <Typography
          className={classes.totalBalance}
          style={{
            color: theme.custom.colors.fontColor,
          }}
        >
          {formatUSD(totalBalance)}
        </Typography>
        <div
          style={{
            display: "flex",
            marginTop: "6px",
          }}
        >
          <div style={{ flex: 1 }} />
          <Typography
            style={{
              color:
                totalChange < 0
                  ? theme.custom.colors.negative
                  : theme.custom.colors.positive,
              paddingLeft: "0px",
              paddingRight: "0px",
              paddingTop: "2px",
              paddingBottom: "2px",
              marginRight: "10px",
              lineHeight: "24px",
            }}
          >
            {totalChange > 0 ? "+" : ""}
            {formatUSD(totalChange)}
          </Typography>
          {Number.isFinite(percentChange) && (
            <Typography
              style={{
                color:
                  totalChange < 0
                    ? theme.custom.colors.negative
                    : theme.custom.colors.positive,
                //                paddingLeft: "8px",
                //                paddingRight: "8px",
                paddingTop: "2px",
                paddingBottom: "2px",
                //                background: "rgba(255, 255, 255, 0.2)",
                //                borderRadius: "28px",
                lineHeight: "24px",
              }}
            >
              {totalChange > 0 ? "+" : ""}
              {`${percentChange.toFixed(2)}%`}
            </Typography>
          )}
          <div style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
}
