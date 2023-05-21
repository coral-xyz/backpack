import { PublicKey } from "@solana/web3.js";
import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../../context";
import type {
  Notification,
  NotificationApplicationData,
  NotificationResolvers,
} from "../../types";

/**
 * Type-level query resolver for the `Notification` schema object.
 * @export
 */
export const notificationTypeResolvers: NotificationResolvers = {
  /**
   * Field-level resolver handler for the `app` field.
   * @param {Notification} parent
   * @param {{}} _args
   * @param {ApiContext} ctx
   * @param {GraphQLResolveInfo} _info
   * @returns {Promise<NotificationApplicationData | null>}
   */
  async app(
    parent: Notification,
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<NotificationApplicationData | null> {
    try {
      new PublicKey(parent.source);
    } catch {
      return null;
    }

    return ctx.dataSources.swr.getXnftData(parent.source);
  },
};
