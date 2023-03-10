import { PrimaryButton } from "@coral-xyz/tamagui";
import { Box } from "@mui/material";

import { SubtextParagraph } from "../../common";
import { BackpackHeader } from "../../Locked";

export const CreateOrImportWallet = ({
  onNext,
}: {
  onNext: (action: "create" | "import") => void;
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
      <Box style={{ flex: 1, textAlign: "center", padding: "0 16px" }}>
        <BackpackHeader disableUsername />
      </Box>
      <Box
        style={{
          padding: "0 16px 16px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <Box sx={{ mb: "16px" }}>
          <PrimaryButton
            label="Create a new wallet"
            onPress={() => onNext("create")}
          />
        </Box>
        <SubtextParagraph onClick={() => onNext("import")}>
          I already have a wallet
        </SubtextParagraph>
      </Box>
    </div>
  );
};
