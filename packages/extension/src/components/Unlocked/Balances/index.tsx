import { useEffect } from "react";
import { makeStyles, Typography } from "@material-ui/core";
import { PluginRenderer } from "@200ms/anchor-ui-renderer";
import { useNavigation, useTotal, useTablePlugins } from "@200ms/recoil";
import { TokenTable } from "./TokenTable";
import { SettingsButton } from "../../Settings";
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
    marginBottom: "12px",
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

export function Balances() {
  const { setNavButtonRight } = useNavigation();
  useEffect(() => {
    setNavButtonRight(<SettingsButton />);
    return () => {
      setNavButtonRight(null);
    };
  }, []);
  return (
    <div>
      <BalanceSummary blockchain={"solana"} />
      <TokenTable />
      <PluginTables />
    </div>
  );
}

export function BalanceSummary({ blockchain }: { blockchain?: string }) {
  const classes = useStyles();
  const { totalBalance, totalChange, percentChange } = useTotal(blockchain);
  return (
    <div className={classes.balancesHeaderContainer}>
      <div>
        <Typography className={classes.headerLabel}>Total Balance</Typography>
        <Typography className={classes.totalBalance}>
          {formatUSD(totalBalance.toLocaleString())}
        </Typography>
      </div>
      {Number.isFinite(percentChange) && (
        <div>
          <Typography className={classes.headerLabel}>Last 24 hrs</Typography>
          <Typography
            className={totalChange > 0 ? classes.positive : classes.negative}
          >
            {formatUSD(totalChange.toLocaleString())} (
            {`${percentChange.toFixed(2)}%`})
          </Typography>
        </div>
      )}
    </div>
  );
}

function PluginTables() {
  const tablePlugins = useTablePlugins();
  return (
    <>
      {tablePlugins.map((plugin: any) => {
        return <PluginRenderer key={plugin.iframeUrl} plugin={plugin} />;
      })}
    </>
  );
}
