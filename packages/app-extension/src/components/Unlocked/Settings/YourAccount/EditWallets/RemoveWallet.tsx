import React, { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  formatWalletAddress,
  UI_RPC_METHOD_KEYRING_KEY_DELETE,
} from "@coral-xyz/common";
import { CheckIcon, WarningIcon } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  BpDangerButton,
  BpPrimaryButton,
  BpSecondaryButton,
  useTheme,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";

import { WithMiniDrawer } from "../../../../common/Layout/Drawer";
import { useNavigation } from "../../../../common/Layout/NavStack";

export const RemoveWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  type: string;
}> = ({ blockchain, publicKey, type }) => {
  const theme = useTheme();
  const nav = useNavigation();
  const background = useBackgroundClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  blockchain;
  background;
  useEffect(() => {
    nav.setOptions({ headerTitle: "Remove Wallet" });
  }, [nav]);
  theme;
  const onRemove = async () => {
    setLoading(true);

    // ph101pp todo
    background
      .request({
        method: UI_RPC_METHOD_KEYRING_KEY_DELETE,
        params: [blockchain, publicKey],
      })
      .then(() => {
        setLoading(false);
        setShowSuccess(true);
      })
      .catch(() => {
        setLoading(false);
      });
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
          <WarningIcon fill={theme.redText.val} />
          <Typography
            style={{
              fontWeight: 500,
              fontSize: "24px",
              lineHeight: "32px",
              textAlign: "center",
              marginTop: "30px",
              color: theme.baseTextHighEmphasis.val,
            }}
          >
            {`Are you sure you want to remove ${formatWalletAddress(
              publicKey
            )}?`}
          </Typography>
          <Typography
            style={{
              textAlign: "center",
              color: theme.baseTextMedEmphasis.val,
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
        <XStack space="$4" paddingHorizontal="$4">
          <BpSecondaryButton
            label="Cancel"
            flexBasis={0}
            onPress={() => nav.pop()}
          />
          <BpDangerButton
            label="Remove"
            flexBasis={0}
            onPress={onRemove}
            disabled={loading}
          />
        </XStack>
      </div>
      <WithMiniDrawer
        openDrawer={showSuccess}
        setOpenDrawer={setShowSuccess}
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
          }}
        >
          <div
            style={{
              height: "100%",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
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
            <YStack>
              <Typography
                style={{
                  fontWeight: 500,
                  fontSize: "24px",
                  lineHeight: "32px",
                  textAlign: "center",
                  marginTop: "16px",
                  marginBottom: "32px",
                  color: theme.baseTextHighEmphasis.val,
                }}
              >
                Wallet removed
              </Typography>
              <BpPrimaryButton
                label="Done"
                onPress={() => {
                  nav.pop(2);
                }}
              />
            </YStack>
          </div>
        </div>
      </WithMiniDrawer>
    </>
  );
};
