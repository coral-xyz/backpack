import { PreferencesLanguage } from "../../../../components/Unlocked/Settings/Preferences/Language";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesLanguageScreen(
  props: SettingsScreenProps<Routes.PreferencesLanguageScreen>
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
  _props: SettingsScreenProps<Routes.PreferencesLanguageScreen>
) {
  return <PreferencesLanguage />;
}
