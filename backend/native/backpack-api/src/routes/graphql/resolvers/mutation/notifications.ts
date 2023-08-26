import type { GraphQLResolveInfo } from "graphql";

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
    const lastNotificationId = [...args.ids].sort((a, b) => b - a)[0];
    await ctx.dataSources.hasura.updateNotificationCursor(
      ctx.authorization.userId ?? "",
      lastNotificationId
    );
    const affectedRows = await ctx.dataSources.hasura.updateNotificationViewed(
      ctx.authorization.userId ?? "",
      args.ids
    );
    return affectedRows ?? 0;
  };
