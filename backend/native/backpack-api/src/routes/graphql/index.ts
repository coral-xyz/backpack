import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "fs";
import { applyMiddleware } from "graphql-middleware";
import { allow, shield } from "graphql-shield";
import { join } from "path";

import {
  friendshipTypeResolvers,
  importPublicKeyMutation,
  jsonObjectScalar,
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
  Mutation: mutationResolvers,
  Query: queryResolvers,
  Friendship: friendshipTypeResolvers,
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
