import { useEffect, useState } from "react";
import { ChatRoom } from "@coral-xyz/chat-sdk";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useUsername } from "@coral-xyz/recoil";

export const ChatScreen = ({ userId }: { userId: string }) => {
  const [roomId, setRoomId] = useState("");
  const [uuid, setUuid] = useState("");
  const [fetchingRoom, setFetchingRoom] = useState(true);
  const username = useUsername();

  async function getChatRoom() {
    const res = await fetch(`${BACKEND_API_URL}/inbox`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: userId }),
    });
    const json = await res.json();
    setRoomId(json.friendshipId);
    setUuid(json.id);
    setFetchingRoom(false);
  }

  useEffect(() => {
    getChatRoom();
  }, []);

  return (
    <div>
      {!fetchingRoom && (
        <ChatRoom
          type={"individual"}
          username={username || ""}
          roomId={roomId}
          userId={uuid}
        />
      )}
    </div>
  );
};
