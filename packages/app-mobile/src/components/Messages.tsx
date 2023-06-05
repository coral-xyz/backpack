import React, { useCallback, useMemo, useState } from "react";
import { View, Button, FlatList, FlatListProps, Pressable } from "react-native";

import {
  formatAmPm,
  isBackpackTeam,
  markSpam,
  sendFriendRequest,
} from "@coral-xyz/common";
import { Circle, ListItem, Text, XStack, YStack } from "@coral-xyz/tamagui";
import { MaterialIcons } from "@expo/vector-icons";
import { Verified } from "@tamagui/lucide-icons";

import { UserAvatar } from "~components/UserAvatar";
import { useTheme } from "~hooks/useTheme";
import type {
  ChatListItemProps,
  ChatRowData,
} from "~screens/Unlocked/Chat/ChatHelpers";
import { useMessagePreview } from "~screens/Unlocked/Chat/ChatHelpers";

const ROW_HEIGHT = 68;
const AVATAR_SIZE = 44;

function Action({
  text,
  onPress,
  textColor,
}: {
  text: string;
  onPress: () => void;
  textColor?: string;
}) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress}>
      <Text
        fontSize={14}
        color={textColor ?? theme.custom.colors.textPlaceholder}
      >
        {text}
      </Text>
    </Pressable>
  );
}

function UserActions({
  areFriends,
  requested,
  remoteRequested,
  onUnfriend,
  onCancelRequest,
  onDecline,
  onAccept,
  onSendRequest,
}: {
  areFriends: boolean;
  requested: boolean;
  remoteRequested: boolean;
  onUnfriend: () => void;
  onCancelRequest: () => void;
  onDecline: () => void;
  onAccept: () => void;
  onSendRequest: () => void;
}) {
  const theme = useTheme();

  if (areFriends) {
    return <Action text="Unfriend" onPress={onUnfriend} />;
  }

  if (requested) {
    return <Action text="Cancel Request" onPress={onCancelRequest} />;
  }

  if (remoteRequested) {
    return (
      <>
        <Action text="Decline" onPress={onDecline} />
        <Action
          textColor={theme.custom.colors.blue}
          text="Accept"
          onPress={onAccept}
        />
      </>
    );
  }

  return <Action text="Send Request" onPress={onSendRequest} />;
}

function UserListItem({
  id,
  imageUrl,
  username,
  areFriends,
  requested,
  remoteRequested,
  onPressRow,
  onPressAction,
}: {
  id: string;
  imageUrl: string;
  username: string;
  areFriends: boolean;
  requested: boolean;
  remoteRequested: boolean;
  onPressRow: any;
  onPressAction: any;
}) {
  const theme = useTheme();
  const showBadge = useMemo(() => isBackpackTeam(id), [id]);

  return (
    <ListItem
      bg={theme.custom.colors.nav}
      jc="flex-start"
      hoverTheme
      pressTheme
      fontFamily="Inter"
      icon={<UserAvatar size={28} uri={imageUrl} />}
      onPress={() => onPressRow(id)}
    >
      <XStack jc="space-between" ai="center" flex={1}>
        <XStack space="$2" ai="center">
          <Text
            fontWeight="600"
            fontSize={16}
            color={theme.custom.colors.fontColor}
          >
            {username}
          </Text>
          {showBadge ? <Verified color={theme.custom.colors.verified} /> : null}
        </XStack>
        <UserActions
          areFriends={areFriends}
          requested={requested}
          remoteRequested={remoteRequested}
          onUnfriend={onPressAction}
          onCancelRequest={onPressAction}
          onDecline={onPressAction}
          onAccept={onPressAction}
          onSendRequest={onPressAction}
        />
      </XStack>
    </ListItem>
  );
}

export function UserList({ friends, onPressRow, onPressAction }): JSX.Element {
  const renderItem = useCallback(
    ({ item }) => (
      <UserListItem
        id={item.id}
        imageUrl={item.image}
        username={item.username}
        areFriends={item.areFriends}
        requested={item.requested}
        remoteRequested={item.remoteRequested}
        onPressRow={onPressRow}
        onPressAction={onPressAction}
      />
    ),
    [onPressAction, onPressRow]
  );

  return <List data={friends} renderItem={renderItem} />;
}

export function ChatListItem({
  type,
  image,
  name,
  message,
  timestamp,
  id,
  isUnread,
  userId,
  onPress,
}: ChatListItemProps): JSX.Element {
  const theme = useTheme();
  const messagePreview = useMessagePreview(message);

  return (
    <ListItem
      backgroundColor={
        isUnread
          ? theme.custom.colors.unreadBackground
          : theme.custom.colors.nav
      }
      height={ROW_HEIGHT}
      justifyContent="flex-start"
      icon={<UserAvatar size={AVATAR_SIZE} uri={image} />}
      onPress={() => {
        if (type === "individual") {
          onPress({
            roomId: id,
            roomType: type,
            roomName: name,
            remoteUserId: userId,
            remoteUsername: name,
          });
        } else {
          onPress({
            roomId: id,
            roomType: type,
            roomName: name,
          });
        }
      }}
    >
      <XStack justifyContent="space-between" f={1}>
        <YStack>
          <Text
            marginBottom={2}
            fontSize={14}
            fontWeight={isUnread ? "700" : "600"}
            color={
              isUnread
                ? theme.custom.colors.fontColor
                : theme.custom.colors.smallTextColor
            }
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            ellipsizeMode="tail"
            fontWeight="500"
            numberOfLines={1}
            color={
              isUnread
                ? theme.custom.colors.fontColor
                : theme.custom.colors.smallTextColor
            }
          >
            {messagePreview}
          </Text>
        </YStack>
        <YStack>
          <Text
            fontWeight={isUnread ? "700" : "400"}
            color={theme.custom.colors.textPlaceholder}
          >
            {formatAmPm(new Date(timestamp))}
          </Text>
        </YStack>
      </XStack>
    </ListItem>
  );
}

export function MessageList({
  requestCount,
  allChats,
  onPressRow,
  onPressRequest,
  onRefreshChats,
  isRefreshing,
}: {
  requestCount: number;
  allChats: any[];
  onPressRow: (data: ChatRowData) => void;
  onPressRequest: () => void;
  onRefreshChats: () => void;
  isRefreshing: boolean;
}): JSX.Element {
  const renderItem = useCallback(
    ({ item }: { item: ChatListItemProps }) => {
      return (
        <ChatListItem
          id={item.id}
          image={item.image}
          type={item.type}
          userId={item.userId}
          name={item.name}
          message={item.message}
          timestamp={item.timestamp}
          isUnread={item.isUnread}
          onPress={onPressRow}
        />
      );
    },
    [onPressRow]
  );

  return (
    <View style={{ flex: 1 }}>
      <List
        data={allChats}
        renderItem={renderItem}
        onRefresh={onRefreshChats}
        refreshing={isRefreshing}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          requestCount > 0 ? (
            <ChatListItemMessageRequest
              requestCount={requestCount}
              onPress={onPressRequest}
            />
          ) : null
        }
        keyExtractor={({ id }: { id: string }) => id}
        getItemLayout={(_data, index) => ({
          length: ROW_HEIGHT,
          offset: ROW_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
}

function ChatListItemMessageRequest({
  requestCount,
  onPress,
}: {
  requestCount: number;
  onPress: () => void;
}): JSX.Element {
  const theme = useTheme();
  const subTitle =
    requestCount === 1
      ? "1 person" + " you may know" // eslint-disable-line
      : `${requestCount} people` + " you may know"; // eslint-disable-line

  return (
    <ListItem
      title="Message requests"
      fontWeight="700"
      fontFamily="Inter"
      height={ROW_HEIGHT}
      subTitle={subTitle}
      onPress={onPress}
      icon={
        <Circle
          size={AVATAR_SIZE}
          backgroundColor={theme.custom.colors.background}
          justifyContent="center"
          alignItems="center"
        >
          <MaterialIcons name="mark-chat-unread" size={24} color="black" />
        </Circle>
      }
    />
  );
}

function List({
  data,
  renderItem,
  keyExtractor,
  ...props
}: FlatListProps<any>): JSX.Element {
  const theme = useTheme();
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={{
        flex: 1,
        backgroundColor: theme.custom.colors.nav,
      }}
      {...props}
    />
  );
}

function SpamButton({ remoteUserId }: { remoteUserId: string }): JSX.Element {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      title={loading ? "Loading..." : "Mark as Spam"}
      onPress={async () => {
        setLoading(true);
        await markSpam({ remoteUserId, spam: true });
        setLoading(false);
      }}
    />
  );
}

function FriendRequestButton({
  remoteUserId,
}: {
  remoteUserId: string;
}): JSX.Element {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      title={loading ? "Loading..." : "Add to Friends"}
      onPress={async () => {
        setLoading(true);
        await sendFriendRequest({
          to: remoteUserId,
          sendRequest: true,
        });
        setLoading(false);
      }}
    />
  );
}
