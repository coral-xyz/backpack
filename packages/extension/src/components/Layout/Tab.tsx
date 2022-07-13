import { Tabs, Tab } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useTab, useNavigation } from "@coral-xyz/recoil";
import { TAB_NFTS, TAB_APPS, TAB_BALANCES } from "@coral-xyz/common";
import { BalancesIcon, GridIcon, ImageIcon } from "../Icon";

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
  const theme = useCustomTheme();
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
        icon={
          <BalancesIcon
            fill={
              tab === TAB_BALANCES
                ? theme.custom.colors.tabIconSelected
                : theme.custom.colors.secondary
            }
          />
        }
      />
      <Tab
        value={TAB_APPS}
        disableRipple
        className={classes.tab}
        icon={
          <GridIcon
            fill={
              tab === TAB_APPS
                ? theme.custom.colors.tabIconSelected
                : theme.custom.colors.secondary
            }
          />
        }
      />
      <Tab
        value={TAB_NFTS}
        disableRipple
        className={classes.tab}
        icon={
          <ImageIcon
            fill={
              tab === TAB_NFTS
                ? theme.custom.colors.tabIconSelected
                : theme.custom.colors.secondary
            }
          />
        }
      />
    </Tabs>
  );
}
