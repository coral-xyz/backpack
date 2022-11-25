import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";
import { AUTH_JWT_PUBLIC_KEY } from "../config";
const alg = "RS256";

export const extractUserId = async (req, res, next) => {
  const {
    headers: { cookie },
  } = req;
  if (cookie) {
    let jwt;
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
      req.id = payloadRes.payload.id;
      next();
    } else {
      return res.status(403).json({ msg: "No id found" });
    }
  } else {
    return res.status(403).json({ msg: "No cookie present" });
  }
};
