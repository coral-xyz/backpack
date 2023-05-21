import { useCallback, useState } from "react";
import { sendFriendRequest } from "@coral-xyz/common";
import {
  useFriendship,
  useUpdateFriendships,
  // useUser,
} from "@coral-xyz/recoil";
import { ListItemActionCore, useCustomTheme,XStack } from "@coral-xyz/tamagui";

export type NotificationListItemFriendRequestActionProps = {
  userId: string;
};

export function NotificationListItemFriendRequestAction({
  userId,
}: NotificationListItemFriendRequestActionProps) {
  const theme = useCustomTheme();
  // const { uuid } = useUser();
  const friendship = useFriendship({ userId });
  const setFriendshipValue = useUpdateFriendships();
  const [, setInProgress] = useState(false);

  /**
   * Memoized function handler for accepting an inbound friend request.
   */
  const handleAccept = useCallback(async () => {
    setInProgress(true);
    try {
      await sendFriendRequest({ to: userId, sendRequest: true });
      // await updateFriendshipIfExists(uuid, userId, {
      //   requested: 0,
      //   areFriends: 1,
      // });
      await setFriendshipValue({
        userId,
        friendshipValue: {
          requested: false,
          areFriends: true,
          remoteRequested: false,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setInProgress(false);
    }
  }, [setFriendshipValue, userId]);

  /**
   * Memoized function handler for rejecting an inbound friend request.
   */
  const handleDecline = useCallback(async () => {
    setInProgress(true);
    try {
      await sendFriendRequest({ to: userId, sendRequest: false });
      // await updateFriendshipIfExists(uuid, userId, {
      //   requested: 0,
      //   areFriends: 0,
      //   remoteRequested: 0,
      // });
      await setFriendshipValue({
        userId: userId,
        friendshipValue: {
          requested: false,
          areFriends: false,
          remoteRequested: false,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setInProgress(false);
    }
  }, [setFriendshipValue, userId]);

  return friendship?.remoteRequested && !friendship?.areFriends ? (
    <XStack alignItems="center" gap={10} marginTop={5}>
      <ListItemActionCore
        content="Accept"
        contentStyle={{ color: theme.custom.colors.blue }}
        onClick={handleAccept}
      />
      <ListItemActionCore content="Decline" onClick={handleDecline} />
    </XStack>
  ) : null;
}
