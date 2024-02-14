import { type FormEvent, useCallback, useEffect, useState } from "react";
import { BACKPACK_TERMS_OF_SERVICE } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  BpInputInner,
  BpPasswordInput,
  BpPrimaryButton,
  StyledText,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";

import { CheckboxForm } from "../../common";

enum PasswordError {
  TOO_SHORT,
  NO_MATCH,
}

export function CreatePassword({
  onNext,
}: {
  onNext: (password: string) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<PasswordError | null>(null);

  const isNextDisabled = !checked;

  useEffect(() => {
    setError(null);
  }, [password, passwordConfirm]);

  const next = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isNextDisabled) return;
      if (password.length < 8) {
        setError(PasswordError.TOO_SHORT);
        return;
      } else if (password !== passwordConfirm) {
        setError(PasswordError.NO_MATCH);
        return;
      }
      onNext(password);
    },
    [isNextDisabled, onNext, password, passwordConfirm]
  );

  return (
    <form
      noValidate
      onSubmit={next}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        gap: 40,
        width: "100%",
      }}
    >
      <YStack gap={16}>
        <StyledText fontSize={36} fontWeight="$semiBold" textAlign="center">
          {t("create_password")}
        </StyledText>
        <StyledText color="$baseTextMedEmphasis" textAlign="center">
          {t("atleast_8_characters")}
          <br />
          {t("unlock_backpack")}
        </StyledText>
      </YStack>
      <YStack f={1} gap={16}>
        <BpPasswordInput
          autoFocus={!passwordConfirm}
          hasError={error === PasswordError.TOO_SHORT}
          placeholder={t("password")}
          value={password}
          onChangeText={setPassword}
        />
        <BpInputInner
          secureTextEntry
          hasError={error === PasswordError.NO_MATCH}
          paddingVertical={24}
          placeholder={t("confirm_password")}
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
        />
        {error !== null ? (
          <StyledText color="$redText" mb={-8}>
            {
              {
                [PasswordError.TOO_SHORT]: t("password_too_short"),
                [PasswordError.NO_MATCH]: t("password_mismatch"),
              }[error]
            }
          </StyledText>
        ) : null}
      </YStack>
      <YStack gap={16} maxWidth={420}>
        <CheckboxForm
          checked={checked}
          setChecked={setChecked}
          label={
            <>
              {t("i_agree_to_the")}{" "}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(BACKPACK_TERMS_OF_SERVICE, "_blank");
                }}
                style={{ color: theme.accentBlue.val }}
              >
                {t("terms_of_service")}
              </span>
            </>
          }
        />
        <BpPrimaryButton
          disabled={isNextDisabled}
          label={t("next")}
          onPress={() => next}
        />
      </YStack>
    </form>
  );
}
