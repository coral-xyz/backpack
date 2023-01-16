import { ChatRoom } from "@coral-xyz/chat-sdk";
import type { Friendship } from "@coral-xyz/common";
import { friendship } from "@coral-xyz/recoil";
import { useRecoilState } from "recoil";

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

  if (!friendshipValue || !friendshipValue.id) {
    console.error(`Friendship not found with user ${userId} or jwt not found`);
    return <div></div>;
  }

  return (
    <div
      style={{
        height: "100%",
      }}
    >
      <ChatRoom
        type={"individual"}
        remoteUsername={username}
        username={""}
        roomId={friendshipValue.id?.toString()}
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
