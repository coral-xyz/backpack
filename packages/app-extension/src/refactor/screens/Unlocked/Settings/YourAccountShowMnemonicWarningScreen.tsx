import { ShowRecoveryPhraseWarning } from "../../../../components/Unlocked/Settings/YourAccount/ShowRecoveryPhrase";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function YourAccountShowMnemonicWarningScreen(
  props: SettingsScreenProps<Routes.YourAccountShowMnemonicWarningScreen>
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container(
  _props: SettingsScreenProps<Routes.YourAccountShowMnemonicWarningScreen>
) {
  return <ShowRecoveryPhraseWarning />;
}
