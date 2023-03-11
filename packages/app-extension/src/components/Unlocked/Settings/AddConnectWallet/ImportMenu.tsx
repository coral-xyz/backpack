import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  openConnectHardware,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
} from "@coral-xyz/common";
import {
  BackpackMnemonicIcon,
  HardwareIcon,
  MnemonicIcon,
  PushDetail,
  SecretKeyIcon,
} from "@coral-xyz/react-common";
import {
  useBackgroundClient,
  useKeyringHasMnemonic,
  useUser,
} from "@coral-xyz/recoil";
import { Box } from "@mui/material";

import { Header, SubtextParagraph } from "../../../common";
import { useNavigation } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function ImportMenu({ blockchain }: { blockchain: Blockchain }) {
  const navigation = useNavigation();
  const background = useBackgroundClient();
  const hasMnemonic = useKeyringHasMnemonic();
  const user = useUser();
  const [keyringExists, setKeyringExists] = useState(false);

  useEffect(() => {
    const prevTitle = navigation.title;
    navigation.setOptions({ headerTitle: "" });
    return () => {
      navigation.setOptions({ headerTitle: prevTitle });
    };
  }, [navigation]);

  useEffect(() => {
    (async () => {
      const blockchainKeyrings = await background.request({
        method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
        params: [],
      });
      setKeyringExists(blockchainKeyrings.includes(blockchain));
    })();
  }, [background, blockchain]);

  const importMenu = {
    ...(hasMnemonic
      ? {
          "Backpack recovery phrase": {
            onClick: () =>
              navigation.push("import-from-mnemonic", {
                blockchain,
                keyringExists,
                inputMnemonic: false,
              }),
            icon: (props: any) => <BackpackMnemonicIcon {...props} />,
            detailIcon: <PushDetail />,
          },
        }
      : {}),
    "Other recovery phrase": {
      onClick: () =>
        navigation.push("import-from-mnemonic", {
          blockchain,
          keyringExists,
          inputMnemonic: true,
        }),
      icon: (props: any) => <MnemonicIcon {...props} />,
      detailIcon: <PushDetail />,
    },
    "Hardware wallet": {
      onClick: () => {
        openConnectHardware(blockchain, "import");
        window.close();
      },

      icon: (props: any) => <HardwareIcon {...props} />,
      detailIcon: <PushDetail />,
    },
    "Private key": {
      onClick: () => navigation.push("import-from-secret-key", { blockchain }),
      icon: (props: any) => <SecretKeyIcon {...props} />,
      detailIcon: <PushDetail />,
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
          Import a wallet to @{user.username} on Backpack using one of the
          following:
        </SubtextParagraph>
      </Box>
      <SettingsList menuItems={importMenu} />
    </div>
  );
}
