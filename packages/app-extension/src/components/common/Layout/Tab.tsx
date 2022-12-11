import { useLocation } from "react-router-dom";
import {
  BACKPACK_FEATURE_XNFT,
  MESSAGES_ENABLED,
  TAB_APPS,
  TAB_BALANCES,
  TAB_MESSAGES,
  TAB_NFTS,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useFeatureGates,
  useTab,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { Tab, Tabs } from "@mui/material";

import {
  BalancesIcon,
  GridIcon,
  ImageIcon,
  MessageIcon,
} from "../../common/Icon";

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
    "&:hover": {
      "& svg": {
        "& path": {
          fill: `${theme.custom.colors.brandColor} !important`,
        },
      },
    },
  },
  tabRoot: {
    height: `${TAB_HEIGHT}px`,
    minHeight: `${TAB_HEIGHT}px`,
    backgroundColor: theme.custom.colors.nav,
    borderTop: `${theme.custom.colors.borderFull}`,
    boxShadow: theme.custom.colors.tabBarBoxShadow,
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
  },
  activeTab: {},
}));

export function WithTabs(props: any) {
  const classes = useStyles();
  const location = useLocation();

  return (
    <div className={classes.container}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {props.children}
      </div>
      {location.pathname !== "/nfts/experience" &&
        location.pathname !== "/nfts/chat" &&
        location.pathname !== "/messages/chat" &&
        location.pathname !== "/messages/profile" && <TabBar />}
    </div>
  );
}

function TabBar() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const tab = useTab();
  const background = useBackgroundClient();
  const featureGates = useFeatureGates();

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
        className={`${classes.tab} ${
          tab === TAB_BALANCES ? classes.activeTab : ""
        }`}
        icon={
          <BalancesIcon
            fill={
              tab === TAB_BALANCES
                ? theme.custom.colors.brandColor
                : theme.custom.colors.icon
            }
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        }
      />
      {BACKPACK_FEATURE_XNFT && (
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
                  : theme.custom.colors.icon
              }
              style={{
                width: "20px",
                height: "20px",
              }}
            />
          }
        />
      )}
      <Tab
        onClick={() => onTabClick(TAB_NFTS)}
        value={TAB_NFTS}
        disableRipple
        className={`${classes.tab} ${
          tab === TAB_NFTS ? classes.activeTab : ""
        }`}
        icon={
          <ImageIcon
            fill={
              tab === TAB_NFTS
                ? theme.custom.colors.brandColor
                : theme.custom.colors.icon
            }
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        }
      />
      {featureGates[MESSAGES_ENABLED] && (
        <Tab
          onClick={() => onTabClick(TAB_MESSAGES)}
          value={TAB_MESSAGES}
          disableRipple
          className={`${classes.tab} ${
            tab === TAB_MESSAGES ? classes.activeTab : ""
          }`}
          icon={
            <MessageIcon
              fill={
                tab === TAB_MESSAGES
                  ? theme.custom.colors.brandColor
                  : theme.custom.colors.icon
              }
              style={{
                width: "20px",
                height: "20px",
              }}
            />
          }
        />
      )}
    </Tabs>
  );
}
