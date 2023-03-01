import { useEffect, useRef, useState } from "react";
import type { UR } from "@coral-xyz/common";
import { BrowserRuntimeCommon } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { URType } from "@keystonehq/animated-qr";
import { Box, Link, Typography } from "@mui/material";

import { KeystoneWithWordsIcon } from "../components/common/Icon";
import { KeystonePlayer, KeystoneScanner } from "../components/common/Keystone";

function KeystonePlay({
  ur,
  onNext,
  isInDrawer,
}: {
  ur: UR;
  isInDrawer?: boolean;
  onNext: () => void;
}) {
  const theme = useCustomTheme();

  return (
    <KeystonePlayer
      header={
        <CommonHeader
          text="Scan the QR code via your Keystone Device."
          hasTutorial={isInDrawer}
        />
      }
      help={
        <>
          <Box>
            Click on the '
            <span style={{ color: theme.custom.colors.fontColor }}>
              Get Signature
            </span>
            ' button after signing the transaction with your Keystone device.
          </Box>
          {!isInDrawer ? (
            <Box mt={2}>
              <Link
                href="https://keyst.one/t/backpack"
                target="_blank"
                sx={{
                  color: theme.custom.colors.fontColor3,
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >
                Tutorial
              </Link>
            </Box>
          ) : null}
        </>
      }
      ur={ur}
      size={isInDrawer ? 220 : 260}
      setDisplay={onNext}
    />
  );
}

function KeystoneScan({
  isInDrawer,
  onNext,
  onPrev,
}: {
  isInDrawer?: boolean;
  onNext: () => void;
  onPrev: () => void;
}) {
  const containerRef = useRef(document.body);
  const theme = useCustomTheme();

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
          hasTutorial={isInDrawer}
        />
      }
      help={
        !isInDrawer ? (
          <Box mt={2} textAlign="center">
            <Link
              href="https://keyst.one/t/backpack"
              target="_blank"
              sx={{
                color: theme.custom.colors.fontColor3,
                fontSize: "14px",
                lineHeight: "20px",
              }}
            >
              Tutorial
            </Link>
          </Box>
        ) : null
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
  hasTutorial,
}: {
  text: string;
  hasTutorial?: boolean;
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
        {hasTutorial ? (
          <Link
            href="https://keyst.one/t/backpack"
            target="_blank"
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              color: theme.custom.colors.fontColor3,
              fontSize: "14px",
              lineHeight: "24px",
            }}
          >
            Tutorial
          </Link>
        ) : null}
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
    </Box>
  );
}

export function useKeystoneSign(props?: { isInDrawer?: boolean }) {
  const [type, setType] = useState<"play" | "scan">();
  const [ur, setUR] = useState();
  const [open, setOpen] = useState<boolean>();

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
          />
        ),
        scan: (
          <KeystoneScan
            onPrev={() => setType("play")}
            onNext={() => setOpen(false)}
            isInDrawer={props?.isInDrawer}
          />
        ),
      }[type],
    resetKeystoneSign,
    openKeystone: open,
  };
}
