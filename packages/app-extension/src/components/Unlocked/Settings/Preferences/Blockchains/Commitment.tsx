import { useEffect } from "react";
import type { Blockchain } from "@coral-xyz/common";
import { UI_RPC_METHOD_COMMITMENT_UPDATE } from "@coral-xyz/common";
import { blockchainCommitment, useBackgroundClient } from "@coral-xyz/recoil";
import type { Commitment } from "@solana/web3.js";
import { useRecoilValue } from "recoil";

import { useNavigation } from "../../../../common/Layout/NavStack";
import { SettingsList } from "../../../../common/Settings/List";

import { Checkmark } from "./ConnectionSwitch";

export function PreferencesBlockchainCommitment({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const nav = useNavigation();
  const commitment = useRecoilValue(blockchainCommitment(blockchain));
  const background = useBackgroundClient();

  useEffect(() => {
    nav.setOptions({ headerTitle: "Confirmation Commitment" });
  }, [nav]);

  const menuItems = {
    Processed: {
      onClick: () => changeCommitment("processed"),
      detail: commitment === "processed" ? <Checkmark /> : null,
    },
    Confirmed: {
      onClick: () => changeCommitment("confirmed"),
      detail: commitment === "confirmed" ? <Checkmark /> : null,
    },
    Finalized: {
      onClick: () => changeCommitment("finalized"),
      detail: commitment === "finalized" ? <Checkmark /> : null,
    },
  };

  const changeCommitment = (commitment: Commitment) => {
    // ph101pp todo
    background
      .request({
        method: UI_RPC_METHOD_COMMITMENT_UPDATE,
        params: [commitment, blockchain],
      })
      .catch(console.error);
  };

  return <SettingsList menuItems={menuItems} />;
}
