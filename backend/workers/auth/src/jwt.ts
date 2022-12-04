import type { Context } from "hono";
import { importPKCS8, SignJWT } from "jose";

export const alg = "RS256";

const cookieDomain = (url: string) => {
  const { hostname } = new URL(url);
  // note:  the leading . below is significant, as it
  //        enables us to use the cookie on subdomains
  return hostname === "localhost" ? hostname : ".xnfts.dev";
};

export const clearCookie = (c: Context<any>, cookieName: string) => {
  c.res.headers.set(
    "set-cookie",
    `${cookieName}=; path=/; domain=${cookieDomain(
      c.req.url
    )}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
};

export const jwt = async (
  c: Context<any>,
  user: { id: unknown; username: unknown }
) => {
  const secret = await importPKCS8(c.env.AUTH_JWT_PRIVATE_KEY, alg);

  const _jwt = await new SignJWT({
    sub: String(user.id),
    username: user.username,
  })
    .setProtectedHeader({ alg })
    .setIssuer("auth.xnfts.dev")
    .setAudience("backpack")
    .setIssuedAt()
    .sign(secret);

  c.cookie("jwt", _jwt, {
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
    domain: cookieDomain(c.req.url),
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // approx 1 year
  });

  return c.json({ id: user.id, msg: "ok" });
};
