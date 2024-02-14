import { useState } from "react";
import { Trans, useTranslation } from "@coral-xyz/i18n";
import {
  BpPrimaryButton,
  StyledText,
  useTheme,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";

import { CheckboxForm } from "../../common";

export function RecoveryPhraseCopyWarning({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [checked, setChecked] = useState(false);

  return (
    <YStack ai="center" f={1} gap={40}>
      <YStack ai="center" gap={16} width={580}>
        <StyledText fontSize={36} fontWeight="$semiBold" textAlign="center">
          {t("secret_recovery_phrase_warning.title")}
        </StyledText>
      </YStack>
      <YStack ai="center" gap={40} width={450}>
        <StyledText
          mt={-24}
          color="$baseTextMedEmphasis"
          textAlign="center"
          width={400}
        >
          {t("secret_recovery_phrase_warning.subtitle")}
        </StyledText>
        <YStack gap={16}>
          <XStack
            ai="center"
            backgroundColor="$baseBackgroundL1"
            borderRadius={12}
            f={1}
            gap={16}
            p={24}
          >
            <_WarningIcon />
            <StyledText color="$baseTextMedEmphasis">
              <Trans
                i18nKey="secret_recovery_phrase_warning.card1"
                components={{
                  emphasis: <StyledText color="$baseTextHighEmphasis" />,
                }}
              />
            </StyledText>
          </XStack>
          <XStack
            ai="center"
            backgroundColor="$baseBackgroundL1"
            borderRadius={12}
            f={1}
            gap={16}
            p={24}
          >
            <_LockIcon />
            <StyledText color="$baseTextMedEmphasis">
              <Trans
                i18nKey="secret_recovery_phrase_warning.card2"
                components={{
                  emphasis: <StyledText color="$baseTextHighEmphasis" />,
                }}
              />
            </StyledText>
          </XStack>
        </YStack>
      </YStack>
      <YStack gap={16} width={420}>
        <CheckboxForm
          checked={checked}
          setChecked={setChecked}
          style={{ alignItems: "flex-start" }}
          label={t("secret_recovery_phrase_warning.check")}
          labelStyle={{
            color: theme.baseTextHighEmphasis.val,
            marginTop: -6,
            textAlign: "left",
          }}
        />
        <BpPrimaryButton
          disabled={!checked}
          label={t("next")}
          onPress={onNext}
        />
      </YStack>
    </YStack>
  );
}

function _LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
    >
      <path
        d="M18 8.5H17V6.5C17 3.74 14.76 1.5 12 1.5C9.24 1.5 7 3.74 7 6.5V8.5H6C4.9 8.5 4 9.4 4 10.5V20.5C4 21.6 4.9 22.5 6 22.5H18C19.1 22.5 20 21.6 20 20.5V10.5C20 9.4 19.1 8.5 18 8.5ZM12 17.5C10.9 17.5 10 16.6 10 15.5C10 14.4 10.9 13.5 12 13.5C13.1 13.5 14 14.4 14 15.5C14 16.6 13.1 17.5 12 17.5ZM9 8.5V6.5C9 4.84 10.34 3.5 12 3.5C13.66 3.5 15 4.84 15 6.5V8.5H9Z"
        fill="#00C278"
      />
    </svg>
  );
}

function _WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
    >
      <path
        d="M4.47012 20.5037H19.5301C21.0701 20.5037 22.0301 18.8337 21.2601 17.5037L13.7301 4.49372C12.9601 3.16372 11.0401 3.16372 10.2701 4.49372L2.74012 17.5037C1.97012 18.8337 2.93012 20.5037 4.47012 20.5037ZM12.0001 13.5037C11.4501 13.5037 11.0001 13.0537 11.0001 12.5037V10.5037C11.0001 9.95372 11.4501 9.50372 12.0001 9.50372C12.5501 9.50372 13.0001 9.95372 13.0001 10.5037V12.5037C13.0001 13.0537 12.5501 13.5037 12.0001 13.5037ZM13.0001 17.5037H11.0001V15.5037H13.0001V17.5037Z"
        fill="#EFA411"
      />
    </svg>
  );
}
