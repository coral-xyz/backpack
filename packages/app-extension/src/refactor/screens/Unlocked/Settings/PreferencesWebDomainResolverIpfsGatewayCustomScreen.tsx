import { PreferencesCustomIpfsGateway } from "../../../../components/Unlocked/Settings/Preferences/WebDomainResolver/CustomIpfsGateway";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesWebDomainResolverIpfsGatewayCustomScreen(
  props: SettingsScreenProps<Routes.PreferencesWebDomainResolverIpfsGatewayCustomScreen>
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
  _props: SettingsScreenProps<Routes.PreferencesWebDomainResolverIpfsGatewayCustomScreen>
) {
  return <PreferencesCustomIpfsGateway />;
}
