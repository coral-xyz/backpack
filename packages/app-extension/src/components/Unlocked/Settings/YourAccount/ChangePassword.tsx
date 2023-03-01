import { useEffect, useState } from "react";
import {
  UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
  UI_RPC_METHOD_PASSWORD_UPDATE,
} from "@coral-xyz/common";
import { InputListItem, Inputs, PrimaryButton } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Button, Typography } from "@mui/material";

import { SubtextParagraph } from "../../../common";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavigation } from "../../../common/Layout/NavStack";

export function ChangePassword() {
  const theme = useCustomTheme();
  const { close } = useDrawerContext();
  const nav = useNavigation();
  const background = useBackgroundClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPw1, setNewPw1] = useState("");
  const [newPw2, setNewPw2] = useState("");

  const [currentPasswordError, setCurrentPasswordError] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);
  const missingNewPw = newPw1.trim() === "" || newPw2.trim() === "";

  useEffect(() => {
    const title = nav.title;
    nav.setOptions({ headerTitle: "Change password" });
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
            const isCurrentCorrect = await background.request({
              method: UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
              params: [currentPassword],
            });
            const mismatchError = newPw1.trim() === "" || newPw1 !== newPw2;

            setCurrentPasswordError(!isCurrentCorrect);
            setPasswordMismatchError(mismatchError);

            if (!isCurrentCorrect || mismatchError) {
              return;
            }

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
              placeholder="Enter password"
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
              color: theme.custom.colors.brandColor,
            }}
          >
            <Typography
              style={{
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "24px",
              }}
            >
              Forgot Password?
            </Typography>
          </Button>
          <Inputs error={passwordMismatchError}>
            <InputListItem
              isFirst
              value={newPw1}
              onChange={(e) => setNewPw1(e.target.value)}
              placeholder="Enter password"
              type="password"
              button={false}
              title="New"
            />
            <InputListItem
              isLast
              value={newPw2}
              onChange={(e) => setNewPw2(e.target.value)}
              placeholder="Re-enter password"
              type="password"
              button={false}
              title="Verify"
            />
          </Inputs>
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
            Your password must be at least 8 characters long and contain letters
            and numbers.
          </SubtextParagraph>
        </div>
        <div style={{ padding: 16 }}>
          <PrimaryButton
            label="Change password"
            type="submit"
            disabled={missingNewPw}
          />
        </div>
      </form>
    </div>
  );
}
