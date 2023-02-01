// This component searches a given mnemonic for a public key and displays
// a loading indicator until it is found (or an error if it not found).

import { useEffect, useState } from "react";
import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";
import {
  getRecoveryPaths,
  UI_RPC_METHOD_PREVIEW_PUBKEYS,
  walletAddressDisplay,
} from "@coral-xyz/common";
import { Loading, PrimaryButton } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { Box } from "@mui/material";

import { Header, SubtextParagraph } from "../../common";

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
  onNext: (walletDescriptor: WalletDescriptor) => void;
  onRetry: () => void;
}) => {
  const [error, setError] = useState(false);
  const background = useBackgroundClient();

  useEffect(() => {
    (async () => {
      const recoveryPaths = getRecoveryPaths(blockchain);
      const publicKeys = await background.request({
        method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
        params: [blockchain, mnemonic, recoveryPaths],
      });
      const index = publicKeys.findIndex((p: string) => p === publicKey);
      if (index !== -1) {
        onNext({ derivationPath: recoveryPaths[index], publicKey });
        return;
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
