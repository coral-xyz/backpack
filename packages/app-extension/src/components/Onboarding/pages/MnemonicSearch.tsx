// This component searches a given mnemonic for a publickey and displays
// a loading indicator until it is found (or an error if it not found).

import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import {
  Blockchain,
  DerivationPath,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { Header, Loading, PrimaryButton, SubtextParagraph } from "../../common";

const DERIVATION_PATHS = [DerivationPath.Bip44, DerivationPath.Bip44Change];
const LOAD_PUBKEY_AMOUNT = 20;

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
          params: [blockchain, mnemonic, derivationPath, LOAD_PUBKEY_AMOUNT],
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
        <Header text="Unable to recover account" />
        <SubtextParagraph>
          We couldn't find a matching public key for that recovery phrase.
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
