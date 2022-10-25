// This component searches a hardware wallet for a publickey and displays
// a loading indicator until it is found (or an error if it not found).

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import Transport from "@ledgerhq/hw-transport";
import { encode } from "bs58";
import {
  accountDerivationPath,
  Blockchain,
  DerivationPath,
} from "@coral-xyz/common";
import { Header, Loading, PrimaryButton, SubtextParagraph } from "../../common";
import type { SelectedAccount } from "../../common/Account/ImportAccounts";

export const HardwareDefaultAccount = ({
  blockchain,
  transport,
  onNext,
  onRetry,
}: {
  blockchain: Blockchain;
  transport: Transport;
  onNext: (accounts: SelectedAccount[], derivationPath: DerivationPath) => void;
  onRetry: () => void;
}) => {
  const [error, setError] = useState(false);

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
      const ledgerAddress = (await ledger.getAddress(path)).address;
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

  if (!error) {
    return <Loading />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "24px" }}>
        <Header text="Unable to connect" />
        <SubtextParagraph>
          Check that your wallet is connected and unlocked, and your browser
          permissions are approved.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <PrimaryButton label="Retry" onClick={onRetry} />
      </Box>
    </Box>
  );
};
