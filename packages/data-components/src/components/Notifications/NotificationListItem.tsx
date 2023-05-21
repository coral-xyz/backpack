import { useUserMetadata } from "@coral-xyz/chat-xplat";
import {
  ListItemCore,
  ProxyImage,
  StyledText,
  useCustomTheme,
  XStack,
} from "@coral-xyz/tamagui";

import type { Notification } from "../../apollo/graphql";

import { getTimeStr } from "./utils";

export type NotificationListItemProps = {
  isFirst?: boolean;
  isLast?: boolean;
  notification: Notification;
  onClick?: () => void;
};

export function NotificationListItem({
  isFirst,
  isLast,
  notification,
}: NotificationListItemProps) {
  if (
    notification.source === "friend_requests" ||
    notification.source === "friend_requests_accept"
  ) {
    return (
      <FriendRequestNotificationItem
        isFirst={isFirst}
        isLast={isLast}
        notification={notification}
      />
    );
  }
  return null;
}

export type NotificationListItemIconProps = {
  image: string;
};

function NotificationListItemIcon({ image }: NotificationListItemIconProps) {
  return (
    <ProxyImage
      style={{ width: 44, height: 44, borderRadius: 22 }}
      src={image}
    />
  );
}

function FriendRequestNotificationItem({
  isFirst,
  isLast,
  notification,
}: NotificationListItemProps) {
  const theme = useCustomTheme();
  const user = useUserMetadata({
    remoteUserId: (notification.body as Record<string, any>).from,
  });

  return (
    <ListItemCore
      style={{
        backgroundColor: notification.viewed
          ? theme.custom.colors.nav
          : theme.custom.colors.unreadBackground,
      }}
      first={isFirst}
      last={isLast}
      icon={<NotificationListItemIcon image={user?.image} />}
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
