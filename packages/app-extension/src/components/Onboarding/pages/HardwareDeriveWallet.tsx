import { useEffect, useState } from "react";
import type {   Blockchain,WalletDescriptor } from "@coral-xyz/common";
import {
  UI_RPC_METHOD_KEYRING_READ_NEXT_DERIVATION_PATH,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import type Ethereum from "@ledgerhq/hw-app-eth";
import type Solana from "@ledgerhq/hw-app-solana";
import type Transport from "@ledgerhq/hw-transport";
import { ethers } from "ethers";

import { BLOCKCHAIN_COMPONENTS } from "../../common/Blockchains";

const { base58 } = ethers.utils;

export const HardwareDeriveWallet = ({
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

  useEffect(() => {
    (async () => {
      const ledgerWallet =
        BLOCKCHAIN_COMPONENTS[blockchain].LedgerApp(transport);
      setLedgerWallet(ledgerWallet);
    })();
  }, [blockchain, transport]);

  useEffect(() => {
    (async () => {
      if (ledgerWallet === null) return;

      const { derivationPath } = await background.request({
        method: UI_RPC_METHOD_KEYRING_READ_NEXT_DERIVATION_PATH,
        params: [blockchain, "ledger"],
      });

      let publicKey: string;
      try {
        publicKey = await BLOCKCHAIN_COMPONENTS[blockchain].PublicKeyFromPath(
          ledgerWallet,
          derivationPath
        );
      } catch (error) {
        if (onError) {
          console.debug("hardware derive wallet transport error", error);
          onError(error as Error);
          return;
        } else {
          throw error;
        }
      }

      // TODO check for conflicts using Backpack API and move to next derivation
      // path if unusable

      onNext({
        blockchain,
        derivationPath,
        publicKey,
      });
    })();
  }, [background, blockchain, ledgerWallet, onError, onNext]);

  return <Loading />;
};
