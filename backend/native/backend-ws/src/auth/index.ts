import { importSPKI, jwtVerify } from "jose";
import { AUTH_JWT_PUBLIC_KEY } from "../config";
const alg = "RS256";

export const extractUserId = async (cookie: string): string | null => {
  if (cookie) {
    let jwt = "";
    cookie.split(";").forEach((item) => {
      const cookie = item.trim().split("=");
      if (cookie[0] === "jwt") {
        jwt = cookie[1];
      }
    });
    const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, alg);
    const payloadRes = await jwtVerify(jwt, publicKey, {
      issuer: "auth.xnfts.dev",
      audience: "backpack",
    });
    if (payloadRes.payload.id) {
      return payloadRes.payload.id as string;
    } else {
      return null;
    }
  } else {
    return null;
  }
};
