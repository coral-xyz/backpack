import { mergeDeepRight } from "rambda";

export const apiResponse = (body: any, opts = {}) =>
  new Response(
    String(body),
    mergeDeepRight(
      {
        status: 200,
        headers: {
          "access-control-allow-origin": "*",
        },
      },
      opts
    )
  );
