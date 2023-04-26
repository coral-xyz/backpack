// Find an unused account index and return the root derivation path
// This is the same logic that is contained in the backend function
// findWalletDescriptor done via a frontend component because the background
// script can't communicate with a hardware device.

import { useEffect, useState } from "react";
import type { WalletDescriptor } from "@coral-xyz/common";
import {
  Blockchain,
  getAccountRecoveryPaths,
  UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import type Transport from "@ledgerhq/hw-transport";
import { ethers } from "ethers";

const { base58 } = ethers.utils;

export const HardwareDefaultWallet = ({
  blockchain,
  transport,
  onNext,
  onError,
}: {
  blockchain: Blockchain;
  transport: Transport;
  onNext: (walletDescriptor: WalletDescriptor) => void;
  onError?: (error: Error) => void;
}) => {
  const background = useBackgroundClient();
  const [ledgerWallet, setLedgerWallet] = useState<Ethereum | Solana | null>(
    null
  );
  const [accountIndex, setAccountIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const ledgerWallet = {
        [Blockchain.SOLANA]: new Solana(transport),
        [Blockchain.ETHEREUM]: new Ethereum(transport),
      }[blockchain];
      setLedgerWallet(ledgerWallet);
    })();
  }, [blockchain, transport]);

  // This is effectively the same as UI_RPC_METHOD_FIND_WALLET_DESCRIPTOR
  useEffect(() => {
    (async () => {
      if (ledgerWallet === null) return;

      const recoveryPaths = getAccountRecoveryPaths(blockchain, accountIndex);

      let publicKeys: Array<string> = [];
      try {
        // Get the public keys for all of the recovery paths for the current account index
        for (const path of recoveryPaths) {
          const ledgerAddress = (
            await ledgerWallet.getAddress(path.replace("m/", ""))
          ).address;
          const publicKey =
            blockchain === Blockchain.SOLANA
              ? base58.encode(ledgerAddress as Buffer)
              : ledgerAddress.toString();
          publicKeys.push(publicKey);
        }
      } catch (error) {
        if (onError) {
          console.debug("hardware default wallet transport error", error);
          onError(error as Error);
          return;
        } else {
          throw error;
        }
      }

      const users = await background.request({
        method: UI_RPC_METHOD_FIND_SERVER_PUBLIC_KEY_CONFLICTS,
        params: [
          publicKeys.map((publicKey) => ({
            publicKey,
            blockchain,
          })),
        ],
      });

      if (users.length === 0) {
        // No users for any of the passed public keys, good to go
        // Take the root for the public key path
        const publicKey = publicKeys[0];
        const derivationPath = recoveryPaths[0];
        onNext({
          blockchain,
          derivationPath,
          publicKey,
        });
      } else {
        // Iterate account index and query again in the case of a conflict
        setAccountIndex(accountIndex + 1);
      }
    })();
  }, [accountIndex, background, blockchain, ledgerWallet, onError, onNext]);

  return <Loading />;
};
