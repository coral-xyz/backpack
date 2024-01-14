import { type Blockchain, openConnectHardware } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  BackpackMnemonicIcon,
  HardwareIcon,
  LaunchDetail,
  MnemonicIcon,
  PushDetail,
  SecretKeyIcon,
} from "@coral-xyz/react-common";
import { useKeyringHasMnemonic, useUser } from "@coral-xyz/recoil";
import { Box } from "@mui/material";
import { useNavigation } from "@react-navigation/native";

import { Routes } from "../../../../refactor/navigation/SettingsNavigator";
import { Header, SubtextParagraph } from "../../../common";
import { SettingsList } from "../../../common/Settings/List";

export function ImportMenu({ blockchain }: { blockchain: Blockchain }) {
  const navigation = useNavigation<any>();
  const hasMnemonic = useKeyringHasMnemonic();
  const user = useUser();
  const { t } = useTranslation();

  const importMenu = {
    ...(hasMnemonic
      ? {
          [t("backpack_recovery_phrase")]: {
            onClick: () =>
              navigation.push(Routes.WalletAddBackpackRecoveryPhraseScreen, {
                blockchain,
              }),
            icon: (props: any) => <BackpackMnemonicIcon {...props} />,
            detail: <PushDetail />,
          },
        }
      : {}),
    [t("other_recovery_phrase")]: {
      onClick: () =>
        navigation.push(Routes.WalletAddDeriveRecoveryPhraseScreen, {
          blockchain,
        }),
      icon: (props: any) => <MnemonicIcon {...props} />,
      detail: <PushDetail />,
    },
    [t("private_key")]: {
      onClick: () =>
        navigation.push(Routes.WalletAddPrivateKeyScreen, { blockchain }),
      icon: (props: any) => <SecretKeyIcon {...props} />,
      detail: <PushDetail />,
    },
    [t("hardware_wallet")]: {
      onClick: () => {
        navigation.popToTop();
        navigation.popToTop();
        navigation.popToTop();
        openConnectHardware();
        // navigation.push(Routes.WalletAddHardwareScreen, {
        //   blockchain,
        // });
      },
      icon: (props: any) => <HardwareIcon {...props} />,
      detail: <LaunchDetail />,
    },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ margin: "24px" }}>
        <Header text="Import a wallet" />
        <SubtextParagraph>
          Import a wallet to {user.username} on Backpack using one of the
          following:
        </SubtextParagraph>
      </Box>
      <SettingsList menuItems={importMenu} />
    </div>
  );
}
