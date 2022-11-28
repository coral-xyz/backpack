import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";
import { AUTH_JWT_PUBLIC_KEY } from "../config";
const alg = "RS256";

export const extractUserId = async (req, res, next) => {
  const {
    headers: { cookie },
  } = req;
  if (cookie) {
    try {
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
      console.log(payloadRes);
      if (payloadRes.payload.sub) {
        req.id = payloadRes.payload.sub;
        next();
      } else {
        return res.status(403).json({ msg: "No id found" });
      }
    } catch (e) {
      return res.status(403).json({ msg: "Auth error" });
    }
  } else {
    return res.status(403).json({ msg: "No cookie present" });
  }
};
