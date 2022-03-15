import { makeStyles, CircularProgress } from "@material-ui/core";
import { useTab } from "../../hooks/useTab";
import { Balances } from "./Balances";
import { Quests } from "./Quests";
import { Bridge } from "./Bridge";
import { Settings } from "./Settings";
import {
  useBootstrap,
  useBootstrapFast,
  useBackgroundPoll,
} from "../../context/Wallet";
import { WithNav, WithNavContext } from "../Layout/Nav";
import { TAB_BALANCES, TAB_BRIDGE, TAB_QUEST, TAB_FRIENDS } from "../../common";

const useStyles = makeStyles((theme: any) => ({
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
    color: theme.custom.colors.activeNavButton,
  },
}));

export function Unlocked() {
  useBackgroundPoll();
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
      {tab === TAB_QUEST && (
        <WithBootstrap title={"Nfts"} navKey={TAB_QUEST}>
          <Quests />
        </WithBootstrap>
      )}
      {tab === TAB_BRIDGE && (
        <WithBootstrap title={"Swapper"} navKey={TAB_BRIDGE}>
          <Bridge />
        </WithBootstrap>
      )}
      {tab === TAB_FRIENDS && (
        <WithBootstrap title={"Friends"} navKey={TAB_FRIENDS}>
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
