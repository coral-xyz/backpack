import { UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { Stack, YStack } from "@coral-xyz/tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EyeIcon } from "~components/Icon";
import {
  CopyButton,
  HeaderIconSubtitle,
  MnemonicInputFields,
  Screen,
} from "~components/index";

import {
  UnlockPasswordOrBiometrics,
  WarningHeader,
  WarningList,
} from "~src/features/warning";

const warnings = [
  {
    icon: "chat",
    text: "Backpack support will never ask for your secret phrase.",
  },
  {
    icon: "web",
    text: "Never share your secret phrase or enter it into an app or website.",
  },
  {
    icon: "lock",
    text: "Anyone with your secret phrase will have complete control of your account.",
  },
];

export function ShowRecoveryPhraseWarningScreen({ navigation }): JSX.Element {
  const insets = useSafeAreaInsets();
  const background = useBackgroundClient();

  const handlePressConfirm = async ({ password }: { password: string }) => {
    const mnemonic = await background.request({
      method: UI_RPC_METHOD_KEYRING_EXPORT_MNEMONIC,
      params: [password],
    });

    navigation.push("show-secret-phrase", { mnemonic });
  };

  return (
    <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
      <Stack>
        <WarningHeader />
        <WarningList warnings={warnings} />
      </Stack>
      <UnlockPasswordOrBiometrics
        label="Show secret phrase"
        onMaybeUnlock={handlePressConfirm}
      />
    </Screen>
  );
}

export function ShowRecoveryPhraseScreen({ route }): JSX.Element {
  const { mnemonic } = route.params;
  const insets = useSafeAreaInsets();
  const mnemonicWords = mnemonic.split(" ");

  return (
    <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
      <YStack>
        <HeaderIconSubtitle
          icon={<EyeIcon />}
          title="Recovery phrase"
          subtitle={`Use these ${mnemonicWords.length} words to recover your wallet`}
        />
        <MnemonicInputFields mnemonicWords={mnemonicWords} />
      </YStack>
      <CopyButton text={mnemonic} />
    </Screen>
  );
}
