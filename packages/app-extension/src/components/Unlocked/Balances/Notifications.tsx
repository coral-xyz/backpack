import { Suspense, useEffect, useState } from "react";
import { Typography, List, ListItem, IconButton } from "@mui/material";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { CallMade, Check, Clear, Bolt } from "@mui/icons-material";
import { Blockchain, BACKEND_API_URL } from "@coral-xyz/common";
import { Loading } from "../../common";
import { WithDrawer, CloseButton } from "../../common/Layout/Drawer";
import { useUsername } from "@coral-xyz/recoil";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";
import { isFirstLastListItemStyle } from "../../common/List";
import { EmptyState } from "../../common/EmptyState";

interface NotificationType {
  title: string;
  body: string;
  xnftId: string;
  timestamp: number;
}

const useStyles = styles((theme) => ({
  recentActivityLabel: {
    color: theme.custom.colors.fontColor,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
  },
  allWalletsLabel: {
    fontWeight: 500,
    fontSize: "12px",
    color: theme.custom.colors.secondary,
  },
  noRecentActivityLabel: {
    fontWeight: 500,
    fontSize: "16px",
    padding: "16px",
    textAlign: "center",
    color: theme.custom.colors.secondary,
  },
  recentActivityListItemIconContainer: {
    width: "44px",
    height: "44px",
    borderRadius: "22px",
    marginRight: "12px",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },
  recentActivityListItemIcon: {
    color: theme.custom.colors.positive,
    marginLeft: "auto",
    marginRight: "auto",
  },
  recentActivityListItemIconNegative: {
    color: theme.custom.colors.negative,
    marginLeft: "auto",
    marginRight: "auto",
  },
  txSig: {
    color: theme.custom.colors.fontColor,
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
  },
  txDate: {
    color: theme.custom.colors.secondary,
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: "24px",
  },
  networkSettingsButtonContainer: {
    display: "flex",
    flexDirection: "row-reverse",
    width: "38px",
  },
  networkSettingsButton: {
    padding: 0,
    width: "24px",
    "&:hover": {
      background: "transparent",
    },
  },
  networkSettingsIcon: {
    color: theme.custom.colors.icon,
    backgroundColor: "transparent",
    borderRadius: "12px",
  },
}));

export function NotificationButton() {
  const classes = useStyles();
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <div className={classes.networkSettingsButtonContainer}>
      <IconButton
        disableRipple
        className={classes.networkSettingsButton}
        onClick={() => setOpenDrawer(true)}
        size="large"
      >
        <Bolt className={classes.networkSettingsIcon} />
      </IconButton>
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "root" }}
            options={(_args) => ({ title: "Xnft Notifications" })}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
          >
            <NavStackScreen
              name={"root"}
              component={(props: any) => <Notifications {...props} />}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </div>
  );
}

const fetchNotifications = (
  username: string,
  offset: number,
  limit: number
): Promise<NotificationType[]> => {
  return new Promise((resolve) => {
    fetch(
      `${BACKEND_API_URL}/notifications?username=${username}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
      }
    )
      .then(async (response) => {
        const json = await response.json();
        resolve(json.notifications || []);
      })
      .catch((e) => resolve([]));
  });
};

export function Notifications() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const username = useUsername();
  const getNotifications = async () => {
    const notifications = await fetchNotifications(username || "", 0, 20);
    setNotifications(notifications);
  };

  useEffect(() => {
    getNotifications();
  }, [username]);

  return (
    <Suspense fallback={<NotificationsLoader />}>
      <NotificationList notifications={notifications} />
    </Suspense>
  );
}

export function RecentActivityList({
  notifications,
}: {
  notifications: NotificationType[];
}) {
  return (
    <Suspense fallback={<NotificationsLoader />}>
      <NotificationList notifications={notifications} />
    </Suspense>
  );
}

function NotificationsLoader() {
  return (
    <div
      style={{
        height: "68px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Loading iconStyle={{ width: "35px", height: "35px" }} />
      </div>
    </div>
  );
}

export function NotificationList({
  notifications,
}: {
  notifications: NotificationType[];
}) {
  const theme = useCustomTheme();

  return notifications.length > 0 ? (
    <div
      style={{
        paddingBottom: "16px",
      }}
    >
      <List
        style={{
          marginTop: "16px",
          paddingTop: 0,
          paddingBottom: 0,
          marginLeft: "16px",
          marginRight: "16px",
          borderRadius: "14px",
          border: `${theme.custom.colors.borderFull}`,
        }}
      >
        {notifications.map((notification: any, idx: number) => (
          <NotificationListItem
            key={idx}
            notification={notification}
            isFirst={idx === 0}
            isLast={idx === notifications.length - 1}
          />
        ))}
      </List>
    </div>
  ) : (
    <NoNotificationsLabel minimize={false} />
  );
}

function NotificationListItem({ notification, isFirst, isLast }: any) {
  const classes = useStyles();
  const theme = useCustomTheme();

  return (
    <ListItem
      button
      disableRipple
      onClick={() => {}}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        height: "68px",
        backgroundColor: theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 12),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1, display: "flex" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <NotificationListItemIcon xnftId={notification.xnftId} />
          </div>
          <div>
            <Typography className={classes.txSig}>
              <img
                style={{
                  width: "12px",
                  borderRadius: "2px",
                  marginRight: "10px",
                }}
                src={``}
              />
              {notification.title}
              {notification.body}
            </Typography>
            <Typography className={classes.txDate}>
              {notification.timestamp.toLocaleDateString()}
            </Typography>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <CallMade style={{ color: theme.custom.colors.icon }} />
        </div>
      </div>
    </ListItem>
  );
}

function NotificationListItemIcon({ xnftId }: any) {
  const classes = useStyles();
  return <Check className={classes.recentActivityListItemIcon} />;
}

function NoNotificationsLabel({ minimize }: { minimize: boolean }) {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        height: "100%",
        display: minimize ? "none" : undefined,
      }}
    >
      <EmptyState
        icon={(props: any) => <Bolt {...props} />}
        title={"No Notifications"}
        subtitle={"Install xnfts to receive notifications"}
        buttonText={"Browse the xNFT Library"}
        onClick={() => window.open("https://xnft.gg")}
        contentStyle={{
          marginBottom: minimize !== true ? "64px" : 0, // Tab height offset.
          color: minimize ? theme.custom.colors.secondary : "inherit",
        }}
        minimize={minimize}
      />
    </div>
  );
}
