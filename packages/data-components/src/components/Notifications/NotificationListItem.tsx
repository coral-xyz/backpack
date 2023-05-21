import { useCallback } from "react";
import { useUserMetadata } from "@coral-xyz/chat-xplat";
import { proxyImageUrl } from "@coral-xyz/common";
import {
  Avatar,
  ListItemCore,
  Skeleton,
  StyledText,
  useCustomTheme,
  XStack,
} from "@coral-xyz/tamagui";

import type { Notification } from "../../apollo/graphql";

import { getTimeStr } from "./utils";

export type NotificationListItemProps = {
  first?: boolean;
  last?: boolean;
  notification: Notification;
  onClick?: (n: Notification) => void;
};

export function NotificationListItem({
  first,
  last,
  notification,
  onClick,
}: NotificationListItemProps) {
  if (
    notification.source === "friend_requests" ||
    notification.source === "friend_requests_accept"
  ) {
    return (
      <NotificationFriendRequestItem
        first={first}
        last={last}
        notification={notification}
        onClick={onClick}
      />
    );
  } else if (notification.app) {
    return (
      <NotificationApplicationItem
        first={first}
        last={last}
        notification={notification}
        onClick={onClick}
      />
    );
  }
  return null;
}

export type NotificationListItemIconProps = {
  image: string;
};

function NotificationListItemIcon({ image }: NotificationListItemIconProps) {
  const proxySrc = proxyImageUrl(image);
  return (
    <Avatar circular size={44}>
      <Avatar.Image src={proxySrc} />
      <Avatar.Fallback delayMs={250}>
        <Skeleton height={44} width={44} radius={22} />
      </Avatar.Fallback>
    </Avatar>
  );
}

function NotificationApplicationItem({
  first,
  last,
  notification,
  onClick,
}: NotificationListItemProps) {
  const theme = useCustomTheme();
  const handleClick = useCallback(
    () => (onClick ? onClick(notification) : {}),
    [notification, onClick]
  );

  return (
    <ListItemCore
      style={{
        backgroundColor: notification.viewed
          ? theme.custom.colors.nav
          : theme.custom.colors.unreadBackground,
      }}
      first={first}
      last={last}
      icon={<NotificationListItemIcon image={notification.app!.image} />}
      onClick={handleClick}
      title={
        <XStack display="flex" alignItems="center">
          <StyledText flex={1}>{notification.app!.name}</StyledText>
          <StyledText color={theme.custom.colors.smallTextColor} fontSize={14}>
            {getTimeStr(notification.timestamp)}
          </StyledText>
        </XStack>
      }
    />
  );
}

function NotificationFriendRequestItem({
  first,
  last,
  notification,
  onClick,
}: NotificationListItemProps) {
  const theme = useCustomTheme();
  const user = useUserMetadata({
    remoteUserId: (notification.body as Record<string, any>).from,
  });

  const handleClick = useCallback(
    () => (onClick ? onClick(notification) : {}),
    [notification, onClick]
  );

  return (
    <ListItemCore
      style={{
        backgroundColor: notification.viewed
          ? theme.custom.colors.nav
          : theme.custom.colors.unreadBackground,
        cursor: "pointer",
      }}
      first={first}
      last={last}
      icon={<NotificationListItemIcon image={user?.image} />}
      onClick={handleClick}
      title={
        <XStack display="flex" alignItems="center">
          <StyledText flex={1}>
            {notification.title.replace("Accepted", "accepted")}
          </StyledText>
          <StyledText color={theme.custom.colors.smallTextColor} fontSize={14}>
            {getTimeStr(notification.timestamp)}
          </StyledText>
        </XStack>
      }
      subtitle={
        <StyledText color={theme.custom.colors.smallTextColor} fontSize={14}>
          @{user.username}
        </StyledText>
      }
    />
  );
}
