import type { NextFunction, Request, Response } from "express";

import { validateRoom } from "../db/friendships";

import { clearCookie, setCookie, validateJwt } from "./util";

export const ensureHasRoomAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const room = req.query.room;
  const type = req.query.type;
  if (type === "individual") {
    const roomMetadata = await validateRoom(req.id!, room);
    if (roomMetadata) {
      // @ts-ignore
      req.roomMetadata = roomMetadata;
      next();
    } else {
      return res.status(403).json({ msg: "you dont have access" });
    }
  } else {
    // TODO: auth check for collection post #1589
    next();
  }
};

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

export const optionallyExtractUserId = (allowQueryString: boolean) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const {
      headers: { cookie },
    } = req;

    let jwt = "";

    // Header takes precedence
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.split(" ")[0] === "Bearer") {
      jwt = authHeader.split(" ")[1];
    } else if (cookie) {
      // Extract JWT from cookie
      try {
        cookie.split(";").forEach((item) => {
          const cookie = item.trim().split("=");
          if (cookie[0] === "jwt") {
            jwt = cookie[1];
          }
        });
      } catch {
        // Pass
      }
    } else if (req.query.jwt && allowQueryString) {
      jwt = req.query.jwt as string;
    }

    if (jwt) {
      try {
        const payloadRes = await validateJwt(jwt);
        if (payloadRes.payload.sub) {
          // Extend cookie or set it if not set
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
};
