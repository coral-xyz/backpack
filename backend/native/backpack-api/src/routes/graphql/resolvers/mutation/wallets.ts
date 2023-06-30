import { type Blockchain, getAddMessage } from "@coral-xyz/common";
import { GraphQLError, type GraphQLResolveInfo } from "graphql";

import { BLOCKCHAINS_NATIVE } from "../../../../blockchains";
import {
  createUserPublicKey,
  getUsersByPublicKeys,
} from "../../../../db/users";
import { CreatePublicKeys } from "../../../../validation/user";
import type { ApiContext } from "../../context";
import type {
  MutationImportPublicKeyArgs,
  MutationRemovePublicKeyArgs,
  MutationResolvers,
} from "../../types";

/**
 * Handler for the mutation to import a new public key to a user account.
 * @param {{}} _parent
 * @param {MutationImportPublicKeyArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {Promise<boolean | null>}
 * FIXME:TODO: move to new hasura client abstraction
 */
export const importPublicKeyMutationResolver: MutationResolvers["importPublicKey"] =
  async (
    _parent: {},
    args: MutationImportPublicKeyArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<boolean | null> => {
    // Validate the argument inputs
    const { blockchain, publicKey, signature } =
      await CreatePublicKeys.parseAsync({
        blockchain: args.providerId.toLowerCase(),
        publicKey: args.address,
        signature: args.signature,
      });

    // Create and validate message signature
    const signedMessage = getAddMessage(publicKey);
    const valid = BLOCKCHAINS_NATIVE[
      blockchain as Blockchain
    ].validateSignature(
      Buffer.from(signedMessage, "utf-8"),
      signature,
      publicKey
    );

    if (!valid) {
      throw new GraphQLError("Invalid public key add signature", {
        extensions: {
          code: "BAD REQUEST",
          http: { status: 400 },
        },
      });
    }

    // Check for user conflicts with the public key already registered
    const conflicts = await getUsersByPublicKeys([
      { blockchain: blockchain as Blockchain, publicKey },
    ]);

    if (conflicts.length > 0) {
      if (conflicts[0].user_id === ctx.authorization.userId) {
        return false;
      } else {
        throw new GraphQLError(
          "Wallet address is used by another Backpack account",
          {
            extensions: {
              code: "CONFLICT",
              http: { status: 409 },
            },
          }
        );
      }
    }

    // Create and return if it is the primary key
    const resp = await createUserPublicKey({
      userId: ctx.authorization.userId!,
      blockchain: blockchain as Blockchain,
      publicKey,
    });

    return resp.isPrimary;
  };

/**
 * Handler for the mutation to remove a user public key from the database.
 * @param {{}} _parent
 * @param {MutationRemovePublicKeyArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {Promise<boolean>}
 */
export const removePublicKeyMutationResolver: MutationResolvers["removePublicKey"] =
  async (
    _parent: {},
    args: MutationRemovePublicKeyArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<boolean> => {
    const affectedRows = await ctx.dataSources.hasura.removeUserPublicKey(
      ctx.authorization.userId!,
      args.providerId,
      args.address
    );
    return affectedRows > 0;
  };
