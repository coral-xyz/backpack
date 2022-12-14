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

  const handleHardwareOnboardComplete = async (
    keyringInit: BlockchainKeyringInit
  ) => {
    await background.request({
      method: UI_RPC_METHOD_LEDGER_IMPORT,
      params: [
        keyringInit.blockchain,
        keyringInit.derivationPath,
        keyringInit.accountIndex,
        keyringInit.publicKey,
        keyringInit.signature,
      ],
    });
  };

  return (
    <HardwareOnboard
      blockchain={blockchain}
      action={"import"}
      signMessage={getAddMessage}
      signText="Sign the message to add the wallet to your Backpack account."
      successComponent={<ConnectHardwareSuccess onNext={onComplete} />}
      onComplete={handleHardwareOnboardComplete}
    />
  );
}
