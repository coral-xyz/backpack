import { useEffect } from "react";
import { Check } from "@mui/icons-material";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  EthereumConnectionUrl,
  UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useEthereumConnectionUrl,
} from "@coral-xyz/recoil";
import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { SettingsList } from "../../../../common/Settings/List";
import { useNavStack } from "../../../../common/Layout/NavStack";

export function PreferencesEthereumConnection() {
  const { close } = useDrawerContext();
  const background = useBackgroundClient();
  const currentUrl = useEthereumConnectionUrl();
  const nav = useNavStack();

  useEffect(() => {
    nav.setTitle("RPC Connection");
  }, [nav]);

  const menuItems = {
    "Mainnet (Beta)": {
      onClick: () => changeNetwork(EthereumConnectionUrl.MAINNET),
      detail:
        currentUrl === EthereumConnectionUrl.MAINNET ? <Checkmark /> : <></>,
    },
    "Görli Testnet": {
      onClick: () => changeNetwork(EthereumConnectionUrl.GOERLI),
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

  const changeNetwork = (url: string) => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_ETHEREUM_CONNECTION_URL_UPDATE,
          params: [url],
        })
        .then(close)
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
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
