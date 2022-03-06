import { makeStyles } from "@material-ui/core";
import {
  useTabNavigationContext,
  TabNavigation,
} from "../../context/TabNavigation";
import { Balances } from "./Balances";
import { Nfts } from "./Nfts";
import { Swapper } from "./Swapper";
import { Settings } from "./Settings";
import { Quests } from "./Quests";

const useStyles = makeStyles((_theme: any) => ({
  container: {
    flex: 1,
  },
}));

export function Unlocked() {
  const classes = useStyles();
  const { tab } = useTabNavigationContext();
  return (
    <div className={classes.container}>
      {tab === TabNavigation.Balances && <Balances />}
      {tab === TabNavigation.Nfts && <Nfts />}
      {tab === TabNavigation.Swapper && <Swapper />}
      {tab === TabNavigation.Quests && <Quests />}
      {tab === TabNavigation.Settings && <Settings />}
    </div>
  );
}
