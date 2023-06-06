import type { Blockchain, ServerPublicKey } from "@coral-xyz/common";
import {
  formatWalletAddress,
  UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
  validatePrivateKey,
} from "@coral-xyz/common";

import { useAllWallets, useBackgroundClient } from "../";

type Result = {
  blockchain: Blockchain;
  publicKey: string;
  privateKey: string;
  name: string;
};

export function useSavePrivateKey({ onboarding }: { onboarding?: boolean }) {
  const background = useBackgroundClient();
  const wallets = onboarding ? [] : useAllWallets(); // eslint-disable-line

  const handleSavePrivateKey = async ({
    blockchain,
    privateKey,
    name,
    serverPublicKeys,
    setLoading,
    setError,
  }: {
    blockchain?: Blockchain;
    privateKey: string;
    name: string;
    serverPublicKeys?: ServerPublicKey[];
    setLoading: (data: boolean) => void;
    setError: (data: string | null) => void;
  }): Promise<Result | null> => {
    setLoading(true);

    // Do some validation of the private key
    let _privateKey: string, _publicKey: string, _blockchain: Blockchain;
    try {
      ({
        privateKey: _privateKey,
        publicKey: _publicKey,
        blockchain: _blockchain,
      } = validatePrivateKey(privateKey.trim(), blockchain));
    } catch (e) {
      setLoading(false);
      setError((e as Error).message);
      return null;
    }

    if (wallets.find((w) => w.publicKey === _publicKey)) {
      setError("This wallet is already active and available in your account.");
      return null;
    }

    // Check if the public key we have is the public key we wanted (if we were
    // looking for a specific public key)
    if (serverPublicKeys && serverPublicKeys.length > 0) {
      const found = !!serverPublicKeys.find(
        (s: { publicKey: string; blockchain: Blockchain }) =>
          s.publicKey === _publicKey && s.blockchain === _blockchain
      );
      if (!found) {
        if (serverPublicKeys.length === 1) {
          setError(
            `Incorrect private key for ${formatWalletAddress(
              serverPublicKeys[0].publicKey
            )}. The public key was ${formatWalletAddress(_publicKey)}.`
          );
        } else {
          setError(
            `Public key ${formatWalletAddress(
              _publicKey
            )} not found on your Backpack account.`
          );
        }
      }
    } else {
      // If we aren't searching for a public key we are adding it to the account,
      // check for conflicts.
      const response = await background.request({
        method: UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
        params: [[{ blockchain: _blockchain, publicKey: _publicKey }]],
      });

      if (response.length > 0) {
        setError("Wallet address is used by another Backpack account");
        return null;
      }
    }

    setLoading(false);

    return {
      blockchain: _blockchain,
      publicKey: _publicKey,
      privateKey: _privateKey,
      name,
    };
  };

  return { handleSavePrivateKey };
}
