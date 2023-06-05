import { useCallback } from "react";
import { useUserMetadata } from "@coral-xyz/chat-xplat";
import { formatSemanticTimeDifference } from "@coral-xyz/common";
import {
  ListItemCore,
  ListItemIconCore,
  StyledText,
  useCustomTheme,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import type { ResponseNotification } from ".";
import { NotificationListItemFriendRequestAction } from "./NotificationListItemActions";

export type NotificationListItemProps = {
  notification: ResponseNotification;
  onAcceptFriendRequest?: (
    activeUserId: string,
    otherUserId: string
  ) => void | Promise<void>;
  onClick?: (n: ResponseNotification) => void;
  onDeclineFriendRequest?: (
    activeUserId: string,
    otherUserId: string
  ) => void | Promise<void>;
};

export function NotificationListItem({
  notification,
  onAcceptFriendRequest,
  onClick,
  onDeclineFriendRequest,
}: NotificationListItemProps) {
  if (
    notification.source === "friend_requests" ||
    notification.source === "friend_requests_accept"
  ) {
    return (
      <NotificationListItemFriendRequest
        notification={notification}
        onClick={onClick}
        onAcceptFriendRequest={onAcceptFriendRequest}
        onDeclineFriendRequest={onDeclineFriendRequest}
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
}: Pick<NotificationListItemProps, "notification" | "onClick">) {
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
        hoverTheme: true,
      }}
      icon={<ListItemIconCore image={notification.app!.image} size={44} />}
      onClick={handleClick}
    >
      <XStack
        flex={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <StyledText color="$fontColor" fontSize="$base">
          {notification.app!.name}
        </StyledText>
        <StyledText color="$secondary" fontSize="$sm">
          {formatSemanticTimeDifference(notification.timestamp)}
        </StyledText>
      </XStack>
    </ListItemCore>
  );
}

function NotificationListItemFriendRequest({
  notification,
  onAcceptFriendRequest,
  onClick,
  onDeclineFriendRequest,
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
        hoverTheme: true,
      }}
      icon={<ListItemIconCore image={user?.image} radius={22} size={44} />}
      onClick={handleClick}
    >
      <YStack flex={1}>
        <XStack
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          marginBottom={4}
        >
          <StyledText color="$fontColor" fontSize="$base">
            {notification.title.replace("Accepted", "accepted")}
          </StyledText>
          <StyledText color="$secondary" fontSize="$sm">
            {formatSemanticTimeDifference(notification.timestamp)}
          </StyledText>
        </XStack>
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
            onAccept={onAcceptFriendRequest}
            onDecline={onDeclineFriendRequest}
            remoteUserId={(notification.body as Record<string, any>).from}
          />
        </YStack>
      </YStack>
    </ListItemCore>
  );
}
