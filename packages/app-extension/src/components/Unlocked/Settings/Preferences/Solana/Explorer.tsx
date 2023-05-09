import { useEffect } from "react";
import {
  SolanaExplorer,
  UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE,
} from "@coral-xyz/common";
import { useBackgroundClient, useSolanaExplorer } from "@coral-xyz/recoil";

import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";

import { Checkmark } from "./ConnectionSwitch";

export function PreferencesSolanaExplorer() {
  const background = useBackgroundClient();
  const explorer = useSolanaExplorer();
  const nav = useNavigation();

  useEffect(() => {
    nav.setOptions({ headerTitle: "Explorer" });
  }, [nav]);

  const menuItems = {
    "Solana Beach": {
      onClick: () => changeExplorer(SolanaExplorer.SOLANA_BEACH),
      detail:
        explorer === SolanaExplorer.SOLANA_BEACH ? <Checkmark /> : <div />,
    },
    "Solana Explorer": {
      onClick: () => changeExplorer(SolanaExplorer.SOLANA_EXPLORER),
      detail:
        explorer === SolanaExplorer.SOLANA_EXPLORER ? (
          <Checkmark />
        ) : (
          <div />
        ),
    },
    "Solana FM": {
      onClick: () => changeExplorer(SolanaExplorer.SOLANA_FM),
      detail:
        explorer === SolanaExplorer.SOLANA_FM ? <Checkmark /> : <div />,
    },
    Solscan: {
      onClick: () => changeExplorer(SolanaExplorer.SOLSCAN),
      detail: explorer === SolanaExplorer.SOLSCAN ? <Checkmark /> : <div />,
    },
    XRAY: {
      onClick: () => changeExplorer(SolanaExplorer.XRAY),
      detail: explorer === SolanaExplorer.XRAY ? <Checkmark /> : <div />,
    },
  };

  const changeExplorer = (explorer: string) => {
    try {
      background
        .request({
          method: UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE,
          params: [explorer],
        })
        .catch(console.error);
    } catch (err) {
      console.error(err);
    }
  };

  return <SettingsList menuItems={menuItems} />;
}
