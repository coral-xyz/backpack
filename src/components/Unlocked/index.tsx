import { makeStyles } from "@material-ui/core";
import { useTabContext, Tab } from "../../context/Tab";
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
  const { tab } = useTabContext();
  return (
    <div className={classes.container}>
      {tab === Tab.Balances && <Balances />}
      {tab === Tab.Nfts && <Nfts />}
      {tab === Tab.Swapper && <Swapper />}
      {tab === Tab.Quests && <Quests />}
      {tab === Tab.Settings && <Settings />}
    </div>
  );
}
