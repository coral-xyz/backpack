import { useEffect, useState } from "react";
import type { Blockchain, DerivationPath } from "@coral-xyz/common";
import { UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET } from "@coral-xyz/common";
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
  derivationPath: DerivationPath;
  accountIndex: number;
  text: string;
  onNext: (signature: string) => void;
}) {
  const background = useBackgroundClient();
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const signature = await background.request({
        method: UI_RPC_METHOD_SIGN_MESSAGE_FOR_WALLET,
        params: [
          blockchain,
          encode(Buffer.from(message, "utf-8")),
          derivationPath,
          accountIndex,
          publicKey,
        ],
      });
      setSignature(signature);
    })();
  }, []);

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
