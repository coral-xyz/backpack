import { useEffect } from "react";
import {
  Blockchain,
  UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
} from "@coral-xyz/common";
import { useBackgroundClient, useBlockchainSettings } from "@coral-xyz/recoil";
import type { Commitment } from "@solana/web3.js";

import { useNavStack } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";

import { Checkmark } from "./ConnectionSwitch";

export function PreferencesSolanaCommitment() {
  const nav = useNavStack();
  const { commitment } = useBlockchainSettings(Blockchain.SOLANA);
  const background = useBackgroundClient();

  useEffect(() => {
    nav.setTitle("Confirmation Commitment");
  }, [nav]);

  const menuItems = {
    Processed: {
      onClick: () => changeCommitment("processed"),
      detail: commitment === "processed" ? <Checkmark /> : <></>,
    },
    Confirmed: {
      onClick: () => changeCommitment("confirmed"),
      detail: commitment === "confirmed" ? <Checkmark /> : <></>,
    },
    Finalized: {
      onClick: () => changeCommitment("finalized"),
      detail: commitment === "finalized" ? <Checkmark /> : <></>,
    },
  };

  const changeCommitment = (commitment: Commitment) => {
    background
      .request({
        method: UI_RPC_METHOD_BLOCKCHAIN_SETTINGS_UPDATE,
        params: [Blockchain.SOLANA, { commitment }],
      })
      .catch(console.error);
  };

  return <SettingsList menuItems={menuItems} />;
}
