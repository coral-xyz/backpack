import { useCallback } from "react";
import type { GestureResponderEvent } from "react-native";
import { useMutation } from "@apollo/client";
import {
  useFriendship,
  useUpdateFriendships,
  useUser,
} from "@coral-xyz/recoil";
import { ListItemActionCore, useCustomTheme, XStack } from "@coral-xyz/tamagui";

import { gql } from "../../apollo";

const SEND_FRIEND_REQUEST = gql(`
  mutation SendFriendRequest($otherUserId: String!, $accept: Boolean!) {
    sendFriendRequest(otherUserId: $otherUserId, accept: $accept)
  }
`);

export type NotificationListItemFriendRequestActionProps = {
  onAccept?: (
    activeUserId: string,
    otherUserId: string
  ) => void | Promise<void>;
  onDecline?: (
    activeUserId: string,
    otherUserId: string
  ) => void | Promise<void>;
  remoteUserId: string;
};

export function NotificationListItemFriendRequestAction({
  onAccept,
  onDecline,
  remoteUserId,
}: NotificationListItemFriendRequestActionProps) {
  const theme = useCustomTheme();
  const { uuid } = useUser();
  const friendship = useFriendship({ userId: remoteUserId });
  const setFriendshipValue = useUpdateFriendships();
  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST);

  /**
   * Memoized function handler for accepting an inbound friend request.
   */
  const handleAccept = useCallback(
    async (ev: GestureResponderEvent) => {
      ev.stopPropagation();
      await sendFriendRequest({
        variables: { accept: true, otherUserId: remoteUserId },
      });

      if (onAccept) {
        await onAccept(uuid, remoteUserId);
      }

      await setFriendshipValue({
        userId: remoteUserId,
        friendshipValue: {
          requested: false,
          areFriends: true,
          remoteRequested: false,
        },
      });
    },
    [onAccept, remoteUserId, sendFriendRequest, setFriendshipValue, uuid]
  );

  /**
   * Memoized function handler for rejecting an inbound friend request.
   */
  const handleDecline = useCallback(
    async (ev: GestureResponderEvent) => {
      ev.stopPropagation();
      await sendFriendRequest({
        variables: { accept: false, otherUserId: remoteUserId },
      });

      if (onDecline) {
        await onDecline(uuid, remoteUserId);
      }

      await setFriendshipValue({
        userId: remoteUserId,
        friendshipValue: {
          requested: false,
          areFriends: false,
          remoteRequested: false,
        },
      });
    },
    [onDecline, remoteUserId, sendFriendRequest, setFriendshipValue, uuid]
  );

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
