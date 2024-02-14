import { ShowPrivateKeyWarning } from "../../../../components/Unlocked/Settings/YourAccount/ShowPrivateKey";
import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function WalletPrivateKeyWarningScreen(
  props: SettingsScreenProps<Routes.WalletPrivateKeyWarningScreen>
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

function Container({
  route: {
    params: { publicKey },
  },
}: SettingsScreenProps<Routes.WalletPrivateKeyWarningScreen>) {
  return <ShowPrivateKeyWarning publicKey={publicKey} />;
}
