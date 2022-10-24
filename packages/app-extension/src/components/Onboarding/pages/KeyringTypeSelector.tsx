import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import { KeyringType, toTitleCase } from "@coral-xyz/common";
import { Box } from "@mui/material";
import {
  Header,
  HeaderIcon,
  PrimaryButton,
  SubtextParagraph,
} from "../../common";
import { HardwareWalletIcon } from "../../common/Icon";

export const KeyringTypeSelector = ({
  action,
  onNext,
}: {
  action: "create" | "import";
  onNext: (keyringType: KeyringType) => void;
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
      <Box sx={{ margin: "56px 24px 0 24px", textAlign: "center" }}>
        <HeaderIcon icon={<HardwareWalletIcon />} />
        {action === "create" && (
          <>
            <Header text="Create a new wallet" />
            <SubtextParagraph>
              Choose a wallet type. If you're not sure, using a recovery phrase
              is the most common option.
            </SubtextParagraph>
          </>
        )}
        {action === "import" && (
          <>
            <Header text="Import an existing wallet" />
            <SubtextParagraph>
              Choose a method to import your wallet.
            </SubtextParagraph>
          </>
        )}
      </Box>
      <Box
        style={{
          padding: "0 16px 16px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <Box style={{ marginBottom: "16px" }}>
          <PrimaryButton
            label={`${toTitleCase(action)} from recovery phrase`}
            onClick={() => onNext("mnemonic")}
          />
        </Box>
        <SubtextParagraph onClick={() => onNext("ledger")}>
          I already have an account
        </SubtextParagraph>
      </Box>
    </div>
  );
};
