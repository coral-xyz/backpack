import React, { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  formatWalletAddress,
  UI_RPC_METHOD_KEYRING_KEY_DELETE,
  UI_RPC_METHOD_USER_ACCOUNT_PUBLIC_KEY_DELETE,
} from "@coral-xyz/common";
import {
  CheckIcon,
  PrimaryButton,
  SecondaryButton,
  WarningIcon,
} from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";

import { WithMiniDrawer } from "../../../../common/Layout/Drawer";
import { useNavigation } from "../../../../common/Layout/NavStack";

export const RemoveWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  type: string;
}> = ({ blockchain, publicKey, type }) => {
  const theme = useCustomTheme();
  const nav = useNavigation();
  const background = useBackgroundClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    nav.setOptions({ headerTitle: "Remove Wallet" });
  }, [nav]);

  const onRemove = async () => {
    setLoading(true);
    if (type === "dehydrated") {
      await background.request({
        method: UI_RPC_METHOD_USER_ACCOUNT_PUBLIC_KEY_DELETE,
        params: [blockchain, publicKey],
      });
    } else {
      await background.request({
        method: UI_RPC_METHOD_KEYRING_KEY_DELETE,
        params: [blockchain, publicKey],
      });
    }
    setLoading(false);
    setShowSuccess(true);
  };

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
            {`Are you sure you want to remove ${formatWalletAddress(
              publicKey
            )}?`}
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
            ) : type === "dehydrated" ? (
              <>
                Removing from Backpack will remove the connection between your
                username and this public key. You can always add it back later
                by adding the wallet to Backpack.
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
            label="Cancel"
            style={{ marginRight: "8px" }}
            onClick={() => nav.pop()}
          />
          <PrimaryButton
            label="Remove"
            style={{ backgroundColor: theme.custom.colors.negative }}
            onClick={onRemove}
            disabled={loading}
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
                label="Done"
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
