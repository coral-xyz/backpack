import { useEffect } from "react";
import { SolanaExplorer } from "@coral-xyz/blockchain-common";
import {
  Blockchain,
  UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
} from "@coral-xyz/common";
import { useBackgroundClient, useBlockchainExplorer } from "@coral-xyz/recoil";

import { useNavStack } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";

import { Checkmark } from "./ConnectionSwitch";

export function PreferencesSolanaExplorer() {
  const background = useBackgroundClient();
  const explorer = useBlockchainExplorer(Blockchain.SOLANA);
  const nav = useNavStack();

  useEffect(() => {
    nav.setTitle("Explorer");
  }, [nav]);

  const menuItems = {
    "Solana Beach": {
      onClick: () => changeExplorer(SolanaExplorer.SOLANA_BEACH),
      detail: explorer === SolanaExplorer.SOLANA_BEACH ? <Checkmark /> : <></>,
    },
    "Solana Explorer": {
      onClick: () => changeExplorer(SolanaExplorer.SOLANA_EXPLORER),
      detail:
        explorer === SolanaExplorer.SOLANA_EXPLORER ? <Checkmark /> : <></>,
    },
    "Solana FM": {
      onClick: () => changeExplorer(SolanaExplorer.SOLANA_FM),
      detail: explorer === SolanaExplorer.SOLANA_FM ? <Checkmark /> : <></>,
    },
    Solscan: {
      onClick: () => changeExplorer(SolanaExplorer.SOLSCAN),
      detail: explorer === SolanaExplorer.SOLSCAN ? <Checkmark /> : <></>,
    },
  };

  const changeExplorer = (explorer: string) => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
          params: [Blockchain.SOLANA, { explorer }],
        })
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  return <SettingsList menuItems={menuItems} />;
}
