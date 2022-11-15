import urlBase64 from "urlsafe-base64";
const MAX_EXPIRATION_SECONDS = 24 * 60 * 60;
import url from "url";
// @ts-ignore
import asn1 from "asn1.js";
import { webPushConstants } from "./web-push";
const DEFAULT_EXPIRATION_SECONDS = 12 * 60 * 60;
import jws from "jws";

export const getVapidHeaders = (
  audience: any,
  subject: any,
  publicKey: any,
  privateKey: any,
  contentEncoding: any,
  expiration?: any
) => {
  if (!audience) {
    throw new Error("No audience could be generated for VAPID.");
  }

  if (typeof audience !== "string" || audience.length === 0) {
    throw new Error(
      "The audience value must be a string containing the " +
        "origin of a push service. " +
        audience
    );
  }

  const audienceParseResult = url.parse(audience);
  if (!audienceParseResult.hostname) {
    throw new Error("VAPID audience is not a url. " + audience);
  }

  privateKey = urlBase64.decode(privateKey);

  if (expiration) {
    validateExpiration(expiration);
  } else {
    expiration = getFutureExpirationTimestamp(DEFAULT_EXPIRATION_SECONDS);
  }

  const header = {
    typ: "JWT",
    alg: "ES256",
  };

  const jwtPayload = {
    aud: audience,
    exp: expiration,
    sub: subject,
  };

  const jwt = jws.sign({
    //@ts-ignore
    header: header,
    payload: jwtPayload,
    privateKey: toPEM(privateKey),
  });

  if (
    contentEncoding === webPushConstants.supportedContentEncodings.AES_128_GCM
  ) {
    return {
      Authorization: "vapid t=" + jwt + ", k=" + publicKey,
    };
  }
  if (contentEncoding === webPushConstants.supportedContentEncodings.AES_GCM) {
    return {
      Authorization: "WebPush " + jwt,
      "Crypto-Key": "p256ecdsa=" + publicKey,
    };
  }

  throw new Error("Unsupported encoding type specified.");
};

function validateExpiration(expiration: any) {
  if (!Number.isInteger(expiration)) {
    throw new Error("`expiration` value must be a number");
  }

  if (expiration < 0) {
    throw new Error("`expiration` must be a positive integer");
  }

  // Roughly checks the time of expiration, since the max expiration can be ahead
  // of the time than at the moment the expiration was generated
  const maxExpirationTimestamp = getFutureExpirationTimestamp(
    MAX_EXPIRATION_SECONDS
  );

  if (expiration >= maxExpirationTimestamp) {
    throw new Error("`expiration` value is greater than maximum of 24 hours");
  }
}

function toPEM(key: any) {
  return ECPrivateKeyASN.encode(
    {
      version: 1,
      privateKey: key,
      parameters: [1, 2, 840, 10045, 3, 1, 7], // prime256v1
    },
    "pem",
    {
      label: "EC PRIVATE KEY",
    }
  );
}
function getFutureExpirationTimestamp(numSeconds: number) {
  const futureExp = new Date();
  futureExp.setSeconds(futureExp.getSeconds() + numSeconds);
  return Math.floor(futureExp.getTime() / 1000);
}

const ECPrivateKeyASN = asn1.define("ECPrivateKey", function () {
  //@ts-ignore
  const thisAny: any = this;
  thisAny
    .seq()
    .obj(
      thisAny.key("version").int(),
      thisAny.key("privateKey").octstr(),
      thisAny.key("parameters").explicit(0).objid().optional(),
      thisAny.key("publicKey").explicit(1).bitstr().optional()
    );
});
