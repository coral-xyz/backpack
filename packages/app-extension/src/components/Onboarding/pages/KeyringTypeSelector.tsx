import type { KeyringType } from "@coral-xyz/common";
import { toTitleCase } from "@coral-xyz/common";
import { HardwareWalletIcon, PrimaryButton } from "@coral-xyz/react-common";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../common";

export const KeyringTypeSelector = ({
  action,
  onNext,
}: {
  action: "create" | "import" | "recover" | string;
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
        {action === "create" ? (
          <>
            <Header text="Create a new wallet" />
            <SubtextParagraph>
              Choose a wallet type. If you're not sure, using a recovery phrase
              is the most common option.
            </SubtextParagraph>
          </>
        ) : null}
        {action === "import" ? (
          <>
            <Header text="Import an existing wallet" />
            <SubtextParagraph>
              Choose a method to import your wallet.
            </SubtextParagraph>
          </>
        ) : null}
        {action === "recover" ? (
          <>
            <Header text="Recover a username" />
            <SubtextParagraph>
              Choose a method to recover your username.
            </SubtextParagraph>
          </>
        ) : null}
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
            label={`${toTitleCase(action)} with recovery phrase`}
            onClick={() => onNext("mnemonic")}
          />
        </Box>
        {action === "import" || action === "recover" ? (
          <Box style={{ marginBottom: "16px" }}>
            <PrimaryButton
              label={`${toTitleCase(action)} with private key`}
              onClick={() => onNext("private-key")}
            />
          </Box>
        ) : null}
        <SubtextParagraph onClick={() => onNext("ledger")}>
          {action === "recover"
            ? "Recover using a hardware wallet"
            : "I have a hardware wallet"}
        </SubtextParagraph>
      </Box>
    </div>
  );
};
