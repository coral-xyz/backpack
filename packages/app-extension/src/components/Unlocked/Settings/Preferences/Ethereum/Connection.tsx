import { useEffect } from "react";
import { Check } from "@mui/icons-material";
import { ethers } from "ethers";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  EthereumConnectionUrl,
  UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
  UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useEthereumConnectionUrl,
} from "@coral-xyz/recoil";
import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { SettingsList } from "../../../../common/Settings/List";
import { useNavStack } from "../../../../common/Layout/NavStack";

const { hexlify } = ethers.utils;

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
      onClick: () => changeNetwork(EthereumConnectionUrl.MAINNET, "0x1"),
      detail:
        currentUrl === EthereumConnectionUrl.MAINNET ? <Checkmark /> : <></>,
    },
    "Görli Testnet": {
      onClick: () => changeNetwork(EthereumConnectionUrl.GOERLI, "0x5"),
      detail:
        currentUrl === EthereumConnectionUrl.GOERLI ? <Checkmark /> : <></>,
    },
    Localnet: {
      onClick: () => changeNetwork(EthereumConnectionUrl.LOCALNET),
      detail:
        currentUrl === EthereumConnectionUrl.LOCALNET ? <Checkmark /> : <></>,
    },
    Custom: {
      onClick: () =>
        changeNetwork(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          new URL(prompt("Enter your custom endpoint")!.trim()).toString()
        ),
      detail:
        currentUrl !== EthereumConnectionUrl.MAINNET &&
        currentUrl !== EthereumConnectionUrl.GOERLI &&
        currentUrl !== EthereumConnectionUrl.LOCALNET ? (
          <Checkmark />
        ) : (
          <></>
        ),
    },
  };

  const changeNetwork = async (url: string, chainId?: string) => {
    await background.request({
      method: UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
      params: [url],
    });

    if (!chainId) {
      const provider = ethers.getDefaultProvider(url);
      const network = await provider.getNetwork();
      chainId = hexlify(network.chainId);
    }

    await background.request({
      method: UI_RPC_METHOD_ETHEREUM_CHAIN_ID_UPDATE,
      params: [chainId],
    });

    close();
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
