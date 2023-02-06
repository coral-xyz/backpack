import { useEffect, useState } from "react";
import type { Blockchain, WalletDescriptor } from "@coral-xyz/common";
import {
  toTitleCase,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { HardwareWalletIcon, PrimaryButton } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { Box } from "@mui/material";
import { encode } from "bs58";

import { Header, HeaderIcon, SubtextParagraph } from "../../common";

export function HardwareSign({
  blockchain,
  walletDescriptor,
  message,
  text,
  onNext,
}: {
  blockchain: Blockchain;
  walletDescriptor: WalletDescriptor;
  message: string;
  text: string;
  onNext: (signature: string) => void;
}) {
  const background = useBackgroundClient();
  const [signature, setSignature] = useState<string | null>(null);
  const [requiresBlindSign, setRequiresBlindSign] = useState(false);

  useEffect(() => {
    (async () => {
      if (!requiresBlindSign) {
        try {
          const signature = await background.request({
            method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
            params: [
              blockchain,
              walletDescriptor.publicKey,
              encode(Buffer.from(message, "utf-8")),
              [[walletDescriptor]],
            ],
          });
          setSignature(signature);
        } catch (error: unknown) {
          if (String(error).includes("enabling blind signature")) {
            setRequiresBlindSign(true);
          }
          return;
        }
      }
    })();
  }, [requiresBlindSign]);

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
        {requiresBlindSign ? (
          <>
            <HeaderIcon icon={<HardwareWalletIcon />} />
            <Header text="Enable blind signing" />
            <SubtextParagraph>
              Please enable blind signing in the settings of the{" "}
              {toTitleCase(blockchain)} app on your hardware wallet.
            </SubtextParagraph>
          </>
        ) : (
          <>
            <HeaderIcon icon={<HardwareWalletIcon />} />
            <Header text="Sign the message" />
            <SubtextParagraph>{text}</SubtextParagraph>
          </>
        )}
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
        {requiresBlindSign ? (
          <PrimaryButton
            label="Retry"
            onClick={() => {
              setRequiresBlindSign(false);
            }}
          />
        ) : (
          <PrimaryButton
            label="Next"
            onClick={() => {
              onNext(signature!);
            }}
            disabled={!signature}
          />
        )}
      </Box>
    </Box>
  );
}
