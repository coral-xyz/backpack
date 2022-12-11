import { importSPKI, jwtVerify } from "jose";
import { AUTH_JWT_PUBLIC_KEY } from "../config";
const alg = "RS256";

export const extractUserId = async (jwt: string): string | null => {
  if (jwt) {
    const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, alg);
    const payloadRes = await jwtVerify(jwt, publicKey, {
      issuer: "auth.xnfts.dev",
      audience: "backpack",
    });
    if (payloadRes.payload.sub) {
      return payloadRes.payload.sub as string;
    } else {
      return null;
    }
  } else {
    return null;
  }
};
