import { useState } from "react";
import type { Blockchain, DerivationPath, UR } from "@coral-xyz/common";
import { HardwareWalletIcon, PrimaryButton } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../common";
import { SolanaKeystoneKeyring } from '@coral-xyz/blockchain-solana';

export function KeystoneSign({
  blockchain,
  message,
  publicKey,
  derivationPath,
  accountIndex,
  ur,
  onNext,
}: {
  blockchain: Blockchain;
  message: string;
  publicKey: string;
  derivationPath: DerivationPath;
  accountIndex: number;
  ur: UR;
  onNext: (signature: string) => void;
}) {
  const background = useBackgroundClient();
  const [signature, setSignature] = useState<string | null>(null);
  const [msgPlayUR, setMsgPlayUR] = useState<UR>();

  const keyring = SolanaKeystoneKeyring.fromUR(ur);
  let readQRResolve, readQRReject;
  keyring.onPlay(async e => {
    setMsgPlayUR(e);
  });
  keyring.onRead(() => new Promise((resolve, reject) => {
    readQRResolve = resolve;
    readQRReject = reject;
  }));
  keyring.signMessage(Buffer.from(message), publicKey);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "0 24px" }}>
        <HeaderIcon icon={<HardwareWalletIcon />} />
        <Header text="Sign the message by Keystone" />
        <SubtextParagraph>{ur.type}</SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <PrimaryButton
          label="Next"
          onClick={() => {
            onNext(signature!);
          }}
          disabled={!signature}
        />
      </Box>
    </Box>
  );
}
