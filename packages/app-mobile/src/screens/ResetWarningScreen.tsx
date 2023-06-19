import { View } from "react-native";

import { UI_RPC_METHOD_USER_ACCOUNT_LOGOUT } from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";

import { WarningIcon } from "~components/Icon";
import {
  DangerButton,
  Header,
  Margin,
  Screen,
  SecondaryButton,
  SubtextParagraph,
  TwoButtonFooter,
} from "~components/index";

import { useSession } from "~src/lib/SessionProvider";

export function LogoutWarningScreen({ navigation }): JSX.Element {
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

export function ResetWarningScreen({ navigation }): JSX.Element {
  const { reset } = useSession();

  return (
    <Warning
      buttonTitle="Reset"
      title="Reset Backpack"
      subtext="This will remove all the user accounts you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      onNext={async () => {
        await reset();
      }}
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
  const navigation = useNavigation();
  const onPressCancel = () => {
    navigation.goBack();
  };

  return (
    <Screen
      style={{
        justifyContent: "space-between",
      }}
    >
      <View>
        <Margin vertical={24}>
          <View style={{ alignSelf: "center" }}>
            <WarningIcon />
          </View>
        </Margin>
        <Header text={title} />
        <SubtextParagraph>{subtext}</SubtextParagraph>
      </View>
      <TwoButtonFooter
        leftButton={<SecondaryButton label="Cancel" onPress={onPressCancel} />}
        rightButton={<DangerButton label={buttonTitle} onPress={onNext} />}
      />
    </Screen>
  );
}
