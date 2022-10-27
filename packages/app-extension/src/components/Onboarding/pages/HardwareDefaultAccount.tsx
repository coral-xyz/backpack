// This component searches a hardware wallet for a publickey and displays
// a loading indicator until it is found (or an error if it not found).

import { useEffect } from "react";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import Transport from "@ledgerhq/hw-transport";
import { encode } from "bs58";
import {
  accountDerivationPath,
  Blockchain,
  DerivationPath,
} from "@coral-xyz/common";
import { Loading } from "../../common";
import type { SelectedAccount } from "../../common/Account/ImportAccounts";

export const HardwareDefaultAccount = ({
  blockchain,
  transport,
  onNext,
  onError,
}: {
  blockchain: Blockchain;
  transport: Transport;
  onNext: (accounts: SelectedAccount[], derivationPath: DerivationPath) => void;
  onError?: (error: Error) => void;
}) => {
  useEffect(() => {
    (async () => {
      const ledger = {
        [Blockchain.SOLANA]: new Solana(transport),
        [Blockchain.ETHEREUM]: new Ethereum(transport),
      }[blockchain];

      const derivationPath = DerivationPath.Default;
      const accountIndex = 0;
      const path = accountDerivationPath(
        blockchain,
        derivationPath,
        accountIndex
      );

      let ledgerAddress;
      try {
        ledgerAddress = (await ledger.getAddress(path)).address;
      } catch (error) {
        if (onError) {
          onError(error as Error);
          return;
        } else {
          throw error;
        }
      }

      const publicKey =
        blockchain === Blockchain.SOLANA
          ? encode(ledgerAddress as Buffer)
          : ledgerAddress.toString();

      onNext(
        [
          {
            index: accountIndex,
            publicKey,
          },
        ],
        derivationPath
      );
    })();
  }, [blockchain]);

  return <Loading />;
};
