import { useState } from "react";
import { Button, Image, ScrollView, Text, TextInput, View } from "react-native";

import { SignalingManager, useChatsWithMetadata } from "@coral-xyz/chat-xplat";
import { CHAT_MESSAGES, SubscriptionType } from "@coral-xyz/common";
import { createEmptyFriendship } from "@coral-xyz/db";
import {
  useFriendships,
  useGroupCollections,
  useRequestsCount,
  useUser,
} from "@coral-xyz/recoil";
import { v4 as uuidv4 } from "uuid";

export const Inbox = () => {
  const user = useUser();
  const { uuid } = user;
  const activeChats = useFriendships({ uuid });
  const requestCount = useRequestsCount({ uuid });
  const groupCollections = useGroupCollections({ uuid });
  const [selectedChat, setSelectedChat] = useState<{
    image: string;
    name: string;
    id: string;
    remoteUserId: string;
    remoteUsername: string;
  } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{
    image: string;
    name: string;
    id: string;
  } | null>(null);

  if (selectedGroup) {
    return (
      <View>
        <Text
          onPress={() => {
            setSelectedGroup(null);
          }}
        >
          Back
        </Text>
        <View>
          <Text>{selectedGroup.name}</Text>
          <Image
            src={selectedGroup.image || ""}
            style={{ height: 20, width: 20, borderRadius: 10 }}
          />
        </View>
        <ChatMessages roomId={selectedGroup.id} type="collection" />
      </View>
    );
  }

  if (selectedChat) {
    return (
      <View>
        <Text
          onPress={() => {
            setSelectedChat(null);
          }}
        >
          Back
        </Text>
        <View>
          <Text>{selectedChat.name}</Text>
          <Image
            src={selectedChat.image || ""}
            style={{ height: 20, width: 20, borderRadius: 10 }}
            remoteUserId={selectedChat.remoteUserId}
          />
        </View>
        <ChatMessages roomId={selectedChat.id} type="individual" />
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20, height: 300 }}>
      <Text>Messaging inbox</Text>
      {groupCollections
        .filter((x) => x.image && x.name)
        .map((x) => (
          <View
            onTouchEnd={() => {
              setSelectedGroup({
                name: x.name || "",
                image: x.image || "",
                id: x.collectionId,
              });
            }}
            key={x.collectionId}
            style={{
              display: "flex",
              borderStyle: "solid",
              borderColor: "black",
            }}
          >
            <View>
              <Image
                src={x.image || ""}
                style={{ height: 20, width: 20, borderRadius: 10 }}
              />
            </View>
            <View>
              <Text>{x.name}</Text>
            </View>
          </View>
        ))}
      {activeChats.map((x) => (
        <View
          onTouchEnd={() => {
            setSelectedChat({
              name: x.remoteUsername || "",
              image: x.remoteUserImage || "",
              id: x.friendshipId,
              remoteUserId: x.remoteUserId,
              remoteUsername: x.remoteUsername,
            });
          }}
          key={x.friendshipId}
          style={{ display: "flex" }}
        >
          <View>
            <Image
              src={x.remoteUserImage || ""}
              style={{ height: 20, width: 20, borderRadius: 10 }}
            />
          </View>
          <View>
            <Text>{x.remoteUsername}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

function ChatMessages({
  roomId,
  type,
  remoteUserId,
  remoteUsername,
}: {
  roomId: string;
  type: SubscriptionType;
  remoteUserId?: string;
  remoteUsername?: string;
}) {
  const { chats, usersMetadata } = useChatsWithMetadata({
    room: roomId.toString(),
    type,
  });
  console.log("BB ChatMessages", chats, roomId, type);
  const [messageText, setMessageText] = useState("");
  const { uuid } = useUser();

  return (
    <View>
      <View style={{ height: "70%" }}>
        <ScrollView>
          {chats.map((c) => (
            <ChatMessage image={c.image} message={c.message} />
          ))}
        </ScrollView>
      </View>

      <View>
        <TextInput
          style={{
            borderWidth: 1,
            padding: 10,
          }}
          onChangeText={setMessageText}
          value={messageText}
        />
        <Button
          title="Send"
          onPress={async () => {
            const client_generated_uuid = uuidv4();

            if (chats.length === 0 && type === "individual") {
              // If it's the first time the user is interacting,
              // create an in memory friendship
              await createEmptyFriendship(uuid, remoteUserId || "", {
                last_message_sender: uuid,
                last_message_timestamp: new Date().toISOString(),
                last_message: messageText,
                last_message_client_uuid: client_generated_uuid,
                remoteUsername,
                id: roomId,
              });

              SignalingManager.getInstance().onUpdateRecoil({
                type: "friendship",
              });
            }

            SignalingManager.getInstance()?.send({
              type: CHAT_MESSAGES,
              payload: {
                messages: [
                  {
                    client_generated_uuid,
                    message: messageText,
                    message_kind: "text",
                  },
                ],
                type,
                room: roomId.toString(),
              },
            });
          }}
        />
      </View>
    </View>
  );
}

function ChatMessage({ image, message }: { image: string; message: string }) {
  return (
    <View>
      <Image
        src={image || ""}
        style={{ height: 20, width: 20, borderRadius: 10 }}
      />
      <Text>{message}</Text>
    </View>
  );
}
