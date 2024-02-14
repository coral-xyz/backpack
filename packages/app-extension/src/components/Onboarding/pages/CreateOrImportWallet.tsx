import { useTranslation } from "@coral-xyz/i18n";
import {
  BpPrimaryButton,
  BpSecondaryButton,
  RedBackpackIcon,
  StyledText,
  YStack,
} from "@coral-xyz/tamagui";

export const CreateOrImportWallet = ({
  onNext,
}: {
  onNext: (data: any) => void;
}) => {
  const { t } = useTranslation();
  return (
    <YStack gap={40}>
      <div style={{ textAlign: "center" }}>
        <RedBackpackIcon />
      </div>
      <YStack gap={8}>
        <StyledText fontSize={36} fontWeight="$semiBold" textAlign="center">
          {t("welcome_to_backpack")}
        </StyledText>
        <StyledText color="$baseTextMedEmphasis" textAlign="center">
          {t("lets_get_started")}
        </StyledText>
      </YStack>
      <YStack gap={16} width={420}>
        <BpPrimaryButton
          label={t("create_new_wallet")}
          onPress={() => onNext({ action: "create", keyringType: "mnemonic" })}
        />
        <BpSecondaryButton
          label={t("import_wallet")}
          onPress={() => onNext({ action: "import" })}
        />
      </YStack>
    </YStack>
  );
};
