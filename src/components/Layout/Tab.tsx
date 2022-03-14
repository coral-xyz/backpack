import { makeStyles, Tabs, Tab } from "@material-ui/core";
import { SwapHoriz, Settings, Apps, MonetizationOn } from "@material-ui/icons";
import { useTab } from "../../hooks/useTab";
import { TAB_BALANCES, TAB_NFTS, TAB_SWAP, TAB_SETTINGS } from "../../common";

const useStyles = makeStyles((theme: any) => ({
  tab: {
    borderTop: `solid 1pt ${theme.custom.colors.border}`,
    color: theme.custom.colors.tabIconBackground,
    height: "64px",
  },
  tabRoot: {
    height: "64px",
    minHeight: "64px",
    backgroundColor: theme.custom.colors.nav,
  },
  tabIndicator: {
    color: "none",
  },
  tabSelected: {
    color: theme.custom.colors.tabIconSelected,
  },
  tabUnselected: {},
}));

export function TabBar() {
  const classes = useStyles();
  const { tab, setTab } = useTab();
  const className = (idx: string) => {
    if (idx === tab) {
      return classes.tabSelected;
    }
    return classes.tabUnselected;
  };
  return (
    <Tabs
      value={tab}
      onChange={(_e, newValue) => setTab(newValue)}
      variant="fullWidth"
      classes={{
        root: classes.tabRoot,
        indicator: classes.tabIndicator,
      }}
      TabIndicatorProps={{
        style: {
          display: "none",
        },
      }}
    >
      <Tab
        value={TAB_BALANCES}
        disableRipple
        className={classes.tab}
        icon={<MonetizationOn className={className(TAB_BALANCES)} />}
      />
      <Tab
        value={TAB_NFTS}
        disableRipple
        className={classes.tab}
        icon={<Apps className={className(TAB_NFTS)} />}
      />
      <Tab
        value={TAB_SWAP}
        disableRipple
        className={classes.tab}
        icon={<SwapHoriz className={className(TAB_SWAP)} />}
      />
      <Tab
        value={TAB_SETTINGS}
        disableRipple
        className={classes.tab}
        icon={<Settings className={className(TAB_SETTINGS)} />}
      />
    </Tabs>
  );
}
