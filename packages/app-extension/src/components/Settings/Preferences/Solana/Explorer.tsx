import { UI_RPC_METHOD_SOLANA_EXPLORER_UPDATE } from "@coral-xyz/common";
import { useSolanaExplorer, useBackgroundClient } from "@coral-xyz/recoil";
import { SettingsList } from "../../../common/Settings/List";
import { Checkmark } from "./ConnectionSwitch";

const SOLANA_EXPLORER = "https://explorer.solana.com/";
const SOLSCAN = "https://solscan.io/";
const SOLANA_BEACH = "https://solanabeach.io/";

export function PreferencesSolanaExplorer() {
  const background = useBackgroundClient();
  const explorer = useSolanaExplorer();

  const menuItems = {
    "Solana Explorer": {
      onClick: () => changeExplorer(SOLANA_EXPLORER),
      detail: explorer === SOLANA_EXPLORER ? <Checkmark /> : <></>,
    },
    Solscan: {
      onClick: () => changeExplorer(SOLSCAN),
      detail: explorer === SOLSCAN ? <Checkmark /> : <></>,
    },
    "Solana Beach": {
      onClick: () => changeExplorer(SOLANA_BEACH),
      detail: explorer === SOLANA_BEACH ? <Checkmark /> : <></>,
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
