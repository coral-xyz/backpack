// import { friendship, useUser } from "@coral-xyz/recoil";
import { useState } from "react";
import { ChatRoom } from "@coral-xyz/chat-sdk";
import type { Friendship } from "@coral-xyz/common";

export const ChatScreen = ({ userId }: { userId: string }) => {
  // const [friendshipValue, setFriendshipValue] =
  //   useRecoilState<Friendship | null>(friendship({ userId }));
  // const { uuid, username } = useUser();

  const [friendshipValue, setFriendshipValue]: any = useState();
  const username = "kira",
    uuid = "asd";
  if (!friendshipValue) {
    console.error(`Friendship not found with user ${userId}`);
    return <div></div>;
  }

  return (
    <div>
      <ChatRoom
        type={"individual"}
        username={username || ""}
        roomId={friendshipValue.id}
        userId={uuid}
        areFriends={friendshipValue.areFriends}
        requested={friendshipValue.requested}
        remoteUserId={userId}
        blocked={friendshipValue.blocked}
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
      />
    </div>
  );
};
