import { useEffect } from "react";
import { Check } from "@mui/icons-material";
import { useCustomTheme } from "@coral-xyz/themes";
import { EthereumConnectionUrl } from "@coral-xyz/common";
import {
  useBackgroundClient,
  useEthereumConnectionUrl,
} from "@coral-xyz/recoil";
import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { SettingsList } from "../../../../common/Settings/List";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { PushDetail } from "../../../../common";
import { changeNetwork } from "./common";

export function PreferencesEthereumConnection() {
  const { close } = useDrawerContext();
  const background = useBackgroundClient();
  const currentUrl = useEthereumConnectionUrl();
  const nav = useNavStack();

  useEffect(() => {
    nav.setTitle("RPC Connection");
  }, [nav]);

  const menuItems = {
    Mainnet: {
      onClick: async () => {
        await changeNetwork(background, EthereumConnectionUrl.MAINNET, "0x1");
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.MAINNET ? <Checkmark /> : <></>,
    },
    "Görli Testnet": {
      onClick: async () => {
        await changeNetwork(background, EthereumConnectionUrl.GOERLI, "0x5");
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.GOERLI ? <Checkmark /> : <></>,
    },
    Localnet: {
      onClick: async () => {
        await changeNetwork(background, EthereumConnectionUrl.LOCALNET);
        close();
      },
      detail:
        currentUrl === EthereumConnectionUrl.LOCALNET ? <Checkmark /> : <></>,
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

export function Checkmark() {
  const theme = useCustomTheme();
  return (
    <Check
      style={{
        color: theme.custom.colors.brandColor,
      }}
    />
  );
}
