import { useEffect, useState } from "react";
import type { Blockchain, DerivationPath } from "@coral-xyz/common";
import {
  toTitleCase,
  UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
} from "@coral-xyz/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { Box } from "@mui/material";
import { encode } from "bs58";

import {
  Header,
  HeaderIcon,
  PrimaryButton,
  SubtextParagraph,
} from "../../common";
import { HardwareWalletIcon } from "../../common/Icon";

export function HardwareSign({
  blockchain,
  message,
  publicKey,
  derivationPath,
  accountIndex,
  text,
  onNext,
}: {
  blockchain: Blockchain;
  message: string;
  publicKey: string;
  derivationPath: DerivationPath | undefined;
  accountIndex: number;
  text: string;
  onNext: (signature: string) => void;
}) {
  const background = useBackgroundClient();
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (publicKey && derivationPath && accountIndex) {
        const signature = await background.request({
          method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_PUBLIC_KEY,
          params: [
            blockchain,
            encode(Buffer.from(message, "utf-8")),
            publicKey,
            {
              accountIndex,
              publicKey,
            },
          ],
        });
        setSignature(signature);
      }
    })();
  }, [publicKey, derivationPath, accountIndex]);

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
        <Header text="Sign the message" />
        <SubtextParagraph>{text}</SubtextParagraph>
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
