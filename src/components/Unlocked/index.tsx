import { Suspense } from "react";
import { makeStyles, CircularProgress } from "@material-ui/core";
import { useTabContext, Tab } from "../../context/Tab";
import { Balances } from "./Balances";
import { Nfts } from "./Nfts";
import { Swapper } from "./Swapper";
import { Settings } from "./Settings";
import { Quests } from "./Quests";
import { useLoadWallet } from "../../context/Wallet";
import { useConnection } from "../../context/Connection";

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
      <Suspense fallback={<UnlockedLoading />}>
        <_Unlocked />
      </Suspense>
    </div>
  );
}

function _Unlocked() {
  // Bootstrap app data.
  useLoadWallet();
  const connection = useConnection();
  const { tab } = useTabContext();

  return (
    <>
      {tab === Tab.Balances && <Balances />}
      {tab === Tab.Nfts && <Nfts />}
      {tab === Tab.Swapper && <Swapper />}
      {tab === Tab.Quests && <Quests />}
      {tab === Tab.Settings && <Settings />}
    </>
  );
}

function UnlockedLoading() {
  const classes = useStyles();
  return (
    <div className={classes.loadingContainer}>
      <CircularProgress className={classes.loadingIndicator} />
    </div>
  );
}
