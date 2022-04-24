import { makeStyles, Tabs, Tab } from "@material-ui/core";
import {
  SwapCalls as Bridge,
  Person,
  PriorityHigh,
  AttachMoney as Money,
} from "@material-ui/icons";
import { useTab } from "@200ms/recoil";
import {
  TAB_BALANCES,
  TAB_QUEST,
  TAB_BRIDGE,
  TAB_FRIENDS,
} from "@200ms/common";

const useStyles = makeStyles((theme: any) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
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

export function WithTabs(props: any) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      {props.children}
      <TabBar />
    </div>
  );
}

function TabBar() {
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
        icon={<Money className={className(TAB_BALANCES)} />}
      />
      <Tab
        value={TAB_BRIDGE}
        disableRipple
        className={classes.tab}
        icon={<Bridge className={className(TAB_BRIDGE)} />}
      />
      {/*
      <Tab
        value={TAB_QUEST}
        disableRipple
        className={classes.tab}
        icon={<PriorityHigh className={className(TAB_QUEST)} />}
      />
      <Tab
        value={TAB_FRIENDS}
        disableRipple
        className={classes.tab}
        icon={<Person className={className(TAB_FRIENDS)} />}
      />
			*/}
    </Tabs>
  );
}
