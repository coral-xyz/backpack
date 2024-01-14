import { PreferencesHiddenTokens } from "../../../../components/Unlocked/Settings/Preferences/HiddenTokens";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesHiddenTokensScreen(
  props: SettingsScreenProps<Routes.PreferencesHiddenTokensScreen>
) {
  return (
    <ScreenContainer loading={<Loading />} noScrollbar>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container(
  _props: SettingsScreenProps<Routes.PreferencesHiddenTokensScreen>
) {
  return <PreferencesHiddenTokens />;
}
