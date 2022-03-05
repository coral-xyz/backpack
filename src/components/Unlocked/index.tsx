import { makeStyles } from "@material-ui/core";
import {
  useTabNavigationContext,
  TabNavigation,
} from "../../context/TabNavigation";
import { Balances } from "./Balances";
import { Nfts } from "./Nfts";
import { Swapper } from "./Swapper";
import { Settings } from "./Settings";

const useStyles = makeStyles((theme: any) => ({
  container: {
    flex: 1,
  },
}));

export function Unlocked() {
  const classes = useStyles();
  const { tab } = useTabNavigationContext();
  console.log("tab", tab);
  return (
    <div className={classes.container}>
      {tab === TabNavigation.Balances && <Balances />}
      {tab === TabNavigation.Nfts && <Nfts />}
      {tab === TabNavigation.Swapper && <Swapper />}
      {tab === TabNavigation.Settings && <Settings />}
    </div>
  );
}
