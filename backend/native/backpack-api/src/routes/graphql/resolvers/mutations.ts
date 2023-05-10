import { type Blockchain, getAddMessage } from "@coral-xyz/common";
import base58 from "bs58";
import type { GraphQLResolveInfo } from "graphql";
import { GraphQLError } from "graphql";

import { clearCookie, setJWTCookie } from "../../../auth/util";
import { createUserPublicKey, getUsersByPublicKeys } from "../../../db/users";
import { validateSignature } from "../../../validation/signature";
import { CreatePublicKeys } from "../../../validation/user";
import type { ApiContext } from "../context";
import type {
  MutationAuthenticateArgs,
  MutationImportPublicKeyArgs,
  MutationResolvers,
} from "../types";

const AUTH_MESSAGE_PREFIX = "Backpack login ";

/**
 * Handler for the mutation to authenticate a user and set their JWT.
 * @param {{}} _parent
 * @param {MutationAuthenticateArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {Promise<string>}
 */
export const authenticateMutation: MutationResolvers["authenticate"] = async (
  _parent: {},
  args: MutationAuthenticateArgs,
  ctx: ApiContext,
  _info: GraphQLResolveInfo
): Promise<string> => {
  // Base58 decode the argued signed message and check the prefix
  const decoded = Buffer.from(base58.decode(args.message));
  if (!decoded.toString().startsWith(AUTH_MESSAGE_PREFIX)) {
    throw new GraphQLError("Invalid signed message", {
      extensions: {
        code: "FORBIDDEN",
        http: { code: 403 },
      },
    });
  }

  // Throw error if the signature does not match the blockchain and public key
  if (
    !validateSignature(
      decoded,
      args.chainId.toLowerCase() as Blockchain,
      args.signature,
      args.publicKey
    )
  ) {
    throw new GraphQLError(`Invalid ${args.chainId.toLowerCase()} signature`, {
      extensions: {
        code: "FORBIDDEN",
        http: { code: 403 },
      },
    });
  }

  // Parse the user ID and check if the public key is registered to their account
  const uuid = decoded.toString().replace(AUTH_MESSAGE_PREFIX, "");
  const pks = await ctx.dataSources.hasura.getWallets(uuid, {
    chainId: args.chainId,
    pubkeys: [args.publicKey],
  });

  if ((pks?.edges?.length ?? 0) === 0) {
    throw new GraphQLError("Invalid signing public key for user", {
      extensions: {
        code: "FORBIDDEN",
        http: { code: 403 },
      },
    });
  }

  // Set and return the new signed JWT
  const jwt = await setJWTCookie(ctx.http.req, ctx.http.res, uuid);
  return jwt;
};

/**
 * Handler for the deauthentication mutation.
 * @param {{}} _parent
 * @param {{}} _args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {Promise<string>}
 */
export const deauthenticateMutation: MutationResolvers["deauthenticate"] =
  async (
    _parent: {},
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<string> => {
    clearCookie(ctx.http.res, "jwt");
    return "ok";
  };

/**
 * Handler for the mutation to import a new public key to a user account.
 * @param {{}} _parent
 * @param {MutationImportPublicKeyArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {Promise<boolean | null>}
 */
// FIXME:TODO: move to new hasura client abstraction
export const importPublicKeyMutation: MutationResolvers["importPublicKey"] =
  async (
    _parent: {},
    args: MutationImportPublicKeyArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<boolean | null> => {
    // Validate the argument inputs
    const { blockchain, publicKey, signature } =
      await CreatePublicKeys.parseAsync({
        blockchain: args.chainId.toLowerCase(),
        publicKey: args.address,
        signature: args.signature,
      });

    // Create and validate message signature
    const signedMessage = getAddMessage(publicKey);
    const valid = validateSignature(
      Buffer.from(signedMessage, "utf-8"),
      blockchain as Blockchain,
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
