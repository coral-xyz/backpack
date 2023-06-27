import type { Blockchain } from "@coral-xyz/common";
import { PrimaryButton } from "@coral-xyz/react-common";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../../../common";
import { BLOCKCHAIN_COMPONENTS } from "../../../../common/Blockchains";

export function ConnectHardwareApp({
  blockchain,
  onNext,
}: {
  blockchain: Blockchain;
  onNext: () => void;
}) {
  const header = BLOCKCHAIN_COMPONENTS[blockchain];

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
        <HeaderIcon icon={header.Icon} />
        <Header text={header.LedgerText} />
        <SubtextParagraph>
          Make sure your wallet remains connected.
        </SubtextParagraph>
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
        <PrimaryButton label="Next" onClick={onNext} />
      </Box>
    </Box>
  );
}
