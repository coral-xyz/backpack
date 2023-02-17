import type { MutableRefObject } from "react";
import { useCallback, useEffect, useState } from "react";
import { SolanaKeystoneKeyring } from '@coral-xyz/blockchain-solana';
import type { Blockchain, UR, WalletDescriptor } from "@coral-xyz/common";
import { useCustomTheme } from '@coral-xyz/themes';
import { Box } from '@mui/system';

import { Header, SubtextParagraph } from '../../../../common';
import { CircleBackpackIcon, ConnectIcon, KeystoneIcon } from '../../../../common/Icon';
import { DisplayType, KeystonePlayer, KeystoneScanner } from '../../../../common/Keystone';

export function ConnectHardwareKeystoneSign({
  containerRef,
  walletDescriptor,
  message,
  ur,
  onNext,
}: {
  containerRef: MutableRefObject<any>;
  blockchain: Blockchain;
  walletDescriptor: WalletDescriptor;
  message: string;
  ur: UR;
  onNext: (signature: string) => void;
}) {
  const [msgPlayUR, setMsgPlayUR] = useState<UR>();
  const [xfp, setXFP] = useState<string>('');
  const [display, setDisplay] = useState(DisplayType.qrcode);

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
    const sig = await keyring.signMessage(Buffer.from(message), walletDescriptor.publicKey);
    onNext(sig);
  };

  const handleScan = useCallback(ur => {
    readQRResolve(ur, xfp);
  }, []);

  useEffect(() => {
    signMsg();
  }, [ur]);

  return {
    [DisplayType.qrcode]: <KeystonePlayer
      header={
        <CommonHeader text='Sign the message and scan the QR code using your Keystone to import your account to Backpack' />
      }
      ur={msgPlayUR}
      setDisplay={setDisplay}
    />,
    [DisplayType.scanner]: <KeystoneScanner
      containerRef={containerRef}
      header={
        <CommonHeader text='Scan the QR code displayed on your Keystone Device.' />
      }
      onScan={handleScan}
      setDisplay={setDisplay}
    />,
  }[display];
}

function CommonHeader({ text }: {text: string}) {
  const theme = useCustomTheme();

  return (
    <Box textAlign="center">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircleBackpackIcon />
        <Box mx={4}>
          <ConnectIcon color={theme.custom.colors.fontColor} />
        </Box>
        <KeystoneIcon />
      </Box>
      <Header text="Sign the message" style={{
        margin: "24px 0 12px",
      }} />
      <SubtextParagraph>
        {text}
      </SubtextParagraph>
    </Box>
  );
}