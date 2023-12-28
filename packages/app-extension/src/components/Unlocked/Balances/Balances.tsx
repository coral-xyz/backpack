import { formatUsd, proxyImageUrl, UNKNOWN_ICON_SRC } from "@coral-xyz/common";
import { temporarilyMakeStylesForBrowserExtension } from "@coral-xyz/tamagui";
import { ListItemIcon, Typography } from "@mui/material";

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  balancesTableCellContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
  },
  tokenListItemContent: {
    color: theme.baseTextHighEmphasis.val,
    flex: 1,
    paddingTop: "10px",
    paddingBottom: "10px",
  },
  tokenListItemRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  logoIcon: {
    borderRadius: "22px",
    width: "44px",
    height: "44px",
  },
  tokenListItemIcon: {
    paddingTop: "12px",
    paddingBottom: "12px",
    marginRight: "12px",
  },
  tokenName: {
    height: "24px",
    fontWeight: 500,
    fontSize: "16px",
    maxWidth: "200px",
    overflow: "hidden",
    color: theme.baseTextHighEmphasis.val,
    lineHeight: "24px",
  },
  tokenAmount: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.baseTextMedEmphasis.val,
    lineHeight: "20px",
  },
  tokenBalance: {
    fontWeight: 500,
    fontSize: "16px",
    color: theme.baseTextHighEmphasis.val,
    lineHeight: "24px",
  },
  tokenBalanceChangeNeutral: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.baseTextMedEmphasis.val,
    float: "right",
    lineHeight: "20px",
  },
  tokenBalanceChangePositive: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.greenText.val,
    float: "right",
    lineHeight: "20px",
  },
  tokenBalanceChangeNegative: {
    fontWeight: 500,
    fontSize: "14px",
    color: theme.redText.val,
    float: "right",
    lineHeight: "20px",
  },
  tokenListItemIconRoot: {
    minWidth: "44px",
  },
}));

export function BalancesTableCell({ props }: any) {
  const { icon, title, subtitle, usdValue, balanceChange } = props;
  const classes = useStyles();

  // Determine the balance change polarity with a 100th rounding margin of 0.00
  const polarity =
    (balanceChange ?? 0) > 0.004
      ? "positive"
      : (balanceChange ?? 0) < -0.004
      ? "negative"
      : "neutral";

  const changeLabel =
    polarity === "positive" ? (
      <Typography className={classes.tokenBalanceChangePositive}>
        +{formatUsd(balanceChange.toLocaleString())}
      </Typography>
    ) : polarity === "negative" ? (
      <Typography className={classes.tokenBalanceChangeNegative}>
        {formatUsd(balanceChange.toLocaleString())}
      </Typography>
    ) : null;

  return (
    <div className={classes.balancesTableCellContainer}>
      {icon ? (
        <ListItemIcon
          className={classes.tokenListItemIcon}
          classes={{ root: classes.tokenListItemIconRoot }}
        >
          <ProxyImage
            src={icon}
            className={classes.logoIcon}
            onError={(event: any) => {
              event.currentTarget.src = UNKNOWN_ICON_SRC;
            }}
          />
        </ListItemIcon>
      ) : null}
      <div className={classes.tokenListItemContent}>
        <div className={classes.tokenListItemRow}>
          <Typography className={classes.tokenName}>{title}</Typography>
          <Typography className={classes.tokenBalance}>
            {usdValue ? formatUsd(usdValue) : "-"}
          </Typography>
        </div>
        <div className={classes.tokenListItemRow}>
          {subtitle ? (
            <Typography className={classes.tokenAmount}>{subtitle}</Typography>
          ) : null}
          {changeLabel}
          {!usdValue ? (
            <Typography className={classes.tokenBalanceChangeNeutral}>
              -
            </Typography>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProxyImage(props: any) {
  return (
    <img
      {...props}
      onError={({ currentTarget }) => {
        currentTarget.onerror = props.onError || null;
        currentTarget.src = props.src;
      }}
      src={proxyImageUrl(props.src)}
    />
  );
}
