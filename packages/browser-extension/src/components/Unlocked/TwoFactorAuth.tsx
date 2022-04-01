import { toDataURL } from "qrcode";
import { authenticator } from "@otplib/preset-default";
import { useEffect, useState } from "react";

export const TwoFactorAuth = () => {
  const [code, setCode] = useState<string>();

  useEffect(() => {
    const otpauth = authenticator.keyuri(
      "PLACEHOLDER_ID",
      "Anchor Wallet",
      authenticator.generateSecret()
    );

    toDataURL(otpauth, (err, imageUrl) => {
      if (err) {
        console.error({ "qr code error": err });
      } else {
        setCode(imageUrl);
      }
    });
  }, []);

  return code ? (
    <img src={code} style={{ width: "100%" }} alt="two factor auth qr code" />
  ) : null;
};
