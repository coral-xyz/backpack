// This component searches a given mnemonic for a public key and displays
// a loading indicator until it is found (or an error if it not found).

import { useEffect, useState } from "react";
import type { ServerPublicKey, WalletDescriptor } from "@coral-xyz/common";
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
  serverPublicKeys,
  mnemonic,
  onNext,
  onRetry,
}: {
  serverPublicKeys: Array<ServerPublicKey>;
  mnemonic: string;
  onNext: (walletDescriptors: Array<WalletDescriptor>) => void;
  onRetry: () => void;
}) => {
  const [error, setError] = useState(false);
  const background = useBackgroundClient();

  useEffect(() => {
    (async () => {
      const walletDescriptors: Array<WalletDescriptor> = [];
      const blockchains = [
        ...new Set(serverPublicKeys.map((x) => x.blockchain)),
      ];
      for (const blockchain of blockchains) {
        const recoveryPaths = getRecoveryPaths(blockchain);
        const publicKeys = await background.request({
          method: UI_RPC_METHOD_PREVIEW_PUBKEYS,
          params: [blockchain, mnemonic, recoveryPaths],
        });
        const searchPublicKeys = serverPublicKeys
          .filter((b) => b.blockchain === blockchain)
          .map((p) => p.publicKey);
        for (const publicKey of searchPublicKeys) {
          const index = publicKeys.findIndex((p: string) => p === publicKey);
          if (index !== -1) {
            walletDescriptors.push({
              blockchain,
              derivationPath: recoveryPaths[index],
              publicKey,
            });
          }
        }
      }
      if (walletDescriptors.length > 0) {
        onNext(walletDescriptors);
      } else {
        setError(true);
      }
    })();
  }, [background, serverPublicKeys, mnemonic, onNext]);

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
          {serverPublicKeys.length === 1 ? (
            <>
              We couldn't find the public key{" "}
              {walletAddressDisplay(serverPublicKeys[0].publicKey)} using your
              recovery phrase.
            </>
          ) : (
            <>We couldn't find any wallets using your recovery phrase.</>
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
