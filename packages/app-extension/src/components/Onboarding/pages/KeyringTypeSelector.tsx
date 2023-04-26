import { useState } from "react";
import type { KeyringType } from "@coral-xyz/common";
import { toTitleCase } from "@coral-xyz/common";
import {
  HardwareWalletIcon,
  PrimaryButton,
  SecondaryButton,
} from "@coral-xyz/react-common";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../common";

export const KeyringTypeSelector = ({
  action,
  onNext,
}: {
  action: "create" | "import" | "recover" | string;
  onNext: (keyringType: KeyringType) => void;
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
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
            label={`${toTitleCase(action)} with secret phrase`}
            onClick={() => onNext("mnemonic")}
          />
        </Box>
        {showAdvancedOptions ? (
          <>
            {action === "import" || action === "recover" ? (
              <Box style={{ marginBottom: "16px" }}>
                <SecondaryButton
                  label={`${toTitleCase(action)} with private key`}
                  onClick={() => onNext("private-key")}
                />
              </Box>
            ) : null}
            <Box style={{ marginBottom: "16px" }}>
              <SecondaryButton
                label={
                  action === "recover"
                    ? "Recover with hardware wallet"
                    : "I have a hardware wallet"
                }
                onClick={() => onNext("ledger")}
              />
            </Box>
            <SubtextParagraph onClick={() => setShowAdvancedOptions(false)}>
              Hide advanced options
            </SubtextParagraph>
          </>
        ) : (
          <SubtextParagraph onClick={() => setShowAdvancedOptions(true)}>
            Show advanced options
          </SubtextParagraph>
        )}
      </Box>
    </div>
  );
};
