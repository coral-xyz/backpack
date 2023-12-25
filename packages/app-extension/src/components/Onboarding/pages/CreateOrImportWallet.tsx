import { useTranslation } from "@coral-xyz/i18n";
import { BpLinkButton, BpPrimaryButton } from "@coral-xyz/tamagui";
import { Box } from "@mui/material";

import { BackpackHeader } from "../../Locked";

export const CreateOrImportWallet = ({
  onNext,
}: {
  onNext: (data: any) => void;
}) => {
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
      <Box style={{ flex: 1, textAlign: "center", padding: "32px 16px 0px" }}>
        <BackpackHeader disableUsername disableBackpackLabel />
      </Box>
      <Box
        style={{
          padding: "0 16px 16px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <Box sx={{ mt: "24px", display: "flex" }}>
          <BpPrimaryButton
            label={t("create_new_wallet")}
            onPress={() =>
              onNext({ action: "create", keyringType: "mnemonic" })
            }
          />
        </Box>
        <Box sx={{ mt: "16px", display: "flex" }}>
          <BpLinkButton
            label={t("already_have_wallet")}
            onPress={() => onNext({ action: "import" })}
          />
        </Box>
      </Box>
    </div>
  );
};
