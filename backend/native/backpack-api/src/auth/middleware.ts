import { Request, Response, NextFunction } from "express";
import { clearCookie, setCookie, validateJwt } from "./util";

export const extractUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      const payloadRes = await validateJwt(jwt);
      if (payloadRes.payload.sub) {
        // Extend cookie
        setCookie(req, res, payloadRes.payload.sub);
        // Set id on request
        req.id = payloadRes.payload.sub;
        next();
      } else {
        return res.status(403).json({ msg: "No id found" });
      }
    } catch (e) {
      clearCookie(res, "jwt");
      return res.status(403).json({ msg: "Auth error" });
    }
  } else {
    return res.status(403).json({ msg: "No cookie present" });
  }
};

export const optionallyExtractUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      const payloadRes = await validateJwt(jwt);
      if (payloadRes.payload.sub) {
        // Extend cookie
        setCookie(req, res, payloadRes.payload.sub);
        // Set id on request
        req.id = payloadRes.payload.sub;
      }
    } catch {
      clearCookie(res, "jwt");
    }
  }
  next();
};
