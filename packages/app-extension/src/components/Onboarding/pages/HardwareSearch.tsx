// This component searches a hardware wallet for a public key and displays
// a loading indicator until it is found (or an error if it not found).

import { useEffect, useState } from "react";
import type { PublicKeyPath } from "@coral-xyz/common";
import {
  accountDerivationPath,
  Blockchain,
  LOAD_PUBLIC_KEY_AMOUNT,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { Loading, PrimaryButton } from "@coral-xyz/react-common";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import type Transport from "@ledgerhq/hw-transport";
import { Box } from "@mui/material";
import { ethers } from "ethers";

import { Header, SubtextParagraph } from "../../common";

import { DERIVATION_PATHS } from "./MnemonicSearch";

const { base58: bs58 } = ethers.utils;

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
  onNext: (publicKeyPath: PublicKeyPath) => void;
  onError?: (error: Error) => void;
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
        // TODO how many accounts?
        const account = 0;
        for (let index = 0; index < LOAD_PUBLIC_KEY_AMOUNT; index += 1) {
          const path = accountDerivationPath(
            blockchain,
            derivationPath,
            account,
            index
          );
          const ledgerAddress = (await ledger.getAddress(path)).address;
          if (bs58.encode(ledgerAddress) === publicKey) {
            onNext({ blockchain, derivationPath, publicKey, account, index });
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
        <Header text="Unable to recover wallet" />
        <SubtextParagraph>
          We couldn't find the public key {walletAddressDisplay(publicKey)}{" "}
          using your hardware wallet.
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
