import { useEffect } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  BackpackMnemonicIcon,
  HardwareIcon,
  LaunchDetail,
  MnemonicIcon,
  PushDetail,
  SecretKeyIcon,
} from "@coral-xyz/react-common";
import {
  useEnabledBlockchains,
  useKeyringHasMnemonic,
  useUser,
} from "@coral-xyz/recoil";
import { Box } from "@mui/material";

import { Header, SubtextParagraph } from "../../../common";
import { useNavigation } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function ImportMenu({ blockchain }: { blockchain: Blockchain }) {
  const navigation = useNavigation();
  const hasMnemonic = useKeyringHasMnemonic();
  const user = useUser();
  const enabledBlockchains = useEnabledBlockchains();
  const keyringExists = enabledBlockchains.includes(blockchain);
  const { t } = useTranslation();

  useEffect(() => {
    const prevTitle = navigation.title;
    navigation.setOptions({ headerTitle: "" });
    return () => {
      navigation.setOptions({ headerTitle: prevTitle });
    };
  }, [navigation]);

  const importMenu = {
    ...(hasMnemonic
      ? {
          [t("backpack_recovery_phrase")]: {
            onClick: () =>
              navigation.push("import-from-mnemonic", {
                blockchain,
                keyringExists,
                inputMnemonic: false,
              }),
            icon: (props: any) => <BackpackMnemonicIcon {...props} />,
            detail: <PushDetail />,
          },
        }
      : {}),
    [t("other_recovery_phrase")]: {
      onClick: () =>
        navigation.push("import-from-mnemonic", {
          blockchain,
          keyringExists,
          inputMnemonic: true,
        }),
      icon: (props: any) => <MnemonicIcon {...props} />,
      detail: <PushDetail />,
    },
    [t("private_key")]: {
      onClick: () => navigation.push("import-from-secret-key", { blockchain }),
      icon: (props: any) => <SecretKeyIcon {...props} />,
      detail: <PushDetail />,
    },
    [t("hardware_wallet")]: {
      onClick: () => {
        navigation.push("import-from-mnemonic", {
          blockchain,
          keyringExists,
          inputMnemonic: false,
          ledger: true,
        });
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
