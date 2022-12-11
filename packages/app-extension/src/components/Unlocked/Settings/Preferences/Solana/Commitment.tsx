import { useEffect } from "react";
import { UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE } from "@coral-xyz/common";
import { useBackgroundClient, useSolanaCommitment } from "@coral-xyz/recoil";
import type { Commitment } from "@solana/web3.js";

import { useNavStack } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";

import { Checkmark } from "./ConnectionSwitch";

export function PreferencesSolanaCommitment() {
  const nav = useNavStack();
  const commitment = useSolanaCommitment();
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
        method: UI_RPC_METHOD_SOLANA_COMMITMENT_UPDATE,
        params: [commitment],
      })
      .catch(console.error);
  };

  return <SettingsList menuItems={menuItems} />;
}
