import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils";
import {
  defaultFieldResolver,
  GraphQLError,
  type GraphQLSchema,
} from "graphql";

import type { ApiContext } from "./context";

/**
 * Schema transforming function to apply logic for authorization gates.
 * @export
 * @param {GraphQLSchema} schema
 * @returns {GraphQLSchema}
 */
export function authDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema {
  const directiveName = "auth";
  const typeDirectiveArgumentMaps: Record<string, any> = {};
  return mapSchema(schema, {
    [MapperKind.TYPE]: (ty) => {
      const authDirective = getDirective(schema, ty, directiveName);
      if (authDirective) {
        typeDirectiveArgumentMaps[ty.name] = authDirective;
      }
      return undefined;
    },
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      const authDirective =
        getDirective(schema, fieldConfig, directiveName)?.[0] ??
        typeDirectiveArgumentMaps[typeName];

      if (authDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = function (source, args, ctx: ApiContext, info) {
          if (!ctx.authorization.jwt) {
            throw new GraphQLError("User authorization token was not found", {
              extensions: {
                code: "UNAUTHORIZED",
                http: { status: 401 },
              },
            });
          } else if (ctx.authorization.jwt !== "abc1234") {
            // FIXME:
            throw new GraphQLError(
              "Invalid user authorization token was provided",
              {
                extensions: {
                  code: "FORBIDDEN",
                  http: { status: 403 },
                },
              }
            );
          }

          return resolve(source, args, ctx, info);
        };
      }

      return fieldConfig;
    },
  });
}
