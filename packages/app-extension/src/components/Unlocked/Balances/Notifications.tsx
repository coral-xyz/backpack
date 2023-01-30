import { Suspense, useState } from "react";
import type { EnrichedNotification, Friendship } from "@coral-xyz/common";
import { sendFriendRequest, unFriend } from "@coral-xyz/common";
import { updateFriendshipIfExists } from "@coral-xyz/db";
import {
  DangerButton,
  EmptyState,
  isFirstLastListItemStyle,
  Loading,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
  SuccessButton,
  useUserMetadata,
} from "@coral-xyz/react-common";
import {
  friendship,
  useFriendship,
  useRecentNotifications,
  useUser,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Button, IconButton, List, ListItem, Typography } from "@mui/material";
import { useRecoilState } from "recoil";

import { CloseButton, WithDrawer } from "../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../common/Layout/NavStack";

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
  recentActivityListItemIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "22px",
    marginRight: "12px",
    color: theme.custom.colors.positive,
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
  txBody: {
    color: theme.custom.colors.smallTextColor,
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "24px",
  },
  time: {
    color: theme.custom.colors.smallTextColor,
    fontSize: "14px",
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
        <NotificationsIcon className={classes.networkSettingsIcon} />
      </IconButton>
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            initialRoute={{ name: "root" }}
            options={() => ({ title: "Notifications" })}
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

const formatDate = (date: Date) => {
  const months = [
    "Jan",
    "Feb",
    "March",
    "April",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  const mm = months[date.getMonth()];
  const dd = date.getDate();
  const yyyy = date.getFullYear();
  return `${dd} ${mm} ${yyyy}`;
};

const getGroupedNotifications = (notifications: EnrichedNotification[]) => {
  const groupedNotifications: {
    date: string;
    notifications: EnrichedNotification[];
  }[] = [];

  const sortedNotifications = notifications
    .slice()
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  for (let i = 0; i < sortedNotifications.length; i++) {
    const date = formatDate(new Date(sortedNotifications[i].timestamp));
    if (
      groupedNotifications.length === 0 ||
      groupedNotifications[groupedNotifications.length - 1].date !== date
    ) {
      groupedNotifications.push({
        date,
        notifications: [sortedNotifications[i]],
      });
    } else {
      groupedNotifications[groupedNotifications.length - 1].notifications.push(
        sortedNotifications[i]
      );
    }
  }
  return groupedNotifications;
};

export function Notifications() {
  const notifications: EnrichedNotification[] = useRecentNotifications({
    limit: 50,
    offset: 0,
  });

  const groupedNotifications: {
    date: string;
    notifications: EnrichedNotification[];
  }[] = getGroupedNotifications(notifications);
  return (
    <Suspense fallback={<NotificationsLoader />}>
      <NotificationList groupedNotifications={groupedNotifications} />
    </Suspense>
  );
}

export function RecentActivityList({
  groupedNotifications,
}: {
  groupedNotifications: {
    date: string;
    notifications: EnrichedNotification[];
  }[];
}) {
  return (
    <Suspense fallback={<NotificationsLoader />}>
      <NotificationList groupedNotifications={groupedNotifications} />
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
  groupedNotifications,
}: {
  groupedNotifications: {
    date: string;
    notifications: EnrichedNotification[];
  }[];
}) {
  const theme = useCustomTheme();

  return groupedNotifications.length > 0 ? (
    <div
      style={{
        paddingBottom: "16px",
      }}
    >
      {groupedNotifications.map(({ date, notifications }) => (
        <div
          style={{
            marginLeft: "16px",
            marginRight: "16px",
            marginTop: "16px",
          }}
        >
          <div style={{ color: "#99A4B4", padding: 10 }}>{date}</div>
          <List
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              borderRadius: "14px",
              border: `${theme.custom.colors.borderFull}`,
            }}
          >
            <div>
              {notifications.map((notification: any, idx: number) => (
                <NotificationListItem
                  key={idx}
                  notification={notification}
                  isFirst={idx === 0}
                  isLast={idx === notifications.length - 1}
                />
              ))}
            </div>
          </List>
        </div>
      ))}
    </div>
  ) : (
    <NoNotificationsLabel minimize={false} />
  );
}

const getTimeStr = (timestamp: number) => {
  const elapsedTimeSeconds = (new Date().getTime() - timestamp) / 1000;
  if (elapsedTimeSeconds < 60) {
    return "now";
  }
  if (elapsedTimeSeconds / 60 < 60) {
    const min = Math.floor(elapsedTimeSeconds / 60);
    if (min === 1) {
      return "1 minute ago";
    } else {
      return `${min} minutes ago`;
    }
  }

  if (elapsedTimeSeconds / 3600 < 24) {
    const hours = Math.floor(elapsedTimeSeconds / 3600);
    if (hours === 1) {
      return "1 hour ago";
    } else {
      return `${hours} hours ago`;
    }
  }
  const days = Math.floor(elapsedTimeSeconds / 3600 / 24);
  if (days === 1) {
    return `1 day ago`;
  }
  return `${days} day ago`;
};

function NotificationListItem({
  notification,
  isFirst,
  isLast,
}: {
  notification: EnrichedNotification;
  isFirst: boolean;
  isLast: boolean;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();

  if (notification.xnft_id === "friend_requests") {
    return (
      <FriendRequestListItem
        notification={notification}
        isFirst={isFirst}
        isLast={isLast}
      />
    );
  }

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
            <NotificationListItemIcon image={notification.xnftImage} />
          </div>
          <div>
            <Typography className={classes.txSig}>
              {notification.xnftTitle}
            </Typography>
            <Typography className={classes.txBody}>
              {notification.body}
            </Typography>
          </div>
        </div>
        <div className={classes.time}>{getTimeStr(notification.timestamp)}</div>
      </div>
    </ListItem>
  );
}

function parseJson(body: string) {
  try {
    return JSON.parse(body);
  } catch (ex) {
    return {};
  }
}

function FriendRequestListItem({
  notification,
  isFirst,
  isLast,
}: {
  notification: EnrichedNotification;
  isFirst: boolean;
  isLast: boolean;
}) {
  const user = useUserMetadata({
    remoteUserId: parseJson(notification.body).from,
  });
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
            <NotificationListItemIcon image={user?.image} />
          </div>
          <div>
            <Typography className={classes.txSig}>Friend request</Typography>
            <Typography className={classes.txBody}>
              {user.username} requested to connect
            </Typography>
          </div>
        </div>
        <div className={classes.time}>
          <AcceptRejectRequest userId={parseJson(notification.body).from} />
        </div>
      </div>
    </ListItem>
  );
}

function AcceptRejectRequest({ userId }: { userId: string }) {
  const [friendshipValue, setFriendshipValue] =
    useRecoilState<Friendship | null>(friendship({ userId }));
  const { uuid } = useUser();

  if (friendshipValue?.areFriends) {
    return (
      <div style={{ marginTop: 5 }}>
        {" "}
        <DangerButton
          style={{ height: 38 }}
          label={"Unfriend"}
          onClick={async () => {
            await unFriend({ to: userId });
            await updateFriendshipIfExists(uuid, userId, {
              areFriends: 0,
              requested: 0,
            });

            setFriendshipValue((x: any) => ({
              ...x,
              requested: false,
              areFriends: false,
            }));
          }}
        />{" "}
      </div>
    );
  }

  if (friendshipValue?.remoteRequested) {
    return (
      <div style={{ display: "flex", marginTop: 5 }}>
        <SuccessButton
          label={"Accept"}
          style={{ marginRight: 10, height: 38 }}
          onClick={async () => {
            await sendFriendRequest({ to: userId, sendRequest: true });
            await updateFriendshipIfExists(uuid, userId, {
              requested: 0,
              areFriends: 1,
            });

            setFriendshipValue((x: any) => ({
              ...x,
              requested: false,
              areFriends: true,
            }));
          }}
        />
      </div>
    );
  }

  if (friendshipValue?.requested) {
    return (
      <div style={{ display: "flex", marginTop: 5 }}>
        <DangerButton
          style={{ height: 38 }}
          label={"Cancel request"}
          onClick={async () => {
            await sendFriendRequest({ to: userId, sendRequest: false });
            await updateFriendshipIfExists(uuid, userId, {
              requested: 0,
            });
            setFriendshipValue((x: any) => ({
              ...x,
              requested: false,
            }));
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", marginTop: 5 }}>
      <SuccessButton
        onClick={async () => {
          await sendFriendRequest({ to: userId, sendRequest: true });
          await updateFriendshipIfExists(uuid, userId, {
            requested: 1,
          });
          setFriendshipValue((x: any) => ({
            ...x,
            requested: true,
          }));
        }}
        style={{ height: 38 }}
        label={"Send request"}
      />
    </div>
  );
}

function NotificationListItemIcon({ image }: any) {
  const classes = useStyles();
  return (
    <ProxyImage src={image} className={classes.recentActivityListItemIcon} />
  );
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
        icon={(props: any) => <NotificationsIcon {...props} />}
        title={"No Notifications"}
        subtitle={"You don't have any notifications yet."}
        buttonText={"Browse the xNFT Library"}
        onClick={() => window.open("https://xnft.gg")}
        innerStyle={{
          marginBottom: minimize !== true ? "64px" : 0, // Tab height offset.
        }}
        contentStyle={{
          color: minimize ? theme.custom.colors.secondary : "inherit",
        }}
        minimize={minimize}
      />
    </div>
  );
}
