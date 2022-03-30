import { toDataURL } from "qrcode";
import { authenticator } from "@otplib/preset-default";
import { useEffect, useState } from "react";
import { useActiveWallet } from "../../hooks/useWallet";

export const TwoFactorAuth = () => {
  const [code, setCode] = useState<string>();
  const activeWallet = useActiveWallet();

  useEffect(() => {
    const otpauth = authenticator.keyuri(
      activeWallet.publicKey.toString(),
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
