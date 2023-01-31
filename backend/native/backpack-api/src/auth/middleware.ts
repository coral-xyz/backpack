import { DEFAULT_GROUP_CHATS } from "@coral-xyz/common";
import { WHITELISTED_CHAT_COLLECTIONS } from "@coral-xyz/common/src/constants";
import type { NextFunction, Request, Response } from "express";

import { validateRoom } from "../db/friendships";
import {
  validateCentralizedGroupOwnership,
  validateCollectionOwnership,
  validatePublicKeyOwnership,
} from "../db/nft";

import { clearCookie, setJWTCookie, validateJwt } from "./util";

export const ensureHasPubkeyAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const hasAccess = await validatePublicKeyOwnership(
    req.id!,
    req.query.publicKey as string
  );
  if (hasAccess) {
    next();
    return;
  }
  res.status(403).json({ msg: "You dont have access to this public key" });
};

export const ensureHasRoomAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore
  const room: string = req.query.room;
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
    let hasAccess = false;
    if (DEFAULT_GROUP_CHATS.map((x) => x.id).includes(room)) {
      hasAccess = true;
    } else if (WHITELISTED_CHAT_COLLECTIONS.map((x) => x.id).includes(room)) {
      hasAccess = await validateCentralizedGroupOwnership(req.id!, room!);
    } else {
      hasAccess = await validateCollectionOwnership(req.id!, room!);
    }
    if (hasAccess) {
      // @ts-ignore
      req.roomMetadata = {};
      next();
    } else {
      return res.status(403).json({ msg: "you dont have access" });
    }
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
        setJWTCookie(req, res, payloadRes.payload.sub);
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
          setJWTCookie(req, res, payloadRes.payload.sub);
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
