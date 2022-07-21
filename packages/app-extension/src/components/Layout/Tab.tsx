import { useLocation } from "react-router-dom";
import { Tabs, Tab } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useTab, useBackgroundClient } from "@coral-xyz/recoil";
import {
  TAB_NFTS,
  TAB_APPS,
  TAB_BALANCES,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
} from "@coral-xyz/common";
import { BalancesIcon, GridIcon, ImageIcon } from "../Icon";

const TAB_HEIGHT = 64;

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
    height: `${TAB_HEIGHT}px`,
  },
  tabRoot: {
    height: `${TAB_HEIGHT}px`,
    minHeight: `${TAB_HEIGHT}px`,
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
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {props.children}
      </div>
      <TabBar />
    </div>
  );
}

function TabBar() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const tab = useTab();
  const location = useLocation();
  const pathname = location.pathname;
  const background = useBackgroundClient();
  const hideTabs =
    pathname.startsWith("/apps/plugins") ||
    pathname.startsWith("/apps/simulator");
  return (
    <Tabs
      value={tab}
      onChange={(_e, newValue) =>
        background.request({
          method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
          params: [newValue],
        })
      }
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
