import type { MutableRefObject } from "react";
import { useCallback, useEffect, useState } from "react";
import { SolanaKeystoneKeyring } from "@coral-xyz/blockchain-solana";
import type { Blockchain, UR, WalletDescriptor } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { URType } from "@keystonehq/animated-qr";
import { Box } from "@mui/system";

import { Header, SubtextParagraph } from "../../../../common";
import {
  CircleBackpackIcon,
  ConnectIcon,
  KeystoneIcon,
} from "../../../../common/Icon";
import {
  DisplayType,
  KeystonePlayer,
  KeystoneScanError,
  KeystoneScanner,
} from "../../../../common/Keystone";

export function ConnectHardwareKeystoneSign({
  containerRef,
  walletDescriptor,
  message,
  ur,
  isInDrawer,
  onNext,
  onError,
}: {
  containerRef: MutableRefObject<any>;
  blockchain: Blockchain;
  walletDescriptor: WalletDescriptor;
  message: string;
  ur: UR;
  isInDrawer?: boolean;
  onNext: (signature: string) => void;
  onError: () => void;
}) {
  const [msgPlayUR, setMsgPlayUR] = useState<UR>();
  const [xfp, setXFP] = useState<string>("");
  const [display, setDisplay] = useState(DisplayType.qrcode);
  const [isScanError, setIsScanError] = useState(false);

  let readQRResolve: (ur: UR, xfp: string) => void;

  const signMsg = async () => {
    const keyring = await SolanaKeystoneKeyring.fromUR(ur);
    setXFP(keyring.getXFP());
    keyring.onPlay(async (e) => {
      setMsgPlayUR(e);
    });
    keyring.onRead(
      () =>
        new Promise((resolve) => {
          readQRResolve = resolve;
        })
    );
    const sig = await keyring.signMessage(
      Buffer.from(message),
      walletDescriptor.publicKey
    );
    onNext(sig);
  };

  const handleScan = useCallback((ur: UR) => {
    readQRResolve(ur, xfp);
  }, []);

  useEffect(() => {
    signMsg().catch((err) => {
      console.error(err);
      setIsScanError(true);
    });
  }, [ur]);

  return {
    [DisplayType.qrcode]: (
      <KeystonePlayer
        header={
          <CommonHeader text="Scan the QR code via your Keystone device." />
        }
        ur={msgPlayUR}
        setDisplay={setDisplay}
        size={isInDrawer ? 180 : 200}
      />
    ),
    [DisplayType.scanner]: (
      <>
        <KeystoneScanner
          containerRef={containerRef}
          header={
            <CommonHeader
              text="Scan the QR code displayed on your Keystone Device."
              style={{ marginBottom: isInDrawer ? "32px" : "48px" }}
            />
          }
          onScan={handleScan}
          setDisplay={setDisplay}
          urTypes={[URType.SOL_SIGNATURE]}
          size={isInDrawer ? 200 : 220}
        />
        <KeystoneScanError
          containerRef={containerRef}
          isError={isScanError}
          setIsError={setIsScanError}
          onOK={() => {
            setIsScanError(false);
            onError();
          }}
        />
      </>
    ),
  }[display];
}

function CommonHeader({
  text,
  ...args
}: {
  text: string;
  [propType: string]: any;
}) {
  const theme = useCustomTheme();

  return (
    <Box textAlign="center" {...args}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircleBackpackIcon width={40} height={40} />
        <Box mx="28px" height="24px">
          <ConnectIcon color={theme.custom.colors.fontColor} />
        </Box>
        <KeystoneIcon width={40} height={40} />
      </Box>
      <Header
        text="Sign the message"
        style={{
          margin: "24px 0 12px",
        }}
      />
      <SubtextParagraph style={{ fontSize: "14px" }}>{text}</SubtextParagraph>
    </Box>
  );
}
