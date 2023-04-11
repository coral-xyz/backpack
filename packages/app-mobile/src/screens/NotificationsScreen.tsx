import type {
  EnrichedNotification,
  GroupedNotification,
} from "@coral-xyz/common";

import {
  View,
  Text,
  FlatList,
  SectionList,
  StyleSheet,
  Image,
} from "react-native";

import { NotificationsData } from "@coral-xyz/recoil";
import { useUserMetadata, ListItem } from "@coral-xyz/tamagui";

import { UserAvatar } from "~components/UserAvatar";

function parseJson(body: string) {
  try {
    return JSON.parse(body);
  } catch (ex) {
    return {};
  }
}

const getTimeStr = (timestamp: number) => {
  const elapsedTimeSeconds = (new Date().getTime() - timestamp) / 1000;
  if (elapsedTimeSeconds < 60) {
    return "now";
  }
  if (elapsedTimeSeconds / 60 < 60) {
    const min = Math.floor(elapsedTimeSeconds / 60);
    if (min === 1) {
      return "1 min";
    } else {
      return `${min} mins`;
    }
  }

  if (elapsedTimeSeconds / 3600 < 24) {
    const hours = Math.floor(elapsedTimeSeconds / 3600);
    if (hours === 1) {
      return "1 hour";
    } else {
      return `${hours} hours`;
    }
  }
  const days = Math.floor(elapsedTimeSeconds / 3600 / 24);
  if (days === 1) {
    return `1 day`;
  }
  return `${days} days`;
};

const FriendRequestListItem = ({ notification, title }) => {
  const user = useUserMetadata({
    remoteUserId: parseJson(notification.body).from,
  });

  return (
    <ListItem
      pressTheme
      hoverTheme
      backgroundColor="$nav"
      borderColor="$borderFull"
      borderWidth={2}
      title={notification.title}
      subTitle={`@${user.username}`}
      icon={<UserAvatar uri={user.image} size={32} />}
    >
      <Text>{getTimeStr(notification.timestamp)}</Text>
    </ListItem>
  );
};

const NotificationListItem = ({
  notification,
}: {
  notification: EnrichedNotification;
}) => {
  if (notification.xnft_id === "friend_requests") {
    return (
      <FriendRequestListItem
        title="Friend request"
        notification={notification}
      />
    );
  }

  if (notification.xnft_id === "friend_requests_accept") {
    return (
      <FriendRequestListItem
        title="Friend request accepted"
        notification={notification}
      />
    );
  }

  return (
    <ListItem
      pressTheme
      hoverTheme
      backgroundColor="$nav"
      borderColor="$borderFull"
      borderWidth={2}
      title={notification.xnftTitle}
      subTitle={notification.body}
      icon={
        <Image
          source={{ uri: notification.xnftImage }}
          style={{ width: 32, height: 32 }}
        />
      }
    >
      <Text>{getTimeStr(notification.timestamp)}</Text>
    </ListItem>
  );
};

export function NotificationsScreen({ navigation }) {
  const renderItem = ({ item }) => <NotificationListItem notification={item} />;

  return (
    <NotificationsData>
      {({
        groupedNotifications,
      }: {
        groupedNotifications: GroupedNotification[];
      }) => {
        return <NotificationList groupedNotifications={groupedNotifications} />;
      }}
    </NotificationsData>
  );
}

export function NotificationList({
  groupedNotifications,
}: {
  groupedNotifications: GroupedNotification[];
}) {
  const renderSectionHeader = ({ section: { title } }) => <Text>{title}</Text>;

  const renderItem = ({ item: notification, index }) => (
    <NotificationListItem notification={notification} />
  );

  const sections = groupedNotifications.map((groupedNotification) => ({
    title: groupedNotification.date,
    data: groupedNotification.notifications,
  }));

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item, index) => item.id.toString() + index.toString()}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.contentContainerStyle}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
});
