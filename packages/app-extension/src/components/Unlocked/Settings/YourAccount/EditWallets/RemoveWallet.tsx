import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { formatWalletAddress } from "@coral-xyz/common";
import { WarningIcon } from "@coral-xyz/react-common";
import {
  secureUserAtom,
  useBackgroundClient,
  user,
  userClientAtom,
} from "@coral-xyz/recoil";
import {
  BpDangerButton,
  BpSecondaryButton,
  useTheme,
  XStack,
} from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";
import { useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";

import { Routes } from "../../../../../refactor/navigation/SettingsNavigator";

export const RemoveWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  type: string;
}> = ({ blockchain, publicKey, type }) => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const user = useRecoilValue(secureUserAtom);
  const userClient = useRecoilValue(userClientAtom);
  const [loading, setLoading] = useState(false);

  const onRemove = async () => {
    setLoading(true);

    userClient
      .removeWallet({
        uuid: user.user.uuid,
        blockchain,
        publicKey,
      })
      .then(() => {
        setLoading(false);
        navigation.popToTop(); // pop WalletDetails Screen to avoid race condition.
        navigation.navigate(Routes.WalletRemoveConfirmationScreen);
      })
      .catch(() => {
        setLoading(false);
      });
  };

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
          {`Are you sure you want to remove ${formatWalletAddress(publicKey)}?`}
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
              username and this public key. You can always add it back later by
              adding the wallet to Backpack.
            </>
          ) : (
            <>
              Removing from Backpack will delete the wallet’s keypair. Make sure
              you have exported and saved the private key before removing.
            </>
          )}
        </Typography>
      </div>
      <XStack space="$4" paddingHorizontal="$4">
        <BpSecondaryButton
          label="Cancel"
          flexBasis={0}
          onPress={() => navigation.goBack()}
        />
        <BpDangerButton
          label="Remove"
          flexBasis={0}
          onPress={onRemove}
          disabled={loading}
        />
      </XStack>
    </div>
  );
};
