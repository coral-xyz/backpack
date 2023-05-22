import { useCallback } from "react";
import { useUserMetadata } from "@coral-xyz/chat-xplat";
import {
  ListItemCore,
  ListItemIconCore,
  StyledText,
  useCustomTheme,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import type { Notification } from "../../apollo/graphql";

import { NotificationListItemFriendRequestAction } from "./NotificationListItemActions";
import { getTimeStr } from "./utils";

export type NotificationListItemProps = {
  notification: Notification;
  onClick?: (n: Notification) => void;
};

export function NotificationListItem({
  notification,
  onClick,
}: NotificationListItemProps) {
  if (
    notification.source === "friend_requests" ||
    notification.source === "friend_requests_accept"
  ) {
    return (
      <NotificationListItemFriendRequest
        notification={notification}
        onClick={onClick}
      />
    );
  } else if (notification.app) {
    return (
      <NotificationListItemApplication
        notification={notification}
        onClick={onClick}
      />
    );
  }
  return null;
}

function NotificationListItemApplication({
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
          ? "$nav"
          : theme.custom.colors.unreadBackground,
      }}
      icon={<ListItemIconCore image={notification.app!.image} size={44} />}
      onClick={handleClick}
      title={
        <XStack
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <StyledText color="$fontColor" fontSize="$base">
            {notification.app!.name}
          </StyledText>
          <StyledText color="$secondary" fontSize="$sm">
            {getTimeStr(notification.timestamp)}
          </StyledText>
        </XStack>
      }
    />
  );
}

function NotificationListItemFriendRequest({
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
          ? "$nav"
          : theme.custom.colors.unreadBackground,
        cursor: "pointer",
      }}
      icon={<ListItemIconCore image={user?.image} size={44} />}
      onClick={handleClick}
      title={
        <XStack
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <StyledText color="$fontColor" fontSize="$base">
            {notification.title.replace("Accepted", "accepted")}
          </StyledText>
          <StyledText color="$secondary" fontSize="$sm">
            {getTimeStr(notification.timestamp)}
          </StyledText>
        </XStack>
      }
      subtitle={
        <YStack>
          <StyledText
            color="$secondary"
            fontSize="$sm"
            maxWidth="90%"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            @{user.username}
          </StyledText>
          <NotificationListItemFriendRequestAction
            userId={(notification.body as Record<string, any>).from}
          />
        </YStack>
      }
    />
  );
}
