import { useState } from "react";
import type { KeyringType } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  HardwareWalletIcon,
  PrimaryButton,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  BpLinkButton,
  BpPrimaryButton,
  BpSecondaryButton,
} from "@coral-xyz/tamagui";
import { Box } from "@mui/material";

import { Header, HeaderIcon, SubtextParagraph } from "../../common";

export const KeyringTypeSelector = ({
  action,
  onNext,
}: {
  action: "create" | "import" | "recover" | string;
  onNext: (keyringType: KeyringType | "recover_backpack_backup") => void;
}) => {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          margin: "56px 24px 0 24px",
          textAlign: "center",
        }}
      >
        <HeaderIcon icon={<HardwareWalletIcon />} />
        {action === "create" ? (
          <>
            <Header text={t("create_new_wallet")} />
            <SubtextParagraph>
              {t("create_new_wallet_description")}
            </SubtextParagraph>
          </>
        ) : null}
        {action === "import" ? (
          <>
            <Header text={t("import_existing_wallet")} />
            <SubtextParagraph>
              {t("import_existing_wallet_description")}
            </SubtextParagraph>
          </>
        ) : null}
        {action === "recover" ? (
          <>
            <Header text={t("recover_a_username.title")} />
            <SubtextParagraph>
              {t("recover_a_username.description")}
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
          <BpPrimaryButton
            // TODO: type this properly, remove :string from action type
            label={t(`with_secret_key.${action}` as any)}
            onPress={() => onNext("mnemonic")}
          />
        </Box>
        {showAdvancedOptions ? (
          <>
            {action === "import" || action === "recover" ? (
              <Box style={{ marginBottom: "16px" }}>
                <BpSecondaryButton
                  label={t(`with_private_key.${action}`)}
                  onPress={() => onNext("private-key")}
                />
              </Box>
            ) : null}
            {/* <Box style={{ marginBottom: "16px" }}>
              <SecondaryButton
                label={t("recover_from_backpack_backup")}
                onClick={() => onNext("recover_backpack_backup")}
              />
            </Box> */}
            <Box style={{ marginBottom: "16px" }}>
              <BpSecondaryButton
                label={
                  action === "recover"
                    ? t("recover_hardware_wallet")
                    : t("have_hardware_wallet")
                }
                onPress={() => onNext("ledger")}
              />
            </Box>
            <BpLinkButton
              label={t("hide_advanced_options")}
              onPress={() => setShowAdvancedOptions(false)}
            />
          </>
        ) : (
          <BpLinkButton
            label={t("show_advanced_options")}
            onPress={() => setShowAdvancedOptions(true)}
          />
        )}
      </Box>
    </div>
  );
};
