import type { GraphQLResolveInfo } from "graphql";

import {
  updateCursor,
  updateNotificationSeen,
} from "../../../../db/notifications";
import type { ApiContext } from "../../context";
import type {
  MutationMarkNotificationsAsReadArgs,
  MutationResolvers,
} from "../../types";

/**
 * Handler for the mutation to mark a set of notifications as viewed.
 * @param {{}} _parent
 * @param {MutationMarkNotificationsAsReadArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns
 */
export const markNotificationsAsReadMutationResolver: MutationResolvers["markNotificationsAsRead"] =
  async (
    _parent: {},
    args: MutationMarkNotificationsAsReadArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<number> => {
    // TODO: move implementation into contextual Hasura client
    const lastNotificationId = [...args.ids].sort((a, b) => b - a)[0];
    await updateCursor({
      uuid: ctx.authorization.userId ?? "",
      lastNotificationId,
    });

    // TODO: move implementation into contextual Hasura client
    const res = await updateNotificationSeen({
      notificationIds: args.ids,
      uuid: ctx.authorization.userId ?? "",
    });
    return res.update_auth_notifications?.affected_rows ?? 0;
  };
