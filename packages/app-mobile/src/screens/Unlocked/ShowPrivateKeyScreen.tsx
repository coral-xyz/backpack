import { View } from "react-native";

import { UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { YStack } from "@coral-xyz/tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EyeIcon } from "~components/Icon";
import {
  CopyButton,
  HeaderIconSubtitle,
  Screen,
  StyledTextInput,
} from "~components/index";

import {
  UnlockPasswordOrBiometrics,
  WarningHeader,
  WarningList,
} from "~src/features/warning";

const warnings = [
  {
    icon: "chat",
    text: "Backpack support will never ask for your private key.",
  },
  {
    icon: "web",
    text: "Never share your private key or enter it into an app or website.",
  },
  {
    icon: "lock",
    text: "Anyone with your private key will have complete control of your account.",
  },
];

export function ShowPrivateKeyWarningScreen({
  route,
  navigation,
}): JSX.Element {
  const { publicKey } = route.params;
  const insets = useSafeAreaInsets();
  const background = useBackgroundClient();

  const onSubmit = async ({ password }: { password: string }) => {
    const privateKey = await background.request({
      method: UI_RPC_METHOD_KEYRING_EXPORT_SECRET_KEY,
      params: [password, publicKey],
    });

    navigation.push("show-private-key", { privateKey });
  };

  return (
    <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
      <View>
        <WarningHeader />
        <WarningList warnings={warnings} />
      </View>
      <UnlockPasswordOrBiometrics
        label="Show private key"
        onMaybeUnlock={onSubmit}
      />
    </Screen>
  );
}

export function ShowPrivateKeyScreen({ route }): JSX.Element {
  const { privateKey } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
      <YStack>
        <HeaderIconSubtitle
          icon={<EyeIcon />}
          title="Private key"
          subtitle="Never give out your private key"
        />
        <StyledTextInput
          hasError={false}
          style={{ height: 90 }}
          multiline
          value={privateKey}
          editable={false}
        />
      </YStack>
      <CopyButton text={privateKey} />
    </Screen>
  );
}
