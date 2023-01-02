import bs58 from "bs58";
import nacl from "tweetnacl";

import { fetchXnftFromSecret } from "../db/xnftSecrets";
import { Errors } from "../errors";

export const xnftMiddleware = async (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  const xnftSecret = authorizationHeader?.split(" ")?.[1];
  if (!xnftSecret) {
    return res.status(403).json({ msg: Errors.AUTH_ERROR });
  }

  const xnftAddress = await fetchXnftFromSecret(xnftSecret);
  if (xnftAddress) {
    req.xnftAddress = xnftAddress;
    next();
  } else {
    return res.status(403).json({ msg: Errors.NO_XNFT_FOUND });
  }
};

export const authMiddleware = (req, res, next) => {
  next();
};

export const authSignatureMiddleware = (req, res, next) => {
  const timestamp = req.body.timestamp;
  const signature = req.body.signature;
  const publicKey = req.body.publicKey;

  if (
    timestamp > new Date().getTime() ||
    timestamp > new Date().getTime() + 360 * 1000
  ) {
    return res.status(403).json({ msg: "Expired timestamp, please try again" });
  }
  const message = `You are trying to log into Backpack at ${timestamp}`;

  try {
    const verified = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      new Uint8Array(signature),
      bs58.decode(publicKey)
    );
    if (!verified) {
      throw new Error("Signature verification failed");
    }
  } catch (e) {
    console.log(e);
    return res.status(403).json({ msg: "Signature verification failed" });
  }
  req.publicKey = publicKey;
  next();
};
