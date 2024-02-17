import { PreferencesIpfsGateway } from "../../../../components/Unlocked/Settings/Preferences/WebDomainResolver/SwitchIpfsGateway";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesWebDomainResolverIpfsGatewayScreen(
  props: SettingsScreenProps<Routes.PreferencesWebDomainResolverIpfsGatewayScreen>
) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

// TODO: Inherit from other screens?
function Loading() {
  return null;
}

function Container(
  _props: SettingsScreenProps<Routes.PreferencesWebDomainResolverIpfsGatewayScreen>
) {
  return <PreferencesIpfsGateway />;
}
