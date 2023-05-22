import { NOTIFICATION_ADD } from "@coral-xyz/common";
import type { GraphQLResolveInfo } from "graphql";

import { setFriendship } from "../../../../db/friendships";
import { Redis } from "../../../../Redis";
import type { ApiContext } from "../../context";
import type {
  MutationResolvers,
  MutationSendFriendRequestArgs,
  Notification,
} from "../../types";

/**
 * Handler for the mutation to allow user's to send other users friend requests.
 * @param {{}} _parent
 * @param {MutationSendFriendRequestArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * FIXME:TODO: move to new hasura client abstraction
 */
export const sendFriendRequestMutationResolver: MutationResolvers["sendFriendRequest"] =
  async (
    _parent: {},
    { accept, otherUserId }: MutationSendFriendRequestArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<boolean | null> => {
    const areFriends = await setFriendship({
      from: ctx.authorization.userId!,
      to: otherUserId,
      sendRequest: accept,
    });

    if (accept) {
      let notification: Notification;

      if (areFriends) {
        notification = await ctx.dataSources.hasura.createNotification(
          otherUserId,
          "friend_requests_accept",
          "Friend request accepted",
          { from: ctx.authorization.userId }
        );

        await Redis.getInstance().send(
          JSON.stringify({
            type: "friend_request_accept",
            payload: {
              from: ctx.authorization.userId,
              to: otherUserId,
            },
          })
        );
      } else {
        notification = await ctx.dataSources.hasura.createNotification(
          otherUserId,
          "friend_requests",
          "Friend request",
          { from: ctx.authorization.userId }
        );

        await Redis.getInstance().send(
          JSON.stringify({
            type: "friend_request",
            payload: {
              from: ctx.authorization.userId,
              to: otherUserId,
            },
          })
        );
      }

      await Redis.getInstance().publish(`INDIVIDUAL_${otherUserId}`, {
        type: NOTIFICATION_ADD,
        payload: notification,
      });
    }

    return areFriends ?? null;
  };
