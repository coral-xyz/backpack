import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../../context";
import type { MutationResolvers, MutationSetAvatarArgs } from "../../types";

/**
 * Handler for the mutation to import a new public key to a user account.
 * @param {{}} _parent
 * @param {MutationSetAvatarArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {Promise<boolean>}
 */
export const setAvatarMutationResolver: MutationResolvers["setAvatar"] = async (
  _parent: {},
  args: MutationSetAvatarArgs,
  ctx: ApiContext,
  _info: GraphQLResolveInfo
): Promise<boolean> => {
  const affectedRows = await ctx.dataSources.hasura.updateUserAvatar(
    ctx.authorization.userId!,
    args.providerId,
    args.nft
  );
  return affectedRows > 0;
};
