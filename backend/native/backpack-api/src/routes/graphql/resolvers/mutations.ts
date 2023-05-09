import type { GraphQLResolveInfo } from "graphql";

import type { ApiContext } from "../context";
import type { MutationImportPublicKeyArgs, MutationResolvers } from "../types";

/**
 * Handler for the mutation to import a new public key to a user account.
 * @param {{}} _parent
 * @param {MutationImportPublicKeyArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns
 */
export const importPublicKeyMutation: MutationResolvers["importPublicKey"] =
  async (
    _parent: {},
    args: MutationImportPublicKeyArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<boolean | null> => {
    return null;
  };
