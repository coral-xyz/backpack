import { useState } from "react";
import { Button, Typography } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import { formatUSD } from "@coral-xyz/common";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useSolanaBalance, useActiveWallet } from "@coral-xyz/recoil";
import { WithCopyTooltip } from "../../common/WithCopyTooltip";

const useStyles = styles((theme) => ({
  balancesHeaderContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    paddingLeft: "24px",
    paddingRight: "24px",
    boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.15)",
    background: "url(assets/coral-balances.png)",
    backgroundRepeat: "round",
    height: "104px",
    color: "#fff",
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
    fontSize: "30px",
    lineHeight: "36px",
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
  const theme = useCustomTheme();
  const classes = useStyles();
  const { totalBalance, totalChange, percentChange } = useSolanaBalance();
  const { name, publicKey } = useActiveWallet();
  const activeWallet = useActiveWallet();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const pubkeyStr = toDisplayStr(publicKey);

  const onCopy = () => {
    setTooltipOpen(true);
    setTimeout(() => setTooltipOpen(false), 1000);
    navigator.clipboard.writeText(activeWallet.publicKey.toString());
  };

  return (
    <WithCopyTooltip tooltipOpen={tooltipOpen}>
      <div style={{ display: "flex" }}>
        <Button
          disableRipple
          style={{
            flex: 1,
            padding: 0,
            textTransform: "none",
            textAlign: "left",
            marginLeft: "12px",
            marginRight: "12px",
            borderRadius: "12px",
          }}
        >
          <div
            onClick={() => onCopy()}
            className={classes.balancesHeaderContainer}
          >
            <div>
              <div>
                <Typography className={classes.headerLabel}>
                  {name}
                  <span
                    style={{
                      marginLeft: "8px",
                      color: theme.custom.colors.fontColor2,
                    }}
                  >
                    {pubkeyStr}
                  </span>
                </Typography>
              </div>
              <Typography className={classes.totalBalance}>
                {formatUSD(totalBalance)}
              </Typography>
            </div>
            {Number.isFinite(percentChange) && (
              <div
                style={{
                  backgroundColor: theme.custom.colors.nav,
                  height: "20px",
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "8px",
                  position: "absolute",
                  top: 12,
                  right: 22,
                }}
              >
                <Typography
                  className={
                    totalChange > 0 ? classes.positive : classes.negative
                  }
                >
                  {/*{formatUSD(totalChange)} ({`${percentChange.toFixed(2)}%`})*/}
                  {`${percentChange.toFixed(2)}%`}
                </Typography>
              </div>
            )}
          </div>
        </Button>
      </div>
    </WithCopyTooltip>
  );
}

function toDisplayStr(publicKey: PublicKey) {
  const str = publicKey.toString();
  return `(${str.slice(0, 4)}...${str.slice(str.length - 4)})`;
}
