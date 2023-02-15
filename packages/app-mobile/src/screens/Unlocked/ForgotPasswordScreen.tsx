import { View } from "react-native";

import {
  DangerButton,
  Header,
  Margin,
  Screen,
  SecondaryButton,
  SubtextParagraph,
} from "~components/index";
import { KeyringStoreStateEnum, useKeyringStoreState } from "@coral-xyz/recoil";

import { QuestionIcon } from "~components/Icon";

export function ForgotPasswordScreen({ navigation }) {
  const keyringStoreState = useKeyringStoreState();
  const isLocked = keyringStoreState === KeyringStoreStateEnum.Locked;
  console.log("isLocked", isLocked);

  const onPressTryMore = () => {
    navigation.goBack();
  };

  const onPressReset = () => {
    navigation.navigate("reset-warning");
  };

  return (
    <Screen style={{ justifyContent: "space-between" }}>
      <View>
        <Margin vertical={12}>
          <View style={{ alignSelf: "center" }}>
            <QuestionIcon />
          </View>
        </Margin>
        <Header text="Forgot your password?" />
        <SubtextParagraph>
          We can’t recover your password as it is only stored on your computer.
          You can try more passwords or reset your wallet with the secret
          recovery phrase.
        </SubtextParagraph>
      </View>
      <View>
        <Margin bottom={16}>
          <SecondaryButton
            label="Try More Passwords"
            onPress={onPressTryMore}
          />
        </Margin>
        <DangerButton label="Reset Backpack" onPress={onPressReset} />
      </View>
    </Screen>
  );
}
