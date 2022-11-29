import { useNavStack } from "../../common/Layout/NavStack";
import { useEffect, useState } from "react";
import { ChatRoom } from "@coral-xyz/chat-sdk";
import { getWaitlistId } from "../../common/WaitingRoom";
import { BACKEND_API_URL } from "@coral-xyz/common";

export const ChatScreen = ({
  userId,
  username,
  image,
}: {
  userId: string;
  username: string;
  image: string;
}) => {
  const { title, setTitle } = useNavStack();
  const [roomId, setRoomId] = useState("");
  const [uuid, setUuid] = useState("");
  const [fetchingRoom, setFetchingRoom] = useState(true);

  useEffect(() => {
    const prev = title;
    setTitle(`@${username}`);
    return () => {
      setTitle(prev);
    };
  }, []);

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
        <ChatRoom type={"individual"} roomId={roomId} userId={uuid} />
      )}
    </div>
  );
};
