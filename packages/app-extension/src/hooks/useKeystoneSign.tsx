import { useEffect, useRef, useState } from "react";
import type { UR } from "@coral-xyz/common";
import { BrowserRuntimeCommon } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { URType } from "@keystonehq/animated-qr";
import { Box, Typography } from "@mui/material";

import { KeystoneWithWordsIcon } from "../components/common/Icon";
import { KeystonePlayer, KeystoneScanner } from "../components/common/Keystone";

function KeystonePlay({
  ur,
  isInDrawer,
  txCount,
  txIndex,
  onNext,
}: {
  ur: UR;
  isInDrawer?: boolean;
  txCount?: number;
  txIndex?: number;
  onNext: () => void;
}) {
  const theme = useCustomTheme();

  return (
    <KeystonePlayer
      header={
        <CommonHeader
          text="Scan the QR code via your Keystone Device."
          txCount={txCount}
          txIndex={txIndex}
        />
      }
      help={
        <Box pb="4px">
          Click on the '
          <span style={{ color: theme.custom.colors.fontColor }}>
            Get Signature
          </span>
          ' button after signing the transaction with your Keystone device.
        </Box>
      }
      ur={ur}
      size={isInDrawer ? 220 : 260}
      setDisplay={onNext}
    />
  );
}

function KeystoneScan({
  isInDrawer,
  txCount,
  txIndex,
  onNext,
  onPrev,
}: {
  isInDrawer?: boolean;
  txCount?: number;
  txIndex?: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  const containerRef = useRef(document.body);

  const onScan = (ur: UR) => {
    BrowserRuntimeCommon.sendMessageToBackground({
      type: "KEYSTONE_SCAN_UR",
      data: {
        ur,
      },
    });
    onNext();
  };

  return (
    <KeystoneScanner
      containerRef={containerRef}
      header={
        <CommonHeader
          text="Scan the QR code displayed on your Keystone Device."
          txCount={txCount}
          txIndex={txIndex}
        />
      }
      urTypes={[URType.SOL_SIGNATURE]}
      size={isInDrawer ? 220 : 260}
      onScan={onScan}
      setDisplay={onPrev}
    />
  );
}

function CommonHeader({
  text,
  txCount,
  txIndex,
}: {
  text: string;
  txCount?: number;
  txIndex?: number;
}) {
  const theme = useCustomTheme();

  return (
    <Box
      sx={{
        textAlign: "center",
        paddingTop: "16px",
      }}
    >
      <Box position="relative">
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "24px",
          }}
        >
          Request Signature
        </Typography>
      </Box>
      <Box py={2}>
        <KeystoneWithWordsIcon />
      </Box>
      <Box
        sx={{
          fontSize: "14px",
          lineHeight: "20px",
          color: theme.custom.colors.fontColor,
        }}
      >
        {text}
      </Box>
      {txCount && txCount > 1 ? (
        <Box
          sx={{
            color: theme.custom.colors.fontColor,
            marginTop: "20px",
          }}
        >
          <Typography component="span">[</Typography>
          <Typography
            component="span"
            sx={{
              color:
                txIndex === txCount
                  ? "inherit"
                  : theme.custom.colors.fontColor3,
            }}
          >
            &nbsp;{txIndex}/{txCount}&nbsp;
          </Typography>
          <Typography component="span">]</Typography>
        </Box>
      ) : null}
    </Box>
  );
}

export function useKeystoneSign(props?: {
  isInDrawer?: boolean;
  txCount?: number;
}) {
  const [type, setType] = useState<"play" | "scan">();
  const [ur, setUR] = useState();
  const [open, setOpen] = useState<boolean>();
  const [txIndex, setTxIndex] = useState(1);

  useEffect(() => {
    const handler = (msg: any, sender: any, sendResponse: (e: any) => void) => {
      if (msg.type === "KEYSTONE_PLAY_UR") {
        setType("play");
        setUR(msg.data.ur);
        setOpen(true);
        chrome.tabs
          .getCurrent()
          .then((win) => {
            sendResponse({
              windowId: win?.windowId,
            });
          })
          .catch(console.error);
        return true;
      }
    };
    BrowserRuntimeCommon.addEventListenerFromBackground(handler);
    return () => {
      BrowserRuntimeCommon.removeEventListener(handler);
    };
  }, [open]);

  const resetKeystoneSign = () => {
    setType("play");
    setUR(undefined);
    setOpen(false);
    setTxIndex(1);
  };

  const handleScanDone = () => {
    setType("play");
    setUR(undefined);
    setOpen(false);
    setTxIndex(txIndex + 1);
  };

  return {
    keystoneSign:
      type &&
      {
        play: (
          <KeystonePlay
            ur={ur!}
            onNext={() => setType("scan")}
            isInDrawer={props?.isInDrawer}
            txCount={props?.txCount}
            txIndex={txIndex}
          />
        ),
        scan: (
          <KeystoneScan
            onPrev={() => setType("play")}
            onNext={handleScanDone}
            isInDrawer={props?.isInDrawer}
            txCount={props?.txCount}
            txIndex={txIndex}
          />
        ),
      }[type],
    resetKeystoneSign,
    openKeystone: open,
  };
}
