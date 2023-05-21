import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import {
  useFriendship,
  useUpdateFriendships,
  // useUser,
} from "@coral-xyz/recoil";
import { ListItemActionCore, useCustomTheme, XStack } from "@coral-xyz/tamagui";

import { gql } from "../../apollo";

const SEND_FRIEND_REQUEST = gql(`
  mutation SendFriendRequest($otherUserId: String!, $accept: Boolean!) {
    sendFriendRequest(otherUserId: $otherUserId, accept: $accept)
  }
`);

export type NotificationListItemFriendRequestActionProps = {
  userId: string;
};

export function NotificationListItemFriendRequestAction({
  userId,
}: NotificationListItemFriendRequestActionProps) {
  const theme = useCustomTheme();
  // const { uuid } = useUser();
  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST);
  const friendship = useFriendship({ userId });
  const setFriendshipValue = useUpdateFriendships();

  /**
   * Memoized function handler for accepting an inbound friend request.
   */
  const handleAccept = useCallback(async () => {
    await sendFriendRequest({
      variables: { accept: true, otherUserId: userId },
    });
    // FIXME: not xplat?
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
  }, [sendFriendRequest, setFriendshipValue, userId]);

  /**
   * Memoized function handler for rejecting an inbound friend request.
   */
  const handleDecline = useCallback(async () => {
    await sendFriendRequest({
      variables: { accept: false, otherUserId: userId },
    });
    // FIXME: not xplat?
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
  }, [sendFriendRequest, setFriendshipValue, userId]);

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
