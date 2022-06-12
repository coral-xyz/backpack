import { useEffect } from "react";
import { useTheme, Typography } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import { PluginRenderer } from "@200ms/anchor-ui-renderer";
import { useNavigation, useTotal, useTablePlugins } from "@200ms/recoil";
import { formatUSD } from "@200ms/common";
import { TokenTable } from "./TokenTable";
import { SettingsButton } from "../../Settings";
import { WithHeaderButton } from "./Token";
import { Deposit } from "./Deposit";

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
    marginBottom: "32px",
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
      <TransferButtons />
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

function TransferButtons() {
  return (
    <div
      style={{
        display: "flex",
        marginBottom: "32px",
        width: "136px",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <ReceiveButton />
      <div style={{ width: "27px" }} />
      <SendButton />
    </div>
  );
}

function SendButton() {
  return (
    <TransferButton
      label={"Send"}
      labelComponent={
        <ArrowDownward
          style={{
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      dialogTitle={"Send"}
    />
  );
}

function ReceiveButton() {
  return (
    <TransferButton
      label={"Receive"}
      labelComponent={
        <ArrowUpward
          style={{
            display: "flex",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      }
      dialogTitle={"Deposit"}
    />
  );
}

function TransferButton({
  label,
  labelComponent,
  dialogTitle,
}: {
  label: string;
  dialogTitle: string;
}) {
  const theme = useTheme() as any;
  return (
    <div
      style={{
        width: "52px",
        height: "70px",
      }}
    >
      <WithHeaderButton
        style={{
          padding: 0,
          width: "42px",
          height: "42px",
          minWidth: "42px",
          borderRadius: "21px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
          marginBottom: "8px",
        }}
        dialogTitle={dialogTitle}
        label={""}
        dialog={(setOpenDrawer: (b: boolean) => void) => {
          <Deposit close={() => setOpenDrawer(false)} />;
        }}
        labelComponent={labelComponent}
      />
      <Typography
        style={{
          color: theme.custom.colors.secondary,
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "20px",
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
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
