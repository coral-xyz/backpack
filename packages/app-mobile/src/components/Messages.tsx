import React, { useCallback, useMemo } from "react";
import { View, FlatList, Alert, Pressable } from "react-native";

import { formatMessage, formatAMPM, isBackpackTeam } from "@coral-xyz/common";
import { XStack, YStack, ListItem, Avatar, Text } from "@coral-xyz/tamagui";
import { Verified } from "@tamagui/lucide-icons";

import { useTheme } from "~hooks/useTheme";

import { filteredFriends, messagesTabChats } from "./data";

const UserAvatar = ({ imageUrl, size }) => (
  <Avatar circular size={size}>
    <Avatar.Image src={imageUrl} />
    <Avatar.Fallback bc="gray" />
  </Avatar>
);

const bgColor = "#f7f7f8";

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
}) {
  const theme = useTheme();
  const showBadge = useMemo(() => isBackpackTeam(id), [id]);

  return (
    <ListItem
      bg={theme.custom.colors.nav}
      jc="flex-start"
      hoverTheme
      pressTheme
      icon={<UserAvatar size={28} imageUrl={imageUrl} />}
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
    []
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
  users = [],
}: {
  type: any; // SubscriptionType
  image: string;
  name: string;
  message: string;
  timestamp: string;
  id: string;
  isUnread: boolean;
  userId: string;
  onPress: (id: string) => void;
  users: any[];
}) {
  const theme = useTheme();
  const messagePreview = useMemo(
    () => formatMessage(message, users),
    [message, users]
  );

  return (
    <ListItem
      id={id}
      bg={theme.custom.colors.nav}
      jc="flex-start"
      hoverTheme
      pressTheme
      onPress={() => onPress(id)}
      icon={<UserAvatar size={48} imageUrl={image} />}
    >
      <XStack jc="space-between" f={1}>
        <YStack>
          <Text
            mb={2}
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
          <Text color={theme.custom.colors.textPlaceholder}>
            {formatAMPM(new Date(timestamp))}
          </Text>
        </YStack>
      </XStack>
    </ListItem>
  );
}

export function MessageList({ allChats, onPressRow }): JSX.Element {
  const chats = useMemo(
    () =>
      allChats.map((activeChat) => {
        return {
          type: activeChat.type,
          id:
            activeChat.chatType === "individual"
              ? activeChat.chatProps.remoteUserId
              : activeChat.chatProps.collectionId,
          image:
            activeChat.chatType === "individual"
              ? activeChat.chatProps.remoteUserImage!
              : activeChat.chatProps.image!,
          userId:
            activeChat.chatType === "individual"
              ? activeChat.chatProps.remoteUserId!
              : "",
          name:
            activeChat.chatType === "individual"
              ? activeChat.chatProps.remoteUsername!
              : activeChat.chatProps.name!,
          message:
            activeChat.chatType === "individual"
              ? activeChat.chatProps.last_message!
              : activeChat.chatProps.lastMessage!,
          timestamp:
            activeChat.chatType === "individual"
              ? activeChat.chatProps.last_message_timestamp || ""
              : activeChat.chatProps.lastMessageTimestamp || "",
          isUnread:
            activeChat.chatType === "individual"
              ? !!activeChat.chatProps.unread
              : activeChat.chatProps.lastMessageUuid !==
                activeChat.chatProps.lastReadMessage,
        };
      }),
    [allChats]
  );

  const renderItem = useCallback(
    ({ item }) => (
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
        users={[]}
      />
    ),
    []
  );

  return <List data={chats} renderItem={renderItem} />;
}

export function HomeScreen() {
  const handlePressUser = (id: string) => {
    console.log("id", id);
    // navigation.push('ChatDetail', { id })
  };

  const handlePressMessage = (id: string) => {
    console.log("id", id);
  };

  return (
    <YStack f={1} mb="$8" bg={bgColor}>
      <UserList
        friends={filteredFriends}
        onPressRow={handlePressUser}
        onPressAction={console.log}
      />
      <MessageList
        allChats={messagesTabChats}
        onPressRow={handlePressMessage}
      />
    </YStack>
  );
}

export function List({ data, renderItem, ...props }): JSX.Element {
  const theme = useTheme();
  const keyExtractor = props.keyExtractor ?? (({ id }) => id);
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={{
        flex: 1,
        borderRadius: 14,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: theme.custom.colors.borderFull,
        backgroundColor: theme.custom.colors.nav,
      }}
      {...props}
    />
  );
}
