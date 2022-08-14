import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { UI_RPC_METHOD_KEYRING_KEY_DELETE } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { SuccessIcon, WarningIcon } from "../../../../common/Icon";
import { SecondaryButton, PrimaryButton } from "../../../../common";

export const RemoveWallet: React.FC<{
  publicKey: string;
  name: string;
  type: string;
}> = ({ publicKey, name, type }) => {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const [showSuccess, setShowSuccess] = useState(false);

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
          marginTop: "45px",
          textAlign: "center",
        }}
      >
        {showSuccess ? (
          <SuccessIcon />
        ) : (
          <WarningIcon fill={theme.custom.colors.negative} />
        )}
        <Typography
          style={{
            fontWeight: 500,
            fontSize: "24px",
            lineHeight: "32px",
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          {showSuccess
            ? "Wallet removed"
            : `Are you sure you want to remove ${pubkeyStr}?`}
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
          {showSuccess ? (
            <>
              {type === "derived" ? (
                <>
                  This wallet is no longer available in Backpack, but can be
                  reaccessed by importing your secret recovery phrase in a new
                  Backpack.
                </>
              ) : type === "ledger" ? (
                <>
                  This wallet is no longer availble in Backpack, but can be
                  reaccessed by connecting your ledger again.
                </>
              ) : (
                <>This wallet is no longer available in Backpack.</>
              )}
            </>
          ) : (
            <>
              {type === "derived" ? (
                <>
                  Removing from Backpack will not delete the wallet’s contents.
                  It will still be available by importing your secret recovery
                  phrase in a new Backpack.
                </>
              ) : type === "ledger" ? (
                <>
                  Removing from Backpack will not delete the wallet’s contents.
                  It will still be available by connecting your ledger.
                </>
              ) : (
                <>
                  Removing from Backpack will delete the wallet’s keypair. Make
                  sure you have exported and saved the private key before
                  removing.
                </>
              )}
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
        {showSuccess ? (
          <PrimaryButton
            label={"Done"}
            onClick={() => {
              nav.pop();
            }}
          />
        ) : (
          <>
            <SecondaryButton
              label={"Cancel"}
              style={{ marginRight: "8px" }}
              onClick={() => nav.pop()}
            />
            <PrimaryButton
              label={"Remove"}
              style={{ backgroundColor: theme.custom.colors.negative }}
              onClick={() => {
                (async () => {
                  await background.request({
                    method: UI_RPC_METHOD_KEYRING_KEY_DELETE,
                    params: [publicKey],
                  });
                  setShowSuccess(true);
                })();
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
