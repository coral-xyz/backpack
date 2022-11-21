import { Errors } from "../errors";

export const xnftMiddleware = (req, res, next) => {
  const authorizationHeader = req.headers["authorization"];
  const xnftAddress = authorizationHeader?.split(" ")?.[1];
  if (!xnftAddress) {
    return res.status(403).json({ msg: Errors.AUTH_ERROR });
  }
  req.xnftAddress = xnftAddress;
  next();
};
