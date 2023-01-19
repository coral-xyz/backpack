// This component searches a given mnemonic for a set of public keys
// and displays a loading indicator until searching is complete (or an error
// if no public keys are found)

import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  DerivationPath,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { Loading, PrimaryButton } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { Box } from "@mui/material";

import { Header, SubtextParagraph } from "../../common";

export const DERIVATION_PATHS = [
  DerivationPath.Bip44,
  DerivationPath.Bip44Change,
];
export const LOAD_PUBKEY_AMOUNT = 20;

export const MnemonicSearch = ({
  mnemonic,
  blockchainPublicKeys,
  onNext,
  onRetry,
}: {
  mnemonic: string;
  blockchainPublicKeys: Array<{ blockchain: Blockchain; publicKey: string }>;
  onNext: (
    paths: Array<{ derivationPath: DerivationPath; accountIndex: number }>
  ) => void;
  onRetry: () => void;
}) => {
  const [error, setError] = useState(false);
  const background = useBackgroundClient();

  useEffect(() => {
    (async () => {
      let wallets: Array<{
        blockchain: Blockchain;
        derivationPath: DerivationPath;
        accountIndex: number;
      }> = [];
      const blockchains = [
        ...new Set(blockchainPublicKeys.map((x) => x.blockchain)),
      ];
      for (const blockchain of blockchains) {
        for (const derivationPath of DERIVATION_PATHS) {
          const publicKeys = await background.request({
            method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
            params: [blockchain, mnemonic, derivationPath, LOAD_PUBKEY_AMOUNT],
          });
          const searchPublicKeys = blockchainPublicKeys
            .filter((b) => b.blockchain === blockchain)
            .map((p) => p.publicKey);
          for (const searchPublicKey of searchPublicKeys) {
            const accountIndex = publicKeys.findIndex(
              (p: string) => p === searchPublicKey
            );
            if (accountIndex) {
              wallets.push({
                blockchain,
                derivationPath,
                accountIndex,
              });
            }
          }
        }
      }
      if (wallets) {
        onNext(wallets);
        return;
      } else {
        setError(true);
      }
    })();
  }, [mnemonic, blockchainPublicKeys]);

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
          {blockchainPublicKeys.length === 0 ? (
            <>
              We couldn't find the public key{" "}
              {walletAddressDisplay(blockchainPublicKeys[0].publicKey)} for that
              recovery phrase.
            </>
          ) : (
            <>
              We couldn't find a matching public key for that recovery phrase.
            </>
          )}
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
