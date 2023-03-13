import type { Blockchain, SignedWalletDescriptor } from "@coral-xyz/common";
import {
  getAddMessage,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
  UI_RPC_METHOD_LEDGER_IMPORT,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";

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

  const handleHardwareOnboardComplete = async (
    signedWalletDescriptor: SignedWalletDescriptor
  ) => {
    const blockchainKeyrings = await background.request({
      method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
      params: [],
    });
    const keyringExists = blockchainKeyrings.includes(blockchain);

    if (keyringExists) {
      // Just import the wallet because the keyring already exists
      await background.request({
        method: UI_RPC_METHOD_LEDGER_IMPORT,
        params: [signedWalletDescriptor],
      });
    } else {
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
