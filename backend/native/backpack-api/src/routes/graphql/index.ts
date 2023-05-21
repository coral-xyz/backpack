import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "fs";
import { applyMiddleware } from "graphql-middleware";
import { allow, shield } from "graphql-shield";
import { join } from "path";

import {
  authenticateMutation,
  deauthenticateMutation,
  friendshipTypeResolvers,
  importPublicKeyMutation,
  jsonObjectScalar,
  notificationTypeResolvers,
  userQueryResolver,
  userTypeResolvers,
  walletQueryResolver,
  walletTypeResolvers,
} from "./resolvers";
import { authorized } from "./rules";
import type { MutationResolvers, QueryResolvers, Resolvers } from "./types";

/**
 * Root `Mutation` object resolver.
 */
const mutationResolvers: MutationResolvers = {
  authenticate: authenticateMutation,
  deauthenticate: deauthenticateMutation,
  importPublicKey: importPublicKeyMutation,
};

/**
 * Root `Query` object resolver.
 */
const queryResolvers: QueryResolvers = {
  user: userQueryResolver,
  wallet: walletQueryResolver,
};

/**
 * Schema root and type-level resolvers.
 */
const resolvers: Resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Friendship: friendshipTypeResolvers,
  Notification: notificationTypeResolvers,
  User: userTypeResolvers,
  Wallet: walletTypeResolvers,
  JSONObject: jsonObjectScalar,
};

/**
 * Permissions map for Shield rule applications on operations and types.
 */
const permissions = shield(
  {
    Mutation: {
      "*": authorized,
      authenticate: allow,
    },
    Query: {
      "*": allow,
      user: authorized,
    },
    User: authorized,
  },
  { allowExternalErrors: true, debug: process.env.NODE_ENV !== "production" }
);

/**
 * Built schema to be executed on the Apollo server.
 * @export
 */
export const schema = applyMiddleware(
  makeExecutableSchema({
    resolvers,
    typeDefs: readFileSync(join(__dirname, "schema.graphql"), "utf-8"), // Path resolution for the built distribution to schema file
  }),
  permissions
);
