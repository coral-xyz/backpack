import { Logout } from "../../../../components/Locked/Reset/ResetWarning";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function YourAccountRemoveScreen(
  props: SettingsScreenProps<Routes.YourAccountRemoveScreen>
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
  _props: SettingsScreenProps<Routes.YourAccountRemoveScreen>
) {
  return <Logout />;
}
