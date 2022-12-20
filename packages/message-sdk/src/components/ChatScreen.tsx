import { useEffect, useState } from "react";
import { ChatRoom } from "@coral-xyz/chat-sdk";
import { BACKEND_API_URL, REALTIME_API_URL } from "@coral-xyz/common";

import { ParentCommunicationManager } from "../ParentCommunicationManager";

export const ChatScreen = ({
  userId,
  uuid,
  username,
  isDarkMode,
}: {
  isDarkMode: boolean;
  userId: string;
  uuid: string;
  username: string;
}) => {
  const [friendshipValue, setFriendshipValue] = useState<any>();
  const [jwt, setJwt] = useState("");

  const fetchFriendship = async () => {
    const res = await ParentCommunicationManager.getInstance().fetch(
      `${BACKEND_API_URL}/inbox`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: userId }),
      }
    );
    const json = await res.json();
    setFriendshipValue({
      id: json.friendshipId,
      areFriends: json.areFriends,
      blocked: json.blocked,
      requested: json.requested,
      spam: json.spam,
    });
  };

  const fetchJwt = async () => {
    const res = await ParentCommunicationManager.getInstance().fetch(
      `${REALTIME_API_URL}/cookie`
    );
    const jwt = (await res.json()).jwt;
    setJwt(jwt);
  };

  useEffect(() => {
    fetchFriendship();
    fetchJwt();
  }, []);

  if (!friendshipValue || !jwt) {
    console.error(`Friendship not found with user ${userId} or jwt not found`);
    return <div></div>;
  }

  return (
    <div>
      <ChatRoom
        jwt={jwt}
        type={"individual"}
        username={username || ""}
        roomId={friendshipValue.id}
        userId={uuid}
        areFriends={friendshipValue.areFriends}
        requested={friendshipValue.requested}
        remoteUserId={userId}
        blocked={friendshipValue.blocked}
        remoteRequested={friendshipValue.remoteRequested}
        spam={friendshipValue.spam}
        setRequested={(updatedValue: boolean) =>
          setFriendshipValue((x: any) => ({
            ...x,
            requested: updatedValue,
          }))
        }
        setSpam={(updatedValue: boolean) =>
          setFriendshipValue((x: any) => ({
            ...x,
            spam: updatedValue,
          }))
        }
        setBlocked={(updatedValue: boolean) =>
          setFriendshipValue((x: any) => ({
            ...x,
            blocked: updatedValue,
          }))
        }
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
