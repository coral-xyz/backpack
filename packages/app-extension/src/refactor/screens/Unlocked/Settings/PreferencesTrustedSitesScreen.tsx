import { PreferencesTrustedSites } from "../../../../components/Unlocked/Settings/Preferences/TrustedSites";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesTrustedSitesScreen(
  props: SettingsScreenProps<Routes.PreferencesTrustedSitesScreen>
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
  _props: SettingsScreenProps<Routes.PreferencesTrustedSitesScreen>
) {
  return <PreferencesTrustedSites />;
}
