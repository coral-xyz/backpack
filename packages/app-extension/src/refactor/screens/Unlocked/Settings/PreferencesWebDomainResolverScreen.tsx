import { PreferencesDomainResolverContent } from "../../../../components/Unlocked/Settings/Preferences/WebDomainResolver";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesWebDomainResolverScreen(
  props: SettingsScreenProps<Routes.PreferencesWebDomainResolverScreen>
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

// TODO: Inherit from other screens??
function Loading() {
  return null;
}

function Container(
  _props: SettingsScreenProps<Routes.PreferencesWebDomainResolverScreen>
) {
  return <PreferencesDomainResolverContent />;
}
