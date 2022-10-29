// This component searches a hardware wallet for a publickey and displays
// a loading indicator until it is found (or an error if it not found).

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import Transport from "@ledgerhq/hw-transport";
import {
  accountDerivationPath,
  Blockchain,
  DerivationPath,
} from "@coral-xyz/common";
import { Header, Loading, PrimaryButton, SubtextParagraph } from "../../common";
import { DERIVATION_PATHS, LOAD_PUBKEY_AMOUNT } from "./MnemonicSearch";

export const HardwareSearch = ({
  blockchain,
  transport,
  publicKey,
  onNext,
  onRetry,
}: {
  blockchain: Blockchain;
  transport: Transport;
  publicKey: string;
  onNext: (derivationPath: DerivationPath, accountIndex: number) => void;
  onRetry: () => void;
}) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const ledger = {
        [Blockchain.SOLANA]: new Solana(transport),
        [Blockchain.ETHEREUM]: new Ethereum(transport),
      }[blockchain];
      for (const derivationPath of DERIVATION_PATHS) {
        for (
          let accountIndex = 0;
          accountIndex < LOAD_PUBKEY_AMOUNT;
          accountIndex += 1
        ) {
          const path = accountDerivationPath(
            blockchain,
            derivationPath,
            accountIndex
          );
          const ledgerAddress = (await ledger.getAddress(path)).address;
          if (ledgerAddress === publicKey) {
            onNext(derivationPath, accountIndex);
            return;
          }
        }
      }
      setError(true);
    })();
  }, [publicKey]);

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
        <Header text="Unable to recover account" />
        <SubtextParagraph>
          We couldn't find a matching public key using your hardware wallet.
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
