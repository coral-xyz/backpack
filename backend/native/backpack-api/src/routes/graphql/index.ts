import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import bodyParser from "body-parser";
import cors from "cors";
import { Router } from "express";
import { readFileSync } from "fs";
import http from "http";

import { app } from "../../index";

import { queryResolver } from "./query";
import type { Resolvers } from "./types";

const resolvers: Resolvers = {
  Query: queryResolver,
};

const httpServer = http.createServer(app);
const apollo = new ApolloServer({
  typeDefs: readFileSync("./src/routes/graphql/schema.graphql", "utf-8"),
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

const router = Router();
router.use(cors());
router.use(bodyParser.json());

apollo.start().then(() => {
  router.use(expressMiddleware(apollo));
});

export default router;
