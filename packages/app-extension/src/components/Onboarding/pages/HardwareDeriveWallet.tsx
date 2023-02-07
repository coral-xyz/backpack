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
      const nextDerivationPath = await background.request({
        method: UI_RPC_METHOD_KEYRING_READ_NEXT_DERIVATION_PATH,
        params: [blockchain, "ledger"],
      });
      console.log(nextDerivationPath);
    })();
  }, [ledgerWallet]);

  return <Loading />;
};
