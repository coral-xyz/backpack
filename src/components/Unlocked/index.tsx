import { Suspense } from "react";
import { makeStyles, CircularProgress } from "@material-ui/core";
import { useTabContext, Tab } from "../../context/Tab";
import { Balances } from "./Balances";
import { Nfts } from "./Nfts";
import { Swapper } from "./Swapper";
import { Settings } from "./Settings";
import { useLoadWallet } from "../../context/Wallet";
import { AnchorProvider } from "../../context/Anchor";

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
    <AnchorProvider>
      <div className={classes.container}>
        <Suspense fallback={<UnlockedLoading />}>
          <_Unlocked />
        </Suspense>
      </div>
    </AnchorProvider>
  );
}

function _Unlocked() {
  // Bootstrap app data.
  useLoadWallet();
  const { tab } = useTabContext();
  return (
    <>
      {tab === Tab.Balances && <Balances />}
      {tab === Tab.Nfts && <Nfts />}
      {tab === Tab.Swapper && <Swapper />}
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
