import type { Blockchain, SignedWalletDescriptor } from "@coral-xyz/common";
import {
  getAddMessage,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_LEDGER_IMPORT,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";

import { HardwareOnboard } from "../../../../Onboarding/pages/HardwareOnboard";

import { ConnectHardwareSuccess } from "./ConnectHardwareSuccess";

export function ConnectHardware({
  blockchain,
  createKeyring,
  publicKey,
  onComplete,
}: {
  blockchain: Blockchain;
  createKeyring: boolean;
  publicKey?: string;
  onComplete: () => void;
}) {
  const background = useBackgroundClient();

  const handleHardwareOnboardComplete = async (
    signedWalletDescriptor: SignedWalletDescriptor
  ) => {
    const method = createKeyring
      ? // Create the keyring
        UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD
      : // Just import the wallet because the keyring already exists
        UI_RPC_METHOD_LEDGER_IMPORT;
    await background.request({
      method,
      params: [blockchain, signedWalletDescriptor],
    });
  };

  return (
    <HardwareOnboard
      blockchain={blockchain}
      action={publicKey ? "search" : "import"}
      signMessage={getAddMessage}
      signText="Sign the message to add the wallet to your Backpack account."
      successComponent={<ConnectHardwareSuccess onNext={onComplete} />}
      searchPublicKey={publicKey}
      onComplete={handleHardwareOnboardComplete}
    />
  );
}
