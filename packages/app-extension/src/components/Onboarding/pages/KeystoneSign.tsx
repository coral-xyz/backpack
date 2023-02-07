import { useCallback, useEffect, useState } from "react";
import { SolanaKeystoneKeyring } from '@coral-xyz/blockchain-solana';
import type { Blockchain, DerivationPath, UR } from "@coral-xyz/common";
import { HardwareWalletIcon } from "@coral-xyz/react-common";
import { AnimatedQRCode, URType,useAnimatedQRScanner } from '@keystonehq/animated-qr';
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../common";

export function KeystoneSign({
  message,
  publicKey,
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
  const [msgPlayUR, setMsgPlayUR] = useState<UR>();
  const [xfp, setXFP] = useState<string>('');
  const { AnimatedQRScanner } = useAnimatedQRScanner({});

  // TODO: reject
  let readQRResolve: (ur: UR, xfp: string) => void, readQRReject;

  const signMsg = async () => {
    const keyring = await SolanaKeystoneKeyring.fromUR(ur);
    setXFP(keyring.getXFP());
    keyring.onPlay(async e => {
      setMsgPlayUR(e);
    });
    keyring.onRead(() => new Promise((resolve, reject) => {
      readQRResolve = resolve;
      readQRReject = reject;
    }));
    const sig = await keyring.signMessage(Buffer.from(message), publicKey);
    onNext(sig);
  }

  const handleScan = useCallback(ur => {
    readQRResolve(ur, xfp);
  }, [])

  useEffect(() => {
    signMsg()
  }, [ur]);

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
        {msgPlayUR && <AnimatedQRCode
          type={msgPlayUR.type}
          cbor={msgPlayUR.cbor}
        />}
        <AnimatedQRScanner
          urTypes={[URType.SOL_SIGNATURE]}
          handleError={console.error}
          handleScan={handleScan}
          options={{
            width: 200,
            height: 200,
            blur: false
          }}
        />
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      ></Box>
    </Box>
  );
}
