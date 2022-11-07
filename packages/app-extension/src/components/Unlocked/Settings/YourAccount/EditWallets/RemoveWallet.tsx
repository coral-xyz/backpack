import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
  UI_RPC_METHOD_KEYRING_KEY_DELETE,
} from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  useActiveWallets,
  useBackgroundClient,
  useWalletPublicKeys,
} from "@coral-xyz/recoil";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { WithMiniDrawer } from "../../../../common/Layout/Drawer";
import { CheckIcon, WarningIcon } from "../../../../common/Icon";
import { SecondaryButton, PrimaryButton } from "../../../../common";

export const RemoveWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  type: string;
}> = ({ blockchain, publicKey, type }) => {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const activeWallets = useActiveWallets();
  const wallet = activeWallets.find((w) => w.blockchain === blockchain);
  const blockchainKeyrings = useWalletPublicKeys();
  const keyring = blockchainKeyrings[blockchain];
  const flattenedWallets = [
    ...keyring.hdPublicKeys,
    ...keyring.importedPublicKeys,
    ...keyring.ledgerPublicKeys,
  ];

  useEffect(() => {
    nav.setTitle("Remove Wallet");
  }, [nav]);

  const pubkeyStr =
    publicKey.slice(0, 4) + "..." + publicKey.slice(publicKey.length - 4);

  return (
    <>
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
          <WarningIcon fill={theme.custom.colors.negative} />
          <Typography
            style={{
              fontWeight: 500,
              fontSize: "24px",
              lineHeight: "32px",
              textAlign: "center",
              marginTop: "30px",
              color: theme.custom.colors.fontColor,
            }}
          >
            {`Are you sure you want to remove ${pubkeyStr}?`}
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
                Removing from Backpack will delete the wallet’s keypair. Make
                sure you have exported and saved the private key before
                removing.
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
            onClick={() => {
              (async () => {
                if (wallet?.publicKey.toString() === publicKey.toString()) {
                  const newActiveWalletPubkey = flattenedWallets.find(
                    (wallet) =>
                      wallet.publicKey.toString() !== publicKey.toString()
                  )?.publicKey;
                  if (newActiveWalletPubkey) {
                    await background.request({
                      method: UI_RPC_METHOD_KEYRING_ACTIVE_WALLET_UPDATE,
                      params: [newActiveWalletPubkey, blockchain],
                    });
                  }
                }
                await background.request({
                  method: UI_RPC_METHOD_KEYRING_KEY_DELETE,
                  params: [blockchain, publicKey],
                });
                setShowSuccess(true);
              })();
            }}
          />
        </div>
      </div>
      <WithMiniDrawer
        openDrawer={showSuccess}
        setOpenDrawer={setShowSuccess}
        backdropProps={{
          style: {
            opacity: 0.8,
            background: "#18181b",
          },
        }}
        onClose={() => {
          setShowSuccess(false);
          nav.pop(2);
        }}
      >
        <div
          style={{
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            height: "100%",
            background: theme.custom.colors.background,
          }}
        >
          <div
            style={{
              height: "100%",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              background: theme.custom.colors.drawerGradient,
              paddingTop: "32px",
              paddingBottom: "16px",
              paddingLeft: "16px",
              paddingRight: "16px",
            }}
          >
            <div
              style={{
                marginLeft: "36px",
                marginRight: "36px",
                textAlign: "center",
              }}
            >
              <CheckIcon />
            </div>
            <div>
              <Typography
                style={{
                  fontWeight: 500,
                  fontSize: "24px",
                  lineHeight: "32px",
                  textAlign: "center",
                  marginTop: "16px",
                  marginBottom: "32px",
                  color: theme.custom.colors.fontColor,
                }}
              >
                Wallet removed
              </Typography>
              <PrimaryButton
                label={"Done"}
                onClick={() => {
                  nav.pop(2);
                }}
              />
            </div>
          </div>
        </div>
      </WithMiniDrawer>
    </>
  );
};
