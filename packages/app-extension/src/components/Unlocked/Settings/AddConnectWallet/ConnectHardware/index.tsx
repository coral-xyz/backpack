import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";
import {
  getAddMessage,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_LEDGER_IMPORT,
} from "@coral-xyz/common";
import { useBackgroundClient, useEnabledBlockchains } from "@coral-xyz/recoil";

import { HardwareOnboard } from "../../../../Onboarding/pages/HardwareOnboard";

import { ConnectHardwareSuccess } from "./ConnectHardwareSuccess";

export function ConnectHardware({
  blockchain,
  action,
  publicKey,
  onComplete,
}: {
  blockchain: Blockchain;
  action: "create" | "import" | "search";
  createKeyring: boolean;
  publicKey?: string;
  onComplete: () => void;
}) {
  const background = useBackgroundClient();
  const enabledBlockchains = useEnabledBlockchains();
  const keyringExists = enabledBlockchains.includes(blockchain);

  const handleHardwareOnboardComplete = async (
    walletDescriptors: Array<WalletDescriptor>
  ) => {
    //
    // Note: this loop is inefficient. If the UI ends up being too slow then
    //       batch this into a new import api that takes in all the wallet
    //       descriptors at once.
    //
    const blockchainsImported = new Map();
    for (let k = 0; k < walletDescriptors.length; k += 1) {
      const walletDescriptor = walletDescriptors[k];
      const hasImported = blockchainsImported.get(walletDescriptor.blockchain);
      await _handleHardwareOnboardComplete(
        walletDescriptor,
        // If previously imported on a blockchain, the keyring exists.
        hasImported ? true : keyringExists
      );

      blockchainsImported.set(walletDescriptor.blockchain, true);
    }
  };

  const _handleHardwareOnboardComplete = async (
    signedWalletDescriptor: WalletDescriptor,
    keyringExists: boolean
  ) => {
    if (keyringExists) {
      // Just import the wallet because the keyring already exists
      // ph101pp todo
      await background.request({
        method: UI_RPC_METHOD_LEDGER_IMPORT,
        params: [signedWalletDescriptor],
      });
    } else {
      // ph101pp todo
      await background.request({
        method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
        params: [{ signedWalletDescriptors: [signedWalletDescriptor] }],
      });
    }
  };

  return (
    <HardwareOnboard
      blockchain={blockchain}
      action={action}
      signMessage={getAddMessage}
      signText="Sign the message to add the wallet to your Backpack account."
      successComponent={<ConnectHardwareSuccess onNext={onComplete} />}
      searchPublicKey={publicKey}
      onComplete={handleHardwareOnboardComplete}
    />
  );
}
