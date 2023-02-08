import type { Request, Response } from "express";
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";

import { AUTH_JWT_PRIVATE_KEY, AUTH_JWT_PUBLIC_KEY } from "../config";

export const alg = "RS256";

export const validateJwt = async (jwt: string) => {
  const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, alg);
  return await jwtVerify(jwt, publicKey, {
    issuer: "auth.xnfts.dev",
    audience: "backpack",
  });
};

export const clearCookie = (res: Response, cookieName: string) => {
  res.clearCookie(cookieName);
};

export const setJWTCookie = async (
  req: Request,
  res: Response,
  userId: string
) => {
  const secret = await importPKCS8(AUTH_JWT_PRIVATE_KEY, alg);

  const jwt = await new SignJWT({
    sub: userId,
  })
    .setProtectedHeader({ alg })
    .setIssuer("auth.xnfts.dev")
    .setAudience("backpack")
    .setIssuedAt()
    .sign(secret);

  setCookieOnResponse(req, res, "jwt", jwt);

  return jwt;
};

export const setCookieOnResponse = (
  req: Request,
  res: Response,
  cookieName: string,
  cookieValue: string
) => {
  res.cookie(cookieName, cookieValue, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    // Note: the leading . below is significant, as it enables us to use the
    // cookie on subdomains
    domain: req.hostname.includes("localhost") ? "localhost" : ".xnfts.dev",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // approx 1 year
  });
};
