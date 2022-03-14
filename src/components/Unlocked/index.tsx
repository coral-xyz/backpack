import { makeStyles, CircularProgress } from "@material-ui/core";
import { useTab } from "../../hooks/useTab";
import { Balances } from "./Balances";
import { Nfts } from "./Nfts";
import { Swapper } from "./Swapper";
import { Settings } from "./Settings";
import { useBootstrap, useBootstrapFast } from "../../context/Wallet";
import { WithNav, WithNavContext } from "../Layout/Nav";
import { TAB_BALANCES, TAB_NFTS, TAB_SWAP, TAB_SETTINGS } from "../../common";

const useStyles = makeStyles((_theme: any) => ({
  container: {
    flex: 1,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    height: "100%",
  },
  loadingIndicator: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
}));

export function Unlocked() {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <_Unlocked />
    </div>
  );
}

function _Unlocked() {
  return (
    <WithNav>
      <TabbedNavContent />
    </WithNav>
  );
}

function TabbedNavContent() {
  const { tab } = useTab();
  return (
    <>
      {tab === TAB_BALANCES && (
        <WithBootstrap title={"Balances"} navKey={TAB_BALANCES}>
          <Balances />
        </WithBootstrap>
      )}
      {tab === TAB_NFTS && (
        <WithBootstrap title={"Nfts"} navKey={TAB_NFTS}>
          <Nfts />
        </WithBootstrap>
      )}
      {tab === TAB_SWAP && (
        <WithBootstrap title={"Swapper"} navKey={TAB_SWAP}>
          <Swapper />
        </WithBootstrap>
      )}
      {tab === TAB_SETTINGS && (
        <WithBootstrap title={"Settings"} navKey={TAB_SETTINGS}>
          <Settings />
        </WithBootstrap>
      )}
    </>
  );
}

function WithBootstrap(props: any) {
  return (
    <WithNavContext title={props.title} navKey={props.navKey}>
      <_WithBootstrap>{props.children}</_WithBootstrap>
    </WithNavContext>
  );
}

function _WithBootstrap(props: any) {
  useBootstrapFast();
  useBootstrap();
  return <>{props.children}</>;
}

export function UnlockedLoading() {
  const classes = useStyles();
  return (
    <div className={classes.loadingContainer}>
      <CircularProgress className={classes.loadingIndicator} />
    </div>
  );
}
