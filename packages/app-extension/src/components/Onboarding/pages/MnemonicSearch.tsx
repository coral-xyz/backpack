// This component searches a given mnemonic for a public key and displays
// a loading indicator until it is found (or an error if it not found).

import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  DerivationPath,
  LOAD_PUBLIC_KEY_AMOUNT,
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
export const MnemonicSearch = ({
  blockchain,
  mnemonic,
  publicKey,
  onNext,
  onRetry,
}: {
  blockchain: Blockchain;
  mnemonic: string;
  publicKey: string;
  onNext: (derivationPath: DerivationPath, accountIndex: number) => void;
  onRetry: () => void;
}) => {
  const [error, setError] = useState(false);
  const background = useBackgroundClient();

  useEffect(() => {
    (async () => {
      for (const derivationPath of DERIVATION_PATHS) {
        const publicKeys = await background.request({
          method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
          params: [
            blockchain,
            mnemonic,
            derivationPath,
            LOAD_PUBLIC_KEY_AMOUNT,
          ],
        });
        const index = publicKeys.findIndex((p: string) => p === publicKey);
        if (index !== -1) {
          onNext(derivationPath, index);
          return;
        }
      }
      setError(true);
    })();
  }, [mnemonic, publicKey]);

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
