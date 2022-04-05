import { authenticator } from "@otplib/preset-browser";
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
  const { searchParams } = new URL(request.url);
  const valid = authenticator.verify({
    token: searchParams.get("token")!,
    secret: searchParams.get("secret")!,
  });

  if (valid) {
    return apiResponse("ok");
  } else {
    throw new Error("missing or invalid token");
  }
};
