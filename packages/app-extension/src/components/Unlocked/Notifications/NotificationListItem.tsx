// TODO: remove the line below
/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import { useUserMetadata } from "@coral-xyz/chat-xplat";
import { sendFriendRequest } from "@coral-xyz/common";
import { updateFriendshipIfExists } from "@coral-xyz/db";
import {
  isFirstLastListItemStyle,
  ProxyImage,
  useBreakpoints,
  UserAction,
} from "@coral-xyz/react-common";
import {
  useFriendship,
  useUpdateFriendships,
  useUser,
} from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";

import type { Notification } from "../../../graphql/graphql";
import { useNavigation } from "../../common/Layout/NavStack";

import { getTimeStr } from "./utils";

const useStyles = styles((theme) => ({
  recentActivityListItemIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "22px",
    marginRight: "12px",
    color: theme.custom.colors.positive,
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
}));

export function NotificationListItem({
  notification,
  isFirst,
  isLast,
  onOpenDrawer,
}: {
  notification: Notification;
  isFirst: boolean;
  isLast: boolean;
  onOpenDrawer?: () => void;
}) {
  const classes = useStyles();
  const theme = useCustomTheme();

  if (
    notification.source === "friend_requests" ||
    notification.source === "friend_requests_accept"
  ) {
    return (
      <FriendRequestListItem
        title={notification.title.replace("Accepted", "accepted")}
        notification={notification}
        isFirst={isFirst}
        isLast={isLast}
        onOpenDrawer={onOpenDrawer}
      />
    );
  }

  return (
    <ListItem
      button
      disableRipple
      onClick={() => {}}
      style={{
        margin: 0,
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        height: "68px",
        backgroundColor: !notification.viewed
          ? theme.custom.colors.unreadBackground
          : theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 10),
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
            {/* FIXME: <NotificationListItemIcon image={notification.xnftImage} /> */}
          </div>
          <div>
            {/* FIXME: <Typography className={classes.txSig}>
              {notification.xnftTitle}
            </Typography> */}
            <Typography className={classes.txBody}>
              {notification.body.data}
            </Typography>
          </div>
        </div>
        <div>
          <div className={classes.time}>
            {getTimeStr(notification.timestamp)}
          </div>
        </div>
      </div>
    </ListItem>
  );
}

function NotificationListItemIcon({ image }: any) {
  const classes = useStyles();
  return (
    <ProxyImage
      size={44}
      loadingStyles={{ marginRight: "12px", height: "44px", width: "44px" }}
      src={image}
      className={classes.recentActivityListItemIcon}
    />
  );
}

function FriendRequestListItem({
  notification,
  isFirst,
  isLast,
  onOpenDrawer,
  title,
}: {
  notification: Notification;
  isFirst: boolean;
  isLast: boolean;
  onOpenDrawer?: () => void;
  title: string;
}) {
  const { isXs } = useBreakpoints();
  const nav = isXs ? useNavigation() : undefined;
  const user = useUserMetadata({
    remoteUserId: (notification.body as Record<string, any>).from,
  });
  const classes = useStyles();
  const theme = useCustomTheme();

  return (
    <ListItem
      button
      disableRipple
      onClick={() => (isXs ? nav!.push("contacts") : onOpenDrawer!())}
      style={{
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "10px",
        paddingBottom: "10px",
        display: "flex",
        backgroundColor: !notification.viewed
          ? theme.custom.colors.unreadBackground
          : theme.custom.colors.nav,
        borderBottom: isLast
          ? undefined
          : `solid 1pt ${theme.custom.colors.border1}`,
        ...isFirstLastListItemStyle(isFirst, isLast, 10),
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "flex-start" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <NotificationListItemIcon image={user?.image} />
          </div>
          <div style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div>
                <Typography className={classes.txSig}>{title}</Typography>
              </div>
              <div className={classes.time}>
                {getTimeStr(notification.timestamp)}
              </div>
            </div>
            <Typography className={classes.txBody}>@{user.username}</Typography>
            <AcceptRejectRequest
              userId={(notification.body as Record<string, any>).from}
            />
          </div>
        </div>
      </div>
    </ListItem>
  );
}

function AcceptRejectRequest({ userId }: { userId: string }) {
  const friendshipValue = useFriendship({ userId });
  const { uuid } = useUser();
  const setFriendshipValue = useUpdateFriendships();
  const theme = useCustomTheme();
  const [, setInProgress] = useState(false);

  if (friendshipValue?.remoteRequested && !friendshipValue?.areFriends) {
    return (
      <div style={{ display: "flex", marginTop: 5 }}>
        <UserAction
          style={{ color: theme.custom.colors.blue, marginRight: 10 }}
          text="Accept"
          onClick={async (e: any) => {
            e.stopPropagation();
            setInProgress(true);
            await sendFriendRequest({ to: userId, sendRequest: true });
            await updateFriendshipIfExists(uuid, userId, {
              requested: 0,
              areFriends: 1,
            });
            await setFriendshipValue({
              userId: userId,
              friendshipValue: {
                requested: false,
                areFriends: true,
                remoteRequested: false,
              },
            });
            setInProgress(false);
          }}
        />
        <UserAction
          text="Decline"
          onClick={async (e: any) => {
            e.stopPropagation();
            setInProgress(true);
            await sendFriendRequest({ to: userId, sendRequest: false });
            await updateFriendshipIfExists(uuid, userId, {
              requested: 0,
              areFriends: 0,
              remoteRequested: 0,
            });
            await setFriendshipValue({
              userId: userId,
              friendshipValue: {
                requested: false,
                areFriends: false,
                remoteRequested: false,
              },
            });
            setInProgress(false);
          }}
        />
      </div>
    );
  }
  return <div />;
}
