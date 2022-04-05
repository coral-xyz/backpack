import { decode } from "bs58";
import { sign } from "tweetnacl";
import { Buffer } from "buffer";
import { apiResponse } from "./utils";

export default {
  async fetch(request: Request) {
    try {
      return await handleRequest(request);
    } catch (e) {
      return apiResponse(e, { status: 500 });
    }
  },
};

const handleRequest = async (request: Request) => {
  const token = getToken(request);
  if (token && isValidToken(token)) {
    return apiResponse("ok");
  } else {
    throw new Error("missing or invalid token");
  }
};

/**
 * Gets token from authorization header or ?token= param
 * @param request HTTP Request instance
 * @returns token string
 */
const getToken = (request: Request) => {
  // todo: check if case-sensitive
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    return authHeader.match(/^Bearer (.*)$/)![1].trim();
  }
  return new URL(request.url).searchParams.get("token");
};

/**
 * Returns true/false indicating if provided token is valid
 * @param token
 * @returns
 */
const isValidToken = (token: string) => {
  // todo: check timestamp
  const { message, signature, address } = JSON.parse(
    Buffer.from(token, "base64").toString("utf8")
  );
  return sign.detached.verify(
    new TextEncoder().encode(message),
    decode(signature),
    decode(address)
  );
};
