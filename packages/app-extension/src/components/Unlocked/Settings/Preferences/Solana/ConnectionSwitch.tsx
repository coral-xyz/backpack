import { useEffect } from "react";
import { SolanaCluster } from "@coral-xyz/blockchain-common";
import {
  Blockchain,
  UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
} from "@coral-xyz/common";
import {
  useBackgroundClient,
  useBlockchainConnectionUrl,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Check } from "@mui/icons-material";

import { PushDetail } from "../../../../common";
import { useDrawerContext } from "../../../../common/Layout/Drawer";
import { useNavStack } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";

export function PreferencesSolanaConnection() {
  const { close } = useDrawerContext();
  const background = useBackgroundClient();
  const currentUrl = useBlockchainConnectionUrl(Blockchain.SOLANA);
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

  const changeNetwork = (connectionUrl: string) => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
          params: [Blockchain.SOLANA, { connectionUrl }],
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
