import type {
  EnrichedNotification,
  GroupedNotification,
} from "@coral-xyz/common";

import { memo, Suspense, useCallback, useMemo } from "react";
import { SectionList } from "react-native";

import { useUserMetadata } from "@coral-xyz/chat-xplat";
import { NotificationsData } from "@coral-xyz/recoil";
import { Separator } from "@coral-xyz/tamagui";
import { ErrorBoundary } from "react-error-boundary";

import {
  ListItemFriendRequest,
  ListItemNotification,
  SectionHeader,
  SectionSeparator,
} from "~components/ListItem";
import {
  RoundedContainerGroup,
  // Screen,
  ScreenEmptyList,
  ScreenError,
  ScreenLoading,
} from "~components/index";

function parseJson(body: string) {
  try {
    return JSON.parse(body);
  } catch (_ex) {
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

const FriendRequestListItem = memo(
  ({ notification }: { notification: EnrichedNotification }) => {
    const user = useUserMetadata({
      remoteUserId: parseJson(notification.body).from,
    });

    if (user.username === "" && user.loading === false) {
      return null;
    }

    return (
      <ListItemFriendRequest
        grouped
        text={notification.title}
        username={`@${user.username}`}
        time={getTimeStr(notification.timestamp)}
        avatarUrl={user.image}
      />
    );
  }
);

const ListItem = ({ item }: { item: EnrichedNotification }) => {
  if (item.xnft_id === "friend_requests") {
    return <FriendRequestListItem notification={item} />;
  }

  if (item.xnft_id === "friend_requests_accept") {
    return <FriendRequestListItem notification={item} />;
  }

  return (
    <ListItemNotification
      grouped
      unread
      title={item.xnftTitle}
      body={item.body}
      time={getTimeStr(item.timestamp)}
      iconUrl={item.xnftImage}
    />
  );
};

function NotificationList({
  groupedNotifications,
}: {
  groupedNotifications: GroupedNotification[];
}) {
  const sections = useMemo(() => {
    return groupedNotifications.map((groupedNotification) => ({
      title: groupedNotification.date,
      data: groupedNotification.notifications,
    }));
  }, [groupedNotifications]);

  const keyExtractor = (item: EnrichedNotification, index: number) =>
    item.id.toString() + index.toString();

  const renderItem = useCallback(({ item, section, index }: any) => {
    const isFirst = index === 0;
    const isLast = index === section.data.length - 1;

    return (
      <RoundedContainerGroup
        disableTopRadius={!isFirst}
        disableBottomRadius={!isLast}
      >
        <ListItem item={item} />
      </RoundedContainerGroup>
    );
  }, []);

  const renderSectionHeader = useCallback(({ section }: any) => {
    return <SectionHeader title={section.title} />;
  }, []);

  return (
    <SectionList
      sections={sections}
      style={{ paddingTop: 16, paddingHorizontal: 16 }}
      contentContainerStyle={{
        flex: sections.length > 0 ? undefined : 1,
        paddingBottom: 32,
      }}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      scrollEnabled={sections.length > 0}
      ItemSeparatorComponent={Separator}
      SectionSeparatorComponent={SectionSeparator}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <ScreenEmptyList
          title="No notifications"
          subtitle="Make some friends!"
          iconName="image"
        />
      }
    />
  );
}

function Container(): JSX.Element {
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

export function NotificationsScreen(): JSX.Element {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => <ScreenError error={error} />}
    >
      <Suspense fallback={<ScreenLoading />}>
        <Container />
      </Suspense>
    </ErrorBoundary>
  );
}
