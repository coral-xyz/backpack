import { UI_RPC_METHOD_USER_ACCOUNT_LOGOUT } from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  DangerButton,
  Screen,
  SecondaryButton,
  TwoButtonFooter,
} from "~components/index";

import { WarningHeader } from "~src/features/warning";
import { useSession } from "~src/lib/SessionProvider";

export function LogoutWarningScreen(): JSX.Element {
  const background = useBackgroundClient();
  const user = useUser();

  return (
    <Warning
      buttonTitle="Logout"
      title="Logout"
      subtext="This will remove all the wallets you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      onNext={async () => {
        await background.request({
          method: UI_RPC_METHOD_USER_ACCOUNT_LOGOUT,
          params: [user.uuid],
        });
      }}
    />
  );
}

export function ResetWarningScreen(): JSX.Element {
  const { reset } = useSession();

  return (
    <Warning
      buttonTitle="Reset"
      title="Reset Backpack"
      subtext="This will remove all the user accounts you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      onNext={reset}
    />
  );
}

function Warning({
  title,
  buttonTitle,
  subtext,
  onNext,
}: {
  title: string;
  buttonTitle: string;
  subtext: string;
  onNext: () => void;
}): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const onPressCancel = () => {
    navigation.goBack();
  };

  return (
    <Screen jc="space-between" style={{ marginBottom: insets.bottom }}>
      <WarningHeader title={title} subtitle={subtext} />
      <TwoButtonFooter
        leftButton={<SecondaryButton label="Cancel" onPress={onPressCancel} />}
        rightButton={<DangerButton label={buttonTitle} onPress={onNext} />}
      />
    </Screen>
  );
}
