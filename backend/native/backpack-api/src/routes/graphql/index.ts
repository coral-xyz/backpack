import { makeExecutableSchema } from "@graphql-tools/schema";
import { readFileSync } from "fs";
import { join } from "path";

import { authDirectiveTransformer } from "./directives";
import {
  userQueryResolver,
  userTypeResolvers,
  walletQueryResolver,
  walletTypeResolvers,
} from "./resolvers";
import type { QueryResolvers, Resolvers } from "./types";

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
  User: userTypeResolvers,
  Wallet: walletTypeResolvers,
};

/**
 * Built schema to be executed on the Apollo server.
 * @export
 */
export const schema = authDirectiveTransformer(
  makeExecutableSchema({
    resolvers,
    typeDefs: readFileSync(join(__dirname, "schema.graphql"), "utf-8"), // Path resolution for the built distribution to schema file
  })
);
