// This component searches a hardware wallet for a public key and displays
// a loading indicator until it is found (or an error if it not found).

import { useEffect, useState } from "react";
import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";
import { formatWalletAddress } from "@coral-xyz/common";
import { Loading, PrimaryButton } from "@coral-xyz/react-common";
import { blockchainConfigAtom } from "@coral-xyz/recoil";
import { getRecoveryPaths } from "@coral-xyz/secure-background/legacyCommon";
import type Transport from "@ledgerhq/hw-transport";
import { Box } from "@mui/material";
import { ethers } from "ethers";
import { useRecoilValue } from "recoil";

import { Header, SubtextParagraph } from "../../common";
import { BLOCKCHAIN_COMPONENTS } from "../../common/Blockchains";

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
  const blockchainConfig = useRecoilValue(blockchainConfigAtom(blockchain));
  useEffect(() => {
    (async () => {
      const ledger = BLOCKCHAIN_COMPONENTS[blockchain].LedgerApp(transport);
      const bip44CoinType = blockchainConfig!.bip44CoinType;
      for (const derivationPath of getRecoveryPaths(bip44CoinType, true)) {
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
