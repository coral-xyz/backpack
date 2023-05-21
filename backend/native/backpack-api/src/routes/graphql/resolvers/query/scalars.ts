import { GraphQLScalarType } from "graphql";

/**
 * Custom `JSONObject` scalar implementation for parsing arbitrary data objects.
 * @export
 */
export const jsonObjectScalar = new GraphQLScalarType({
  name: "JSONObject",
  serialize(value) {
    if (typeof value === "string") {
      if (value.startsWith("{") && value.endsWith("}")) {
        return JSON.parse(value);
      }
      return { data: value };
    } else if (typeof value !== "object" || value === null) {
      throw new TypeError(
        `JSONObject cannot represent non-object value: ${value}`
      );
    }
    return value;
  },
});
