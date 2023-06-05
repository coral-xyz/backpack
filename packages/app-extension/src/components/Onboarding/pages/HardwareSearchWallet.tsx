// This component searches a hardware wallet for a public key and displays
// a loading indicator until it is found (or an error if it not found).

import { useEffect, useState } from "react";
import type { WalletDescriptor } from "@coral-xyz/common";
import {
  Blockchain,
  formatWalletAddress,
  getRecoveryPaths,
} from "@coral-xyz/common";
import { Loading, PrimaryButton } from "@coral-xyz/react-common";
import Ethereum from "@ledgerhq/hw-app-eth";
import Solana from "@ledgerhq/hw-app-solana";
import type Transport from "@ledgerhq/hw-transport";
import { Box } from "@mui/material";
import { ethers } from "ethers";

import { Header, SubtextParagraph } from "../../common";

const { base58: bs58 } = ethers.utils;

export const HardwareSearchWallet = ({
  blockchain,
  transport,
  publicKey,
  onNext,
  onError,
  onRetry,
}: {
  blockchain: Blockchain;
  transport: Transport;
  publicKey: string;
  onNext: (walletDescriptor: WalletDescriptor) => void;
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
      for (const derivationPath of getRecoveryPaths(blockchain, true)) {
        let ledgerAddress;
        try {
          ledgerAddress = (
            await ledger.getAddress(derivationPath.replace("m/", ""))
          ).address;
        } catch (error) {
          if (onError) {
            console.debug("hardware search transport error", error);
            onError(error as Error);
            return;
          } else {
            throw error;
          }
        }
        if (bs58.encode(ledgerAddress) === publicKey) {
          onNext({ blockchain, derivationPath, publicKey });
          return;
        }
      }
      setError(true);
    })();
  }, [blockchain, publicKey, onError, onNext, transport]);

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
          We couldn't find the public key {formatWalletAddress(publicKey)} using
          your hardware wallet.
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
