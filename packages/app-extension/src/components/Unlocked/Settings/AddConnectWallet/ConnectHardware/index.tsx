import { useState } from "react";
import type { Blockchain, BlockchainKeyringInit } from "@coral-xyz/common";
import { getAddMessage, UI_RPC_METHOD_LEDGER_IMPORT } from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";

import { HardwareOnboard } from "../../../../Onboarding/pages/HardwareOnboard";

import { ConnectHardwareSuccess } from "./ConnectHardwareSuccess";

export function ConnectHardware({
  blockchain,
  onComplete,
}: {
  blockchain: Blockchain;
  onComplete: () => void;
}) {
  const background = useBackgroundClient();
  const [isAdded, setIsAdded] = useState(false);

  const handleComplete = async (keyringInit: BlockchainKeyringInit) => {
    await background.request({
      method: UI_RPC_METHOD_LEDGER_IMPORT,
      params: [
        keyringInit.blockchain,
        keyringInit.derivationPath,
        keyringInit.accountIndex,
        keyringInit.signature,
      ],
    });
    setIsAdded(true);
  };

  return isAdded ? (
    <ConnectHardwareSuccess onNext={onComplete} />
  ) : (
    <HardwareOnboard
      blockchain={blockchain}
      action={"import"}
      signMessage={getAddMessage}
      signText="Sign the message to add the wallet to your Backpack account."
      onComplete={handleComplete}
    />
  );
}
