import { useEffect, useState } from "react";
import type { WalletDescriptor } from "@coral-xyz/common";
import {
  Blockchain,
  UI_RPC_METHOD_KEYRING_READ_NEXT_DERIVATION_PATH,
} from "@coral-xyz/common";
import { Loading } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import type Transport from "@ledgerhq/hw-transport";
import { ethers } from "ethers";

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
      const ledgerWallet = {
        [Blockchain.SOLANA]: new Solana(transport),
        [Blockchain.ETHEREUM]: new Ethereum(transport),
      }[blockchain];
      setLedgerWallet(ledgerWallet);
    })();
  }, [blockchain]);

  useEffect(() => {
    (async () => {
      if (ledgerWallet === null) return;

      const nextDerivationPath = await background.request({
        method: UI_RPC_METHOD_KEYRING_READ_NEXT_DERIVATION_PATH,
        params: [blockchain, "ledger"],
      });

      let publicKey: string;
      try {
        const ledgerAddress = (
          await ledgerWallet.getAddress(nextDerivationPath.replace("m/", ""))
        ).address;
        publicKey =
          blockchain === Blockchain.SOLANA
            ? base58.encode(ledgerAddress)
            : ledgerAddress.toString();
      } catch (error) {
        if (onError) {
          console.debug("hardware derive wallet transport error", error);
          onError(error as Error);
          return;
        } else {
          throw error;
        }
      }

      onNext({
        derivationPath: nextDerivationPath,
        publicKey,
      });
    })();
  }, [ledgerWallet]);

  return <Loading />;
};
