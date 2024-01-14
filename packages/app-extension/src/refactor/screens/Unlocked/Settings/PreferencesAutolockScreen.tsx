import { PreferencesAutoLock } from "../../../../components/Unlocked/Settings/Preferences/AutoLock";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function PreferencesAutolockScreen(
  props: SettingsScreenProps<Routes.PreferencesAutolockScreen>
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
  _props: SettingsScreenProps<Routes.PreferencesAutolockScreen>
) {
  return <PreferencesAutoLock />;
}
