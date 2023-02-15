import type { MutableRefObject } from 'react';
import type { Blockchain, SignedWalletDescriptor, UR } from "@coral-xyz/common";
import {
  getAddMessage,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD,
  UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
  UI_RPC_METHOD_KEYSTONE_IMPORT ,
  UI_RPC_METHOD_LEDGER_IMPORT,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";

import { HardwareOnboard,HardwareType } from "../../../../Onboarding/pages/HardwareOnboard";

import { ConnectHardwareSuccess } from "./ConnectHardwareSuccess";

export function ConnectHardware({
  containerRef,
  blockchain,
  action,
  createKeyring,
  publicKey,
  onComplete,
}: {
  containerRef: MutableRefObject<any>;
  blockchain: Blockchain;
  action: "create" | "import" | "search";
  createKeyring: boolean;
  publicKey?: string;
  onComplete: () => void;
}) {
  const background = useBackgroundClient();

  const handleHardwareOnboardComplete = async (
    signedWalletDescriptor: SignedWalletDescriptor,
    hardwareType: HardwareType,
    ur?: UR
  ) => {
    const blockchainKeyrings = await background.request({
      method: UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_READ,
      params: [],
    });
    const keyringExists = blockchainKeyrings.includes(blockchain);
    let method = UI_RPC_METHOD_BLOCKCHAIN_KEYRINGS_ADD; // Create the keyring
    let params: any[] = [blockchain, signedWalletDescriptor];
    if (keyringExists && !createKeyring) {
      if (hardwareType === HardwareType.Keystone) {
        method = UI_RPC_METHOD_KEYSTONE_IMPORT;
        params = [
          blockchain,
          ur,
          signedWalletDescriptor.publicKey,
          signedWalletDescriptor.signature,
        ];
      } else {
        method = UI_RPC_METHOD_LEDGER_IMPORT;
      }
    }
    await background.request({
      method,
      params,
    });
  };

  return (
    <HardwareOnboard
      containerRef={containerRef}
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
