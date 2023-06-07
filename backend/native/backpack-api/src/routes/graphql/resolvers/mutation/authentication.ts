import type { Blockchain } from "@coral-xyz/common";
import base58 from "bs58";
import { GraphQLError, type GraphQLResolveInfo } from "graphql";

import { clearCookie, setJWTCookie } from "../../../../auth/util";
import { validateSignature } from "../../../../validation/signature";
import type { ApiContext } from "../../context";
import type { MutationAuthenticateArgs, MutationResolvers } from "../../types";

const AUTH_MESSAGE_PREFIX = "Backpack login ";

/**
 * Handler for the mutation to authenticate a user and set their JWT.
 * @param {{}} _parent
 * @param {MutationAuthenticateArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * @returns {Promise<string>}
 */
export const authenticateMutationResolver: MutationResolvers["authenticate"] =
  async (
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
        args.providerId.toLowerCase() as Blockchain,
        args.signature,
        args.publicKey
      )
    ) {
      throw new GraphQLError(
        `Invalid ${args.providerId.toLowerCase()} signature`,
        {
          extensions: {
            code: "FORBIDDEN",
            http: { code: 403 },
          },
        }
      );
    }

    // Parse the user ID and check if the public key is registered to their account
    const uuid = decoded.toString().replace(AUTH_MESSAGE_PREFIX, "");
    const pks = await ctx.dataSources.hasura.getWallets(uuid, {
      providerId: args.providerId,
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
export const deauthenticateMutationResolver: MutationResolvers["deauthenticate"] =
  async (
    _parent: {},
    _args: {},
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<string> => {
    clearCookie(ctx.http.res, "jwt");
    return "ok";
  };
