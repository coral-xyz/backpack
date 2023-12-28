import React, { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { UI_RPC_METHOD_KEYNAME_UPDATE } from "@coral-xyz/common";
import {
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  BpInput,
  BpPrimaryButton,
  BpSecondaryButton,
  useTheme,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";

import { useNavigation } from "../../../../common/Layout/NavStack";

export const RenameWallet: React.FC<{
  publicKey: string;
  name: string;
  blockchain: Blockchain;
}> = ({ publicKey, name, blockchain }) => {
  const [walletName, setWalletName] = useState(name);
  const nav = useNavigation();
  const theme = useTheme();
  const background = useBackgroundClient();

  useEffect(() => {
    nav.setOptions({ headerTitle: "Rename Wallet" });
  }, [nav]);

  const cancel = () => {
    nav.pop();
  };

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // ph101pp todo
    await background.request({
      method: UI_RPC_METHOD_KEYNAME_UPDATE,
      params: [publicKey, walletName, blockchain],
    });
    nav.pop();
  };

  const pubkeyDisplay =
    publicKey.slice(0, 4) + "..." + publicKey.slice(publicKey.length - 4);
  const isPrimaryDisabled = walletName.trim() === "";

  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <YStack>
        <BpInput
          autoFocus
          value={walletName}
          onChangeText={(text) => setWalletName(text)}
          onSubmitEditing={() => save()}
        />
        <Typography
          style={{
            color: theme.baseTextMedEmphasis.val,
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          ({pubkeyDisplay})
        </Typography>
      </YStack>
      <XStack space="$4">
        <BpSecondaryButton
          flexBasis={0}
          label="Cancel"
          onPress={() => cancel()}
        />
        <BpPrimaryButton
          flexBasis={0}
          label="Set"
          onPress={() => save()}
          disabled={isPrimaryDisabled}
        />
      </XStack>
    </div>
  );
};
