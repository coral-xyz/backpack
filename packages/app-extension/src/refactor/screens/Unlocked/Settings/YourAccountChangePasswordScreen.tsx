import { ChangePassword } from "../../../../components/Unlocked/Settings/YourAccount/ChangePassword";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function YourAccountChangePasswordScreen(
  props: SettingsScreenProps<Routes.YourAccountChangePasswordScreen>
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
  _props: SettingsScreenProps<Routes.YourAccountChangePasswordScreen>
) {
  return <ChangePassword />;
}
