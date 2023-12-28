import { useEffect, useState } from "react";
import {
  UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
  UI_RPC_METHOD_PASSWORD_UPDATE,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { InputListItem, Inputs, PrimaryButton } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { Button, Typography } from "@mui/material";

import { SubtextParagraph } from "../../../common";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

enum PasswordError {
  TOO_SHORT,
  NO_MATCH,
}

const MIN_PASSWORD_LENGTH = 8;

export function ChangePassword() {
  const theme = useTheme();
  const { close } = useDrawerContext();
  const nav = useNavigation();
  const background = useBackgroundClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPw1, setNewPw1] = useState("");
  const [newPw2, setNewPw2] = useState("");

  const [currentPasswordError, setCurrentPasswordError] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);
  const [passwordLengthError, setPasswordLengthError] = useState(false);
  const missingNewPw = newPw1.trim() === "" || newPw2.trim() === "";
  const [error, setError] = useState<PasswordError | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const title = nav.title;
    nav.setOptions({ headerTitle: t("change_password") });
    return () => {
      nav.setOptions({ headerTitle: title });
    };
  }, []);

  return (
    <div style={{ paddingTop: "16px", height: "100%" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          (async () => {
            // ph101pp todo
            const isCurrentCorrect = await background.request({
              method: UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
              params: [currentPassword],
            });
            const mismatchError = newPw1.trim() === "" || newPw1 !== newPw2;
            const passwordLengthError = newPw1.length < MIN_PASSWORD_LENGTH;

            setCurrentPasswordError(!isCurrentCorrect);
            setPasswordMismatchError(mismatchError);
            setPasswordLengthError(passwordLengthError);

            if (!isCurrentCorrect || mismatchError || passwordLengthError) {
              if (mismatchError) setError(PasswordError.NO_MATCH);
              else if (passwordLengthError) setError(PasswordError.TOO_SHORT);
              return;
            }
            // ph101pp todo
            await background.request({
              method: UI_RPC_METHOD_PASSWORD_UPDATE,
              params: [currentPassword, newPw1],
            });

            close();
          })();
        }}
        style={{ display: "flex", height: "100%", flexDirection: "column" }}
      >
        <div style={{ flex: 1, flexGrow: 1 }}>
          <Inputs error={currentPasswordError}>
            <InputListItem
              isFirst
              isLast
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t("enter_password")}
              type="password"
              button={false}
              title="Current"
            />
          </Inputs>
          <Button
            onClick={() => nav.push("reset", { closeDrawer: () => nav.pop() })}
            disableRipple
            style={{
              padding: 0,
              backgroundColor: "transparent",
              marginTop: "10px",
              marginLeft: "26px",
              marginBottom: "26px",
              textTransform: "none",
              color: theme.accentBlue.val,
            }}
          >
            <Typography
              style={{
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "24px",
              }}
            >
              {t("forgot_password")}
            </Typography>
          </Button>
          <Inputs error={passwordMismatchError || passwordLengthError}>
            <InputListItem
              isFirst
              value={newPw1}
              onChange={(e) => setNewPw1(e.target.value)}
              placeholder={t("enter_password")}
              type="password"
              button={false}
              title="New"
            />
            <InputListItem
              isLast
              value={newPw2}
              onChange={(e) => setNewPw2(e.target.value)}
              placeholder={t("re_enter_password")}
              type="password"
              button={false}
              title={t("verify")}
            />
          </Inputs>
          {error !== null ? (
            <Typography
              sx={{
                color: theme.redText.val,
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              {
                {
                  [PasswordError.TOO_SHORT]: t("password_too_short_warning", {
                    minPasswordLength: MIN_PASSWORD_LENGTH,
                  }),
                  [PasswordError.NO_MATCH]: t("password_no_match"),
                }[error]
              }
            </Typography>
          ) : null}
          <SubtextParagraph
            style={{
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              marginLeft: "26px",
              marginRight: "26px",
              marginTop: "10px",
            }}
          >
            {t("password_too_short_warning2", {
              minPasswordLength: MIN_PASSWORD_LENGTH,
            })}
          </SubtextParagraph>
        </div>
        <div style={{ padding: 16 }}>
          <PrimaryButton
            label={t("change_password")}
            type="submit"
            disabled={missingNewPw}
          />
        </div>
      </form>
    </div>
  );
}
