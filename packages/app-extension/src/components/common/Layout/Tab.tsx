import { Tabs, Tab } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { useTab, useBackgroundClient } from "@coral-xyz/recoil";
import {
  TAB_NFTS,
  TAB_APPS,
  TAB_BALANCES,
  TAB_SWAP,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import { BalancesIcon, GridIcon, ImageIcon, SwapIcon } from "../../common/Icon";

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
    color: theme.custom.colors.tabIconBackground,
    height: `${TAB_HEIGHT}px`,
  },
  tabRoot: {
    height: `${TAB_HEIGHT}px`,
    minHeight: `${TAB_HEIGHT}px`,
    backgroundColor: "transparent",
  },
  tabIndicator: {
    color: "none",
  },
  tabSelected: {
    color: theme.custom.colors.brandColor,
  },
  tabUnselected: {},
  tabButton: {
    padding: 0,
    "&:hover": {
      color: "red",
    },
  },
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
  const background = useBackgroundClient();

  const onTabClick = (tabValue: string) => {
    if (tabValue === tab) {
      background.request({
        method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
        params: [],
      });
    } else {
      background.request({
        method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
        params: [tabValue],
      });
    }
  };

  return tab === "" ? null : (
    <Tabs
      value={tab}
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
        onClick={() => onTabClick(TAB_BALANCES)}
        value={TAB_BALANCES}
        disableRipple
        className={classes.tab}
        icon={
          <BalancesIcon
            fill={
              tab === TAB_BALANCES
                ? theme.custom.colors.brandColor
                : theme.custom.colors.secondary
            }
          />
        }
      />
      <Tab
        onClick={() => onTabClick(TAB_APPS)}
        value={TAB_APPS}
        disableRipple
        className={classes.tab}
        icon={
          <GridIcon
            fill={
              tab === TAB_APPS
                ? theme.custom.colors.brandColor
                : theme.custom.colors.secondary
            }
          />
        }
      />
      <Tab
        onClick={() => onTabClick(TAB_SWAP)}
        value={TAB_SWAP}
        disableRipple
        className={classes.tab}
        icon={
          <SwapIcon
            fill={
              tab === TAB_SWAP
                ? theme.custom.colors.brandColor
                : theme.custom.colors.secondary
            }
          />
        }
      />
      <Tab
        onClick={() => onTabClick(TAB_NFTS)}
        value={TAB_NFTS}
        disableRipple
        className={classes.tab}
        icon={
          <ImageIcon
            fill={
              tab === TAB_NFTS
                ? theme.custom.colors.brandColor
                : theme.custom.colors.secondary
            }
          />
        }
      />
    </Tabs>
  );
}
