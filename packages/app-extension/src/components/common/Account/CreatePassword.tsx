import { type FormEvent, useCallback, useEffect, useState } from "react";
import { BACKPACK_TERMS_OF_SERVICE } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { PrimaryButton, TextInput } from "@coral-xyz/react-common";
import { useTheme } from "@coral-xyz/tamagui";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";

import { CheckboxForm, Header, SubtextParagraph } from "../../common";

enum PasswordError {
  TOO_SHORT,
  NO_MATCH,
}

export function CreatePassword({
  onNext,
}: {
  onNext: (password: string) => void;
}) {
  const theme = useTheme();
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<PasswordError | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setError(null);
  }, [password, passwordConfirm]);

  const next = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (password.length < 8) {
        setError(PasswordError.TOO_SHORT);
        return;
      } else if (password !== passwordConfirm) {
        setError(PasswordError.NO_MATCH);
        return;
      }
      onNext(password);
    },
    [onNext, password, passwordConfirm]
  );

  const isNextDisabled = !checked;

  return (
    <form
      noValidate
      onSubmit={next}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          marginTop: "24px",
        }}
      >
        <Box
          sx={{
            marginLeft: "24px",
            marginRight: "24px",
          }}
        >
          <Header text={t("create_password")} />
          <SubtextParagraph style={{ marginTop: "8px", marginBottom: "40px" }}>
            {t("atleast_8_characters")}
            <br />
            {t("unlock_backpack")}
          </SubtextParagraph>
        </Box>
        <Box
          sx={{
            marginLeft: "16px",
            marginRight: "16px",
          }}
        >
          <TextInput
            autoFocus={!passwordConfirm}
            inputProps={{ name: "password" }}
            placeholder={t("password")}
            type={showPassword ? "text" : "password"}
            value={password}
            setValue={(e) => setPassword(e.target.value)}
            error={error === PasswordError.TOO_SHORT}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  disableRipple
                  sx={{ color: theme.baseIcon.val }}
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
          <TextInput
            inputProps={{ name: "password-confirmation" }}
            placeholder={t("confirm_password")}
            type={showPassword ? "text" : "password"}
            value={passwordConfirm}
            setValue={(e) => setPasswordConfirm(e.target.value)}
            error={error === PasswordError.NO_MATCH}
          />
          {error !== null ? (
            <Typography sx={{ color: theme.redText.val }}>
              {
                {
                  [PasswordError.TOO_SHORT]: t("password_too_short"),
                  [PasswordError.NO_MATCH]: t("password_mismatch"),
                }[error]
              }
            </Typography>
          ) : null}
        </Box>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "30px",
          }}
        >
          <CheckboxForm
            checked={checked}
            setChecked={setChecked}
            label={
              <>
                {t("i_agree_to_the")}{" "}
                <span
                  onClick={() => window.open(BACKPACK_TERMS_OF_SERVICE)}
                  style={{ color: theme.accentBlue.val }}
                >
                  {t("terms_of_service")}
                </span>
              </>
            }
          />
        </Box>
        <PrimaryButton
          disabled={isNextDisabled}
          label={t("next")}
          type="submit"
          buttonLabelStyle={{
            fontWeight: 600,
          }}
        />
      </Box>
    </form>
  );
}
