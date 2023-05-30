import { useEffect } from "react";
import { EthereumConnectionUrl } from "@coral-xyz/common";
import { PushDetail } from "@coral-xyz/react-common";
import {
  useBackgroundClient,
  useEthereumConnectionUrl,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Check } from "@mui/icons-material";

import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";

import { changeNetwork } from "./common";

export function PreferencesEthereumConnection() {
  const { close } = useDrawerContext();
  const background = useBackgroundClient();
  const currentUrl = useEthereumConnectionUrl();
  const nav = useNavigation();

  useEffect(() => {
    nav.setOptions({ headerTitle: "RPC Connection" });
  }, [nav]);

  const menuItems = {
    Mainnet: {
      onClick: async () => {
        await changeNetwork(background, EthereumConnectionUrl.MAINNET, "0x1");
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.MAINNET ? <Checkmark /> : null,
    },
    "Görli Testnet": {
      onClick: async () => {
        await changeNetwork(background, EthereumConnectionUrl.GOERLI, "0x5");
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.GOERLI ? <Checkmark /> : null,
    },
    Localnet: {
      onClick: async () => {
        await changeNetwork(background, EthereumConnectionUrl.LOCALNET);
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.LOCALNET ? <Checkmark /> : null,
    },
    Custom: {
      onClick: () => nav.push("preferences-ethereum-edit-rpc-connection"),
      detail:
        currentUrl !== EthereumConnectionUrl.MAINNET &&
        currentUrl !== EthereumConnectionUrl.GOERLI &&
        currentUrl !== EthereumConnectionUrl.LOCALNET ? (
          <>
            <Checkmark /> <PushDetail />
          </>
        ) : (
          <PushDetail />
        ),
    },
  };
  return <SettingsList menuItems={menuItems} />;
}

function Checkmark() {
  const theme = useCustomTheme();
  return (
    <Check
      style={{
        color: theme.custom.colors.brandColor,
      }}
    />
  );
}
