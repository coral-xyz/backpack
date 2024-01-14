import { useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { UI_RPC_METHOD_KEYNAME_UPDATE } from "@coral-xyz/common";
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
import { useNavigation } from "@react-navigation/native";

export const RenameWallet: React.FC<{
  publicKey: string;
  name: string;
  blockchain: Blockchain;
}> = ({ publicKey, name, blockchain }) => {
  const [walletName, setWalletName] = useState(name);
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const background = useBackgroundClient();

  const cancel = () => {
    navigation.goBack();
  };

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    navigation.popToTop();
    navigation.popToTop();

    // Use a timeout to not screw up the navigator animation.
    setTimeout(async () => {
      // ph101pp todo
      await background.request({
        method: UI_RPC_METHOD_KEYNAME_UPDATE,
        params: [publicKey, walletName, blockchain],
      });
    }, 500);
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
