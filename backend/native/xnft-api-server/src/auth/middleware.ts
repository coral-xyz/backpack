import { Errors } from "../errors";
import nacl from "tweetnacl";
import bs58 from "bs58";

export const xnftMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  const xnftAddress = authorizationHeader?.split(" ")?.[1];
  if (!xnftAddress) {
    return res.status(403).json({ msg: Errors.AUTH_ERROR });
  }
  req.xnftAddress = xnftAddress;
  next();
};

export const authMiddleware = (req, res, next) => {
  next();
};

export const authSignatureMiddleware = (req, res, next) => {
  const timestamp = req.body.timestamp;
  const signature = req.body.signature;
  const publicKey = req.body.publicKey;

  if (
    timestamp < new Date().getTime() ||
    timestamp > new Date().getTime() + 60 * 1000
  ) {
    return res.status(403).json({ msg: "Expired message, please try again" });
  }
  const message = `You are trying to log into Backpack at ${timestamp}`;

  try {
    const verified = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(publicKey)
    );
    if (!verified) {
      throw new Error("Signature verification failed");
    }
  } catch (e) {
    return res.status(403).json({ msg: "Signature verification failed" });
  }
  req.publicKey = publicKey;
  next();
};
