import { useEffect, useState } from "react";
import { ChatRoom } from "@coral-xyz/chat-sdk";
import type { Friendship } from "@coral-xyz/common";
import { BACKEND_API_URL, REALTIME_API_URL } from "@coral-xyz/common";
import { friendship } from "@coral-xyz/recoil";
import { useRecoilState } from "recoil";

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
  const [friendshipValue, setFriendshipValue] =
    useRecoilState<Friendship | null>(friendship({ userId }));

  const [jwt, setJwt] = useState("");

  const fetchJwt = async () => {
    const res = await ParentCommunicationManager.getInstance().fetch(
      `${REALTIME_API_URL}/cookie`
    );
    const jwt = (await res.json()).jwt;
    setJwt(jwt);
  };

  useEffect(() => {
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
        remoteUsername={username}
        username={""}
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
