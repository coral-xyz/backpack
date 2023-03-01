import { validateRoom } from "@coral-xyz/backend-common";
import {
  DEFAULT_GROUP_CHATS,
  WHITELISTED_CHAT_COLLECTIONS,
} from "@coral-xyz/common";
import type { NextFunction, Request, Response } from "express";

import { getActiveBarter } from "../db/barter";
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

export const ensureHasPubkeyAccessBody = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const hasAccess = await validatePublicKeyOwnership(
    req.id!,
    req.body.publicKey as string
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

export const ensureIsActiveBarter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const barterId: string = req.body.barterId;
  //@ts-ignore
  const room: string = req.query.room;
  const activeBarter = await getActiveBarter({
    roomId: room,
  });

  if (activeBarter?.id?.toString() !== barterId.toString()) {
    return res.status(403).json({ msg: "This isn't the active barter id" });
  }
  next();
};

export const extractUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let jwt = "";

  // Header takes precedence
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.split(" ")[0] === "Bearer") {
    jwt = authHeader.split(" ")[1];
  } else if (req.cookies.jwt) {
    jwt = req.cookies.jwt;
  } else if (req.query.jwt) {
    jwt = req.query.jwt as string;
  }

  if (jwt) {
    try {
      const payloadRes = await validateJwt(jwt);
      if (payloadRes.payload.sub) {
        // Extend cookie or set it if not set
        await setJWTCookie(req, res, payloadRes.payload.sub);
        // Set id on request
        req.id = payloadRes.payload.sub;
        // Set jwt  on request
        req.jwt = jwt;
      }
    } catch {
      clearCookie(res, "jwt");
      return res.status(403).json({ msg: "Auth error" });
    }
  } else {
    return res.status(403).json({ msg: "No authentication token found" });
  }

  next();
};
