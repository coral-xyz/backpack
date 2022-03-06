import { makeStyles, Tabs, Tab } from "@material-ui/core";
import {
  SwapHoriz,
  Settings,
  Apps,
  MonetizationOn,
  PriorityHigh,
} from "@material-ui/icons";
import { useTabContext } from "../../context/Tab";

const useStyles = makeStyles((theme: any) => ({
  tab: {
    color: theme.custom.colors.offText,
  },
}));

export function TabBar() {
  const classes = useStyles();
  const { tab, setTab } = useTabContext();
  return (
    <Tabs
      value={tab}
      onChange={(_e, newValue) => setTab(newValue)}
      variant="fullWidth"
      indicatorColor="primary"
      textColor="primary"
    >
      <Tab className={classes.tab} icon={<MonetizationOn />} />
      <Tab className={classes.tab} icon={<Apps />} />
      <Tab className={classes.tab} icon={<SwapHoriz />} />
      <Tab className={classes.tab} icon={<PriorityHigh />} />
      <Tab className={classes.tab} icon={<Settings />} />
    </Tabs>
  );
}
