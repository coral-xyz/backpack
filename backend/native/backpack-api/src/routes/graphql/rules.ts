import { GraphQLError } from "graphql";
import { rule } from "graphql-shield";
import type { Rule } from "graphql-shield/typings/rules";

import type { ApiContext } from "./context";

/**
 * Shield rule to ensure there is a valid JWT present in the context.
 * @export
 */
export const authorized: Rule = rule("auth", { cache: "contextual" })(
  async (_parent, _args, ctx: ApiContext, _info) => {
    const { jwt, valid } = ctx.authorization;
    if (!jwt) {
      return new GraphQLError("User authorization token was not found", {
        extensions: {
          code: "UNAUTHORIZED",
          http: { status: 401 },
        },
      });
    } else if (!valid) {
      return new GraphQLError("User authorization token failed verification", {
        extensions: {
          code: "FORBIDDEN",
          http: { status: 403 },
        },
      });
    }
    return true;
  }
);
