import { useLocation } from "react-router-dom";
import {
  BACKPACK_FEATURE_XNFT,
  TAB_APPS,
  TAB_BALANCES,
  TAB_MESSAGES,
  TAB_NFTS,
  TAB_NOTIFICATIONS,
  TAB_RECENT_ACTIVITY,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import { useUnreadGlobal } from "@coral-xyz/db";
import {
  BalancesIcon,
  GridIcon,
  ImageIcon,
  MessageBubbleIcon,
  useBreakpoints,
} from "@coral-xyz/react-common";
import {
  useAuthenticatedUser,
  useBackgroundClient,
  useTab,
} from "@coral-xyz/recoil";
import { styles as makeStyles, useCustomTheme } from "@coral-xyz/themes";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { Tab, Tabs } from "@mui/material";
import Badge from "@mui/material/Badge";

import { AvatarPopoverButton } from "../../Unlocked/Settings/AvatarPopover";
import { NotificationIconWithBadge } from "../NotificationIconWithBadge";

const TAB_HEIGHT = 64;

const useStyles = makeStyles((theme) => ({
  tabXs: {
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
    height: `${TAB_HEIGHT}px`,
    minHeight: `${TAB_HEIGHT}px`,
    backgroundColor: theme.custom.colors.nav,
    borderTop: `${theme.custom.colors.borderFull}`,
    boxShadow: theme.custom.colors.tabBarBoxShadow,
  },
  tabIndicator: {
    color: "none",
  },
  activeTab: {},
}));

export function WithTabs(props: any) {
  const location = useLocation();
  const { isXs } = useBreakpoints();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isXs ? "column" : "row-reverse",
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {props.children}
      </div>
      {!location.pathname.startsWith("/xnft/") &&
      location.pathname !== "/nfts/experience" &&
      location.pathname !== "/nfts/chat" &&
      (!isXs || location.pathname !== "/messages/chat") &&
      (!isXs || location.pathname !== "/messages/groupchat") &&
      (!isXs || location.pathname !== "/messages/profile") ? (
        <TabBar />
      ) : null}
    </div>
  );
}

function TabBar() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const tab = useTab();
  const background = useBackgroundClient();
  const { isXs } = useBreakpoints();

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

  return tab === "" ? null : (
    <Tabs
      orientation={isXs ? "horizontal" : "vertical"}
      value={tab}
      variant="fullWidth"
      classes={{
        root: isXs ? classes.tabRootXs : classes.tabRoot,
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
            onClick={() => onTabClick(TAB_BALANCES)}
            value={TAB_BALANCES}
            disableRipple
            className={`${isXs ? classes.tabXs : classes.tab} ${
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
          {BACKPACK_FEATURE_XNFT ? (
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
          ) : null}
          <Tab
            onClick={() => onTabClick(TAB_NFTS)}
            value={TAB_NFTS}
            disableRipple
            className={`${isXs ? classes.tabXs : classes.tab} ${
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
            onClick={() => onTabClick(TAB_MESSAGES)}
            value={TAB_MESSAGES}
            disableRipple
            className={`${isXs ? classes.tabXs : classes.tab} ${
              tab === TAB_MESSAGES ? classes.activeTab : ""
            }`}
            icon={<LocalMessageIcon />}
          />
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
                  tab === TAB_MESSAGES ? classes.activeTab : ""
                }`}
                icon={
                  <FormatListBulletedIcon
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
