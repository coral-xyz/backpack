import { Box } from "@coral-xyz/tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QuestionIcon } from "~components/Icon";
import {
  DangerButton,
  Header,
  Screen,
  SecondaryButton,
  SubtextParagraph,
} from "~components/index";

export function ForgotPasswordScreen({ navigation }): JSX.Element {
  const insets = useSafeAreaInsets();

  const onPressTryMore = () => {
    navigation.goBack();
  };

  const onPressReset = () => {
    navigation.navigate("reset-warning");
  };

  return (
    <Screen
      style={{ justifyContent: "space-between", marginBottom: insets.bottom }}
    >
      <Box>
        <Box my={24}>
          <Box als="center">
            <QuestionIcon />
          </Box>
        </Box>
        <Box mb={12}>
          <Header text="Forgot your password?" />
        </Box>
        <SubtextParagraph>
          We can’t recover your password as it is only stored on your computer.
          You can try more passwords or reset your wallet with the secret
          recovery phrase.
        </SubtextParagraph>
      </Box>
      <Box>
        <Box mb={16}>
          <SecondaryButton
            label="Try More Passwords"
            onPress={onPressTryMore}
          />
        </Box>
        <DangerButton label="Reset Backpack" onPress={onPressReset} />
      </Box>
    </Screen>
  );
}
