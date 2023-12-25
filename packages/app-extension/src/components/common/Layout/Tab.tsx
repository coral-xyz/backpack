import { useLocation } from "react-router-dom";
import {
  TAB_APPS,
  TAB_BALANCES,
  TAB_NFTS,
  TAB_RECENT_ACTIVITY,
  TAB_SWAP,
  TAB_TOKENS,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  BalancesIcon,
  GridIcon,
  ImageIcon,
  SwapIcon,
  useBreakpoints,
} from "@coral-xyz/react-common";
import { useBackgroundClient, useNavigation, useTab } from "@coral-xyz/recoil";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
} from "@coral-xyz/tamagui";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import { Button, Tab, Tabs, Typography } from "@mui/material";

import { Scrollbar } from "../../../components/common/Layout/Scrollbar";
import { AvatarPopoverButton } from "../../Unlocked/Settings/AvatarPopover";

const TAB_HEIGHT = 64;
const NEW_TAB_HEIGHT = 30;

const useStyles = temporarilyMakeStylesForBrowserExtension((theme) => ({
  tabXs: {
    textTransform: "none",
    padding: 0,
    opacity: "1 !important",
    height: `${NEW_TAB_HEIGHT}px`,
    minHeight: `${NEW_TAB_HEIGHT}px`,
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
    borderTop: theme.custom?.colors.borderFull,
    boxShadow: theme.custom?.colors.tabBarBoxShadow,
  },
  tabIndicator: {},
  activeTab: {},
}));

export function WithTabs(props: {
  noScrollbars?: boolean;
  children: JSX.Element;
}) {
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
          display: "flex",
          flex: 1,
        }}
      >
        {props.noScrollbars ? (
          props.children
        ) : (
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
          >
            <Scrollbar>{props.children}</Scrollbar>
          </div>
        )}
      </div>
    </div>
  );
}

function TabBarXs() {
  const background = useBackgroundClient();
  const tab = useTab();
  const theme = useTheme();
  const { t } = useTranslation();

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

  if (tab === TAB_SWAP || tab === TAB_APPS) {
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
            tab === TAB_TOKENS ? theme.accentBlueBackground.val : undefined,
          borderRadius: "10px",
        }}
        onClick={() => onTabClick(TAB_TOKENS)}
        sx={{
          color:
            tab === TAB_TOKENS
              ? theme.accentBlue.val
              : theme.baseTextMedEmphasis.val,
          "&:hover": {
            color: `${theme.accentBlue.val}!important`,
          },
        }}
      >
        <Typography
          style={{
            fontSize: "14px",
            color: "inherit",
          }}
        >
          {t("tokens")}
        </Typography>
      </Button>
      <Button
        disableRipple
        style={{
          textTransform: "none",
          backgroundColor:
            tab === TAB_NFTS ? theme.accentBlueBackground.val : undefined,
          borderRadius: "10px",
          marginLeft: "10px",
          marginRight: "10px",
        }}
        onClick={() => onTabClick(TAB_NFTS)}
        sx={{
          color:
            tab === TAB_NFTS
              ? theme.accentBlue.val
              : theme.baseTextMedEmphasis.val,
          "&:hover": {
            color: `${theme.accentBlue.val}!important`,
          },
        }}
      >
        <Typography
          style={{
            fontSize: "14px",
          }}
        >
          {t("collectibles")}
        </Typography>
      </Button>
      <Button
        disableRipple
        style={{
          textTransform: "none",
          backgroundColor:
            tab === TAB_RECENT_ACTIVITY
              ? theme.accentBlueBackground.val
              : undefined,
          borderRadius: "10px",
        }}
        onClick={() => onTabClick(TAB_RECENT_ACTIVITY)}
        sx={{
          color:
            tab === TAB_RECENT_ACTIVITY
              ? theme.accentBlue.val
              : theme.baseTextMedEmphasis.val,
          "&:hover": {
            color: `${theme.accentBlue.val}!important`,
          },
        }}
      >
        <Typography
          style={{
            fontSize: "14px",
          }}
        >
          {t("activity")}
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
  const theme = useTheme();
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
                    ? theme.accentBlue.val
                    : theme.baseIcon.val
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
                  tab === TAB_NFTS ? theme.accentBlue.val : theme.baseIcon.val
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
                  tab === TAB_SWAP ? theme.accentBlue.val : theme.baseIcon.val
                }
              />
            }
          />
          {!isXs ? (
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
                        ? theme.accentBlue.val
                        : theme.baseIcon.val,
                  }}
                />
              }
            />
          ) : null}
          <Tab
            onClick={() => onTabClick(TAB_APPS)}
            value={TAB_APPS}
            disableRipple
            className={isXs ? classes.tabXs : classes.tab}
            icon={
              <GridIcon
                fill={
                  tab === TAB_APPS ? theme.accentBlue.val : theme.baseIcon.val
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
  const theme = useTheme();
  const tab = useTab();
  const background = useBackgroundClient();

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
                    ? theme.accentBlue.val
                    : theme.baseIcon.val
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
                  tab === TAB_SWAP ? theme.accentBlue.val : theme.baseIcon.val
                }
              />
            }
          />
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
                  tab === TAB_APPS ? theme.accentBlue.val : theme.baseIcon.val
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
