import { Suspense } from "react";
import { makeStyles, CircularProgress } from "@material-ui/core";
import { useTabContext, Tab } from "../../context/Tab";
import { Balances } from "./Balances";
import { Nfts } from "./Nfts";
import { Swapper } from "./Swapper";
import { Settings } from "./Settings";
import { useBootstrap } from "../../context/Wallet";
import { WithNav } from "../Layout/Nav";

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
  const { tab } = useTabContext();
  return (
    <>
      {tab === Tab.Balances && (
        <WithBootstrap title={"Balances"}>
          <Balances />
        </WithBootstrap>
      )}
      {tab === Tab.Nfts && (
        <WithBootstrap title={"Nfts"}>
          <Nfts />
        </WithBootstrap>
      )}
      {tab === Tab.Swapper && (
        <WithBootstrap title={"Swapper"}>
          <Swapper />
        </WithBootstrap>
      )}
      {tab === Tab.Settings && (
        <WithBootstrap title={"Settings"}>
          <Settings />
        </WithBootstrap>
      )}
    </>
  );
}

function WithBootstrap(props: any) {
  return (
    <WithNav title={props.title}>
      <Suspense fallback={<UnlockedLoading />}>
        <_WithBootstrap>{props.children}</_WithBootstrap>
      </Suspense>
    </WithNav>
  );
}

function _WithBootstrap(props: any) {
  useBootstrap();
  return <>{props.children}</>;
}

function UnlockedLoading() {
  const classes = useStyles();
  return (
    <div className={classes.loadingContainer}>
      <CircularProgress className={classes.loadingIndicator} />
    </div>
  );
}
