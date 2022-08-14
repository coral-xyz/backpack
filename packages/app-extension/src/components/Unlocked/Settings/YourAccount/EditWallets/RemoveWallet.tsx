import React, { useEffect } from "react";
import { Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { WarningIcon } from "../../../../common/Icon";
import { SecondaryButton, PrimaryButton } from "../../../../common";

export const RemoveWallet: React.FC<{
  publicKey: string;
  name: string;
  type: string;
}> = ({ publicKey, name, type }) => {
  const theme = useCustomTheme();
  const nav = useNavStack();
  useEffect(() => {
    nav.setTitle("Remove Wallet");
  }, [nav]);
  const pubkeyStr =
    publicKey.slice(0, 4) + "..." + publicKey.slice(publicKey.length - 4);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        paddingBottom: "16px",
      }}
    >
      <div
        style={{
          marginLeft: "36px",
          marginRight: "36px",
        }}
      >
        <WarningIcon
          fill={theme.custom.colors.negative}
          style={{
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "45px",
          }}
        />
        <Typography
          style={{
            fontWeight: 500,
            fontSize: "24px",
            lineHeight: "32px",
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          Are you sure you want to remove {pubkeyStr}?
        </Typography>
        <Typography
          style={{
            textAlign: "center",
            color: theme.custom.colors.secondary,
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 500,
            marginTop: "8px",
          }}
        >
          {type === "derived" ? (
            <>
              Removing from Backpack will not delete the wallet’s contents. It
              will still be available by importing your secret recovery phrase
              in a new Backpack.
            </>
          ) : type === "ledger" ? (
            <>
              Removing from Backpack will not delete the wallet’s contents. It
              will still be available by connecting your ledger.
            </>
          ) : (
            <>
              Removing from Backpack will delete the wallet’s keypair. Make sure
              you have exported and saved the private key before removing.
            </>
          )}
        </Typography>
      </div>
      <div
        style={{
          display: "flex",
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        <SecondaryButton
          label={"Cancel"}
          style={{ marginRight: "8px" }}
          onClick={() => nav.pop()}
        />
        <PrimaryButton
          label={"Remove"}
          style={{ backgroundColor: theme.custom.colors.negative }}
          onClick={() => {}}
        />
      </div>
    </div>
  );
};
