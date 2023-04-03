import { PrimaryButton } from "@coral-xyz/react-common";
import { Box } from "@mui/material";

import { SubtextParagraph } from "../../common";
import { BackpackHeader } from "../../Locked";

export const CreateOrImportWallet = ({
  onNext,
}: {
  onNext: (data: any) => void;
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box style={{ flex: 1, textAlign: "center", padding: "32px 16px 0px" }}>
        <BackpackHeader disableUsername />
      </Box>
      <Box
        style={{
          padding: "0 16px 16px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <Box sx={{ mt: "24px" }}>
          <PrimaryButton
            label="Create a new wallet"
            onClick={() => onNext({ keyringType: "mnemonic" })}
          />
        </Box>
        <Box sx={{ mb: "36px", mt: "24px" }}>
          <SubtextParagraph onClick={() => onNext({ action: "import" })}>
            I already have a wallet
          </SubtextParagraph>
        </Box>
      </Box>
    </div>
  );
};
