import { useEffect, useState } from "react";
import { ChatRoom } from "@coral-xyz/chat-sdk";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useUsername } from "@coral-xyz/recoil";

export const ChatScreen = ({ userId }: { userId: string }) => {
  const [roomId, setRoomId] = useState("");
  const [uuid, setUuid] = useState("");
  const [fetchingRoom, setFetchingRoom] = useState(true);
  const [areFriends, setAreFriends] = useState(false);
  const [requested, setRequested] = useState(false);
  const username = useUsername();

  async function getChatRoom(userId?: string) {
    if (!userId) {
      return;
    }
    const res = await fetch(`${BACKEND_API_URL}/inbox`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: userId }),
    });
    const json = await res.json();
    setRoomId(json.friendshipId);
    setUuid(json.id);
    setAreFriends(json.areFriends);
    setRequested(json.requested);
    setFetchingRoom(false);
  }

  useEffect(() => {
    getChatRoom(userId);
  }, [userId]);

  return (
    <div>
      {!fetchingRoom && (
        <ChatRoom
          type={"individual"}
          username={username || ""}
          roomId={roomId}
          userId={uuid}
          areFriends={areFriends}
          requested={requested}
          remoteUserId={userId}
        />
      )}
    </div>
  );
};
