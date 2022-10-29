import { useEffect } from "react";
import { Check } from "@mui/icons-material";
import { useCustomTheme } from "@coral-xyz/themes";
import {
  getLogger,
  SolanaCluster,
  UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
} from "@coral-xyz/common";
import { useBackgroundClient, useSolanaConnectionUrl } from "@coral-xyz/recoil";
import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { SettingsList } from "../../../../common/Settings/List";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { PushDetail } from "../../../../common";

const logger = getLogger("preferences");

export function PreferencesSolanaConnection() {
  const { close } = useDrawerContext();
  const background = useBackgroundClient();
  const currentUrl = useSolanaConnectionUrl();
  const nav = useNavStack();

  useEffect(() => {
    nav.setTitle("RPC Connection");
  }, [nav]);

  const menuItems = {
    "Mainnet (Beta)": {
      onClick: () => changeNetwork(SolanaCluster.MAINNET),
      detail: currentUrl === SolanaCluster.MAINNET ? <Checkmark /> : <></>,
    },
    Devnet: {
      onClick: () => changeNetwork(SolanaCluster.DEVNET),
      detail: currentUrl === SolanaCluster.DEVNET ? <Checkmark /> : <></>,
    },
    Localnet: {
      onClick: () => changeNetwork(SolanaCluster.LOCALNET),
      detail: currentUrl === SolanaCluster.LOCALNET ? <Checkmark /> : <></>,
    },
    Custom: {
      onClick: () => {
        nav.push("preferences-solana-edit-rpc-connection");
      },
      detail:
        currentUrl !== SolanaCluster.MAINNET &&
        currentUrl !== SolanaCluster.DEVNET &&
        currentUrl !== SolanaCluster.LOCALNET ? (
          <>
            <Checkmark />
            <PushDetail />
          </>
        ) : (
          <PushDetail />
        ),
    },
  };

  const changeNetwork = (url: string) => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_SOLANA_CONNECTION_URL_UPDATE,
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
