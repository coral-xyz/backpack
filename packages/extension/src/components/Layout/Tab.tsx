import { Tabs, Tab } from "@mui/material";
import { AttachMoney as Money, Image, Apps } from "@mui/icons-material";
import { styles } from "@coral-xyz/themes";
import { useTab, useNavigation } from "@coral-xyz/recoil";
import { TAB_NFTS, TAB_APPS, TAB_BALANCES } from "@coral-xyz/common";

const useStyles = styles((theme) => ({
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
  const { url } = useNavigation();
  const hideTabs = url.startsWith("/plugins") || url.startsWith("/simulator");
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
      style={{
        display: hideTabs ? "none" : undefined,
      }}
    >
      <Tab
        value={TAB_BALANCES}
        disableRipple
        className={classes.tab}
        icon={<Money className={className(TAB_BALANCES)} />}
      />
      <Tab
        value={TAB_APPS}
        disableRipple
        className={classes.tab}
        icon={<Apps className={className(TAB_APPS)} />}
      />
      <Tab
        value={TAB_NFTS}
        disableRipple
        className={classes.tab}
        icon={<Image className={className(TAB_NFTS)} />}
      />
    </Tabs>
  );
}
