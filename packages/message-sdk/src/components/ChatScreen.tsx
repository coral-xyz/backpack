import { ChatRoom } from "@coral-xyz/chat-sdk";
import { updateFriendshipIfExists } from "@coral-xyz/db";
import { useFriendship, useUpdateFriendships } from "@coral-xyz/recoil";

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
  const friendshipValue = useFriendship({ userId });
  const setFriendshipValue = useUpdateFriendships();

  if (!friendshipValue || !friendshipValue.id) {
    console.error(`Friendship not found with user ${userId} or jwt not found`);
    return <div />;
  }

  return (
    <div
      style={{
        height: "100%",
      }}
    >
      <ChatRoom
        type="individual"
        remoteUsername={username}
        username=""
        roomId={friendshipValue.id?.toString()}
        userId={uuid}
        areFriends={friendshipValue.areFriends}
        requested={friendshipValue.requested}
        remoteUserId={userId}
        blocked={friendshipValue.blocked}
        remoteRequested={friendshipValue.remoteRequested}
        spam={friendshipValue.spam}
        setRequested={(updatedValue: boolean) => {
          if (!friendshipValue.remoteRequested && !friendshipValue.areFriends)
            setFriendshipValue({
              userId: userId,
              friendshipValue: {
                requested: updatedValue,
              },
            });
          else if (!friendshipValue.areFriends) {
            updateFriendshipIfExists(uuid, userId, {
              requested: 0,
              areFriends: 1,
            });

            setFriendshipValue({
              userId: userId,
              friendshipValue: {
                areFriends: updatedValue,
                remoteRequested: false,
                requested: false,
              },
            });
          }
        }}
        setSpam={(updatedValue: boolean) =>
          setFriendshipValue({
            userId: userId,
            friendshipValue: {
              spam: updatedValue,
            },
          })
        }
        setBlocked={(updatedValue: boolean) =>
          setFriendshipValue({
            userId: userId,
            friendshipValue: {
              blocked: updatedValue,
            },
          })
        }
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
