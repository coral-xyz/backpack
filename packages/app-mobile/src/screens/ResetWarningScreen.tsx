import { View } from "react-native";
import {
  DangerButton,
  Header,
  Margin,
  Screen,
  SecondaryButton,
  SubtextParagraph,
} from "@components";
import { WarningIcon } from "@components/Icon";
import {
  UI_RPC_METHOD_KEYRING_RESET,
  UI_RPC_METHOD_USER_LOGOUT,
} from "@coral-xyz/common";
import { useBackgroundClient, useUser } from "@coral-xyz/recoil";
import { useNavigation } from "@react-navigation/native";

export function LogoutWarningScreen({ navigation }) {
  const background = useBackgroundClient();
  const user = useUser();

  return (
    <Warning
      buttonTitle={"Logout"}
      title={"Logout"}
      subtext={
        "This will remove all the wallets you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      }
      onNext={async () => {
        await background.request({
          method: UI_RPC_METHOD_USER_LOGOUT,
          params: [user.uuid],
        });
      }}
    />
  );
}

export function ResetWarningScreen({ navigation }) {
  const background = useBackgroundClient();

  return (
    <Warning
      buttonTitle={"Reset"}
      title={"Reset Backpack"}
      subtext={
        "This will remove all the user accounts you have created or imported. Make sure you have your existing secret recovery phrase and private keys saved."
      }
      onNext={async () => {
        await background.request({
          method: UI_RPC_METHOD_KEYRING_RESET,
          params: [],
        });
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
}) {
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <SecondaryButton label="Cancel" onPress={onPressCancel} />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <DangerButton label={buttonTitle} onPress={onNext} />
        </View>
      </View>
    </Screen>
  );
}
