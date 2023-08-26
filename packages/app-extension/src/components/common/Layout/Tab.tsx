import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import {
  TAB_APPS,
  TAB_BALANCES,
  TAB_MESSAGES,
  TAB_NFTS,
  TAB_NOTIFICATIONS,
  TAB_RECENT_ACTIVITY,
  TAB_SWAP,
  TAB_TOKENS,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import { useUnreadGlobal } from "@coral-xyz/db";
import {
  BalancesIcon,
  GridIcon,
  ImageIcon,
  Loading,
  MessageBubbleIcon,
  SwapIcon,
  useBreakpoints,
} from "@coral-xyz/react-common";
import {
  useAuthenticatedUser,
  useBackgroundClient,
  useFeatureGates,
  useNavigation,
  useTab,
} from "@coral-xyz/recoil";
import { styles as makeStyles, useCustomTheme } from "@coral-xyz/themes";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import { Button, Tab, Tabs, Typography } from "@mui/material";
import Badge from "@mui/material/Badge";

import { Scrollbar } from "../../../components/common/Layout/Scrollbar";
import { AvatarPopoverButton } from "../../Unlocked/Settings/AvatarPopover";
import { NotificationIconWithBadge } from "../NotificationIconWithBadge";

const TAB_HEIGHT = 64;
const NEW_TAB_HEIGHT = 30;

const useStyles = makeStyles((theme) => ({
  tabXs: {
    textTransform: "none",
    padding: 0,
    opacity: "1 !important",
    height: `${NEW_TAB_HEIGHT}px`,
    minHeight: `${NEW_TAB_HEIGHT}px`,
    "&:hover": {
      background: "transparent !important",
      "& svg": {
        "& path": {
          fill: `${theme.custom.colors.brandColor} !important`,
        },
      },
    },
  },
  tabBottom: {
    textTransform: "none",
    padding: 0,
    opacity: "1 !important",
    height: `${TAB_HEIGHT}px`,
    "&:hover": {
      background: "transparent !important",
      "& svg": {
        "& path": {
          fill: `${theme.custom.colors.brandColor} !important`,
        },
      },
    },
  },
  tab: {
    opacity: "1 !important",
    minWidth: "74px",
    width: "74px",
    marginTop: "16px",
    "&:hover": {
      background: "transparent !important",
      "& svg": {
        "& path": {
          fill: `${theme.custom.colors.brandColor} !important`,
        },
      },
    },
    "& .MuiTabs-flexContainer": {
      height: "100%",
      width: "100%",
    },
  },
  tabRoot: {
    height: "100%",
    minWidth: "74px",
    width: "74px",
    backgroundColor: theme.custom.colors.nav,
    borderRight: `${theme.custom.colors.borderFull}`,
    "& .MuiTabs-flexContainer": {
      height: "100%",
      width: "100%",
    },
  },
  tabRootXs: {
    height: `${NEW_TAB_HEIGHT}px`,
    minHeight: `${NEW_TAB_HEIGHT}px`,
  },
  tabRootBottom: {
    zIndex: 1,
    height: `${TAB_HEIGHT}px`,
    minHeight: `${TAB_HEIGHT}px`,

    backgroundColor: theme.custom.colors.nav,
    borderTop: `${theme.custom.colors.borderFull}`,
    boxShadow: theme.custom.colors.tabBarBoxShadow,
  },
  tabIndicator: {},
  activeTab: {},
}));

export function WithTabs(props: any) {
  const location = useLocation();
  const { isXs } = useBreakpoints();
  const { isRoot } = useNavigation();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isXs ? "column" : "row",
        height: "100%",
      }}
    >
      {!location.pathname.startsWith("/xnft/") &&
      location.pathname !== "/nfts/experience" &&
      location.pathname !== "/nfts/chat" &&
      ((isXs && isRoot) || !isXs) &&
      (!isXs || location.pathname !== "/messages/chat") &&
      (!isXs || location.pathname !== "/messages/groupchat") &&
      (!isXs || location.pathname !== "/messages/profile") ? (
        <TabBar />
      ) : null}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <Suspense fallback={<Loading />}>
          <Scrollbar>{props.children}</Scrollbar>
        </Suspense>
      </div>
    </div>
  );
}

function TabBarXs() {
  const background = useBackgroundClient();
  const tab = useTab();
  const theme = useCustomTheme();

  const onTabClick = async (tabValue: string) => {
    if (tabValue === tab) {
      await background.request({
        method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
        params: [],
      });
    } else {
      await background.request({
        method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
        params: [tabValue],
      });
    }
  };

  if (tab === TAB_SWAP || tab === TAB_APPS || tab === TAB_MESSAGES) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "8px",
        marginBottom: "8px",
      }}
    >
      <Button
        disableRipple
        style={{
          textTransform: "none",
          backgroundColor:
            tab === TAB_TOKENS ? "rgba(0, 87, 235, 0.15)" : undefined,
          borderRadius: "10px",
        }}
        onClick={() => onTabClick(TAB_TOKENS)}
        sx={{
          color:
            tab === TAB_TOKENS
              ? theme.custom.colors.linkColor
              : theme.custom.colors.secondary,
          "&:hover": {
            backgroundColor:
              tab === TAB_TOKENS
                ? "rgba(0, 87, 235, 0.15) !important"
                : undefined,
            color: `${theme.custom.colors.linkColor}!important`,
          },
        }}
      >
        <Typography
          style={{
            fontSize: "14px",
            color: "inherit",
          }}
        >
          Tokens
        </Typography>
      </Button>
      <Button
        disableRipple
        style={{
          textTransform: "none",
          backgroundColor:
            tab === TAB_NFTS ? "rgba(0, 87, 235, 0.15)" : undefined,
          borderRadius: "10px",
          marginLeft: "10px",
          marginRight: "10px",
        }}
        onClick={() => onTabClick(TAB_NFTS)}
        sx={{
          color:
            tab === TAB_NFTS
              ? theme.custom.colors.linkColor
              : theme.custom.colors.secondary,
          "&:hover": {
            backgroundColor:
              tab === TAB_NFTS
                ? "rgba(0, 87, 235, 0.15) !important"
                : undefined,
            color: "#0057EB!important",
          },
        }}
      >
        <Typography
          style={{
            fontSize: "14px",
          }}
        >
          Collectibles
        </Typography>
      </Button>
      <Button
        disableRipple
        style={{
          textTransform: "none",
          backgroundColor:
            tab === TAB_RECENT_ACTIVITY ? "rgba(0, 87, 235, 0.15)" : undefined,
          borderRadius: "10px",
        }}
        onClick={() => onTabClick(TAB_RECENT_ACTIVITY)}
        sx={{
          color:
            tab === TAB_RECENT_ACTIVITY
              ? theme.custom.colors.linkColor
              : theme.custom.colors.secondary,
          "&:hover": {
            backgroundColor:
              tab === TAB_RECENT_ACTIVITY
                ? "rgba(0, 87, 235, 0.15) !important"
                : undefined,
            color: "#0057EB!important",
          },
        }}
      >
        <Typography
          style={{
            fontSize: "14px",
          }}
        >
          Activity
        </Typography>
      </Button>
    </div>
  );
}

function TabBar() {
  const tab = useTab();
  const { isXs } = useBreakpoints();

  if (isXs) {
    return <TabBarXs />;
  }

  return tab === "" ? null : <TabBarXl />;
}

function TabBarXl() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const tab = useTab();
  const background = useBackgroundClient();
  const { isXs } = useBreakpoints();
  const featureGates = useFeatureGates();

  const onTabClick = async (tabValue: string) => {
    if (tabValue === tab) {
      await background.request({
        method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
        params: [],
      });
    } else {
      await background.request({
        method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
        params: [tabValue],
      });
    }
  };
  return (
    <Tabs
      orientation={isXs ? "horizontal" : "vertical"}
      value={tab}
      variant="fullWidth"
      classes={{
        root: isXs ? classes.tabRootXs : classes.tabRoot,
        indicator: classes.tabIndicator,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isXs ? "row" : "column",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isXs ? "row" : "column",
            width: isXs ? "100%" : undefined,
            justifyContent: isXs ? "space-between" : undefined,
            marginTop: !isXs ? "12px" : undefined,
          }}
        >
          <Tab
            onClick={() => onTabClick(TAB_TOKENS)}
            value={TAB_TOKENS}
            disableRipple
            className={`${classes.tab} ${
              tab === TAB_TOKENS ? classes.activeTab : ""
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
          <Tab
            onClick={() => onTabClick(TAB_SWAP)}
            value={TAB_SWAP}
            disableRipple
            className={`${classes.tab} ${
              tab === TAB_SWAP ? classes.activeTab : ""
            }`}
            icon={
              <SwapIcon
                fill={
                  tab === TAB_SWAP
                    ? theme.custom.colors.brandColor
                    : theme.custom.colors.icon
                }
              />
            }
          />
          {featureGates["MESSAGING_ENABLED"] ? (
            <Tab
              onClick={() => onTabClick(TAB_MESSAGES)}
              value={TAB_MESSAGES}
              disableRipple
              className={`${isXs ? classes.tabXs : classes.tab} ${
                tab === TAB_MESSAGES ? classes.activeTab : ""
              }`}
              icon={<LocalMessageIcon />}
            />
          ) : null}
          {!isXs ? (
            <>
              <Tab
                onClick={() => onTabClick(TAB_NOTIFICATIONS)}
                value={TAB_NOTIFICATIONS}
                disableRipple
                className={`${isXs ? classes.tabXs : classes.tab} ${
                  tab === TAB_MESSAGES ? classes.activeTab : ""
                }`}
                icon={
                  <NotificationIconWithBadge
                    style={{
                      width: "28px",
                      height: "28px",
                      color:
                        tab === TAB_NOTIFICATIONS
                          ? theme.custom.colors.brandColor
                          : theme.custom.colors.icon,
                    }}
                  />
                }
              />
              <Tab
                onClick={() => onTabClick(TAB_RECENT_ACTIVITY)}
                value={TAB_RECENT_ACTIVITY}
                disableRipple
                className={`${isXs ? classes.tabXs : classes.tab} ${
                  tab === TAB_RECENT_ACTIVITY ? classes.activeTab : ""
                }`}
                icon={
                  <FormatListBulletedRoundedIcon
                    style={{
                      width: "28px",
                      height: "28px",
                      color:
                        tab === TAB_RECENT_ACTIVITY
                          ? theme.custom.colors.brandColor
                          : theme.custom.colors.icon,
                    }}
                  />
                }
              />
            </>
          ) : null}
          <Tab
            onClick={() => onTabClick(TAB_APPS)}
            value={TAB_APPS}
            disableRipple
            className={isXs ? classes.tabXs : classes.tab}
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
        </div>
        {!isXs ? (
          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <AvatarPopoverButton
              imgStyle={{
                width: "38px",
                height: "38px",
                borderRadius: "20px",
              }}
              buttonStyle={{
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
          </div>
        ) : null}
      </div>
    </Tabs>
  );
}

export function WithTabBarBottom(props: any) {
  const location = useLocation();
  const { isXs } = useBreakpoints();
  if (!isXs) {
    return props.children;
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          position: "relative",
        }}
      >
        {props.children}
      </div>
      {(!isXs || location.pathname !== "/messages/chat") &&
      (!isXs || location.pathname !== "/messages/groupchat") &&
      (!isXs || location.pathname !== "/messages/profile") ? (
        <TabBarBottom />
      ) : null}
    </div>
  );
}

function TabBarBottom() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const tab = useTab();
  const background = useBackgroundClient();
  const featureGates = useFeatureGates();

  const onTabClick = async (tabValue: string) => {
    // We hack the balances tab because we've split it up into three.
    let tabAlias =
      tab === TAB_TOKENS || tab === TAB_NFTS || tab === TAB_RECENT_ACTIVITY
        ? TAB_BALANCES
        : tab;
    if (tabValue === tabAlias) {
      await background.request({
        method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
        params: [],
      });
    } else {
      await background.request({
        method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
        params: [tabValue],
      });
    }
  };
  return (
    <Tabs
      orientation="horizontal"
      value={tab}
      variant="fullWidth"
      classes={{
        root: classes.tabRootBottom,
        indicator: classes.tabIndicator,
      }}
      TabIndicatorProps={{
        style: {
          display: "none",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          height: "100%",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            marginTop: undefined,
          }}
        >
          {/* TAB_BALANCES is used as a pointer to one of tokens, nfts, or recent_activity. */}
          <Tab
            onClick={() => onTabClick(TAB_BALANCES)}
            value={TAB_BALANCES}
            disableRipple
            className={`${classes.tabBottom} ${
              tab === TAB_TOKENS ? classes.activeTab : ""
            }`}
            icon={
              <BalancesIcon
                fill={
                  tab === TAB_TOKENS ||
                  tab === TAB_NFTS ||
                  tab === TAB_RECENT_ACTIVITY
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
          <Tab
            onClick={() => onTabClick(TAB_SWAP)}
            value={TAB_SWAP}
            disableRipple
            className={`${classes.tabBottom} ${
              tab === TAB_SWAP ? classes.activeTab : ""
            }`}
            icon={
              <SwapIcon
                fill={
                  tab === TAB_SWAP
                    ? theme.custom.colors.brandColor
                    : theme.custom.colors.icon
                }
              />
            }
          />
          {featureGates["MESSAGING_ENABLED"] ? (
            <Tab
              onClick={() => onTabClick(TAB_MESSAGES)}
              value={TAB_MESSAGES}
              disableRipple
              className={`${classes.tabBottom} ${
                tab === TAB_MESSAGES ? classes.activeTab : ""
              }`}
              icon={<LocalMessageIcon />}
            />
          ) : null}
          <Tab
            onClick={() => onTabClick(TAB_APPS)}
            value={TAB_APPS}
            disableRipple
            className={`${classes.tabBottom} ${
              tab === TAB_APPS ? classes.activeTab : ""
            }`}
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
        </div>
      </div>
    </Tabs>
  );
}

function LocalMessageIcon() {
  const theme = useCustomTheme();
  const tab = useTab();
  const authenticatedUser = useAuthenticatedUser();

  const messagesUnread = useUnreadGlobal(
    authenticatedUser ? authenticatedUser.uuid : null
  );

  return (
    <>
      {!messagesUnread ? (
        <MessageBubbleIcon
          sx={{
            width: "20px",
            height: "20px",
            color:
              tab === TAB_MESSAGES
                ? theme.custom.colors.brandColor
                : theme.custom.colors.icon,
          }}
        />
      ) : (
        <Badge
          sx={{
            "& .MuiBadge-badge": {
              padding: 0,
              fontSize: 12,
              height: 12,
              width: 12,
              minWidth: 12,
              border: "2px solid white",
              borderRadius: "50%",
              backgroundColor: "#E33E3F",
              paddingBottom: "2px",
            },
          }}
          badgeContent={" "}
          color="secondary"
        >
          <MessageBubbleIcon
            sx={{
              width: "20px",
              height: "20px",
              color:
                tab === TAB_MESSAGES
                  ? theme.custom.colors.brandColor
                  : theme.custom.colors.icon,
            }}
          />
        </Badge>
      )}
    </>
  );
}
