import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { UI_RPC_METHOD_KEYRING_AUTOLOCK_UPDATE } from "@coral-xyz/common";
import { TextField, PrimaryButton, SecondaryButton } from "../../../common";
import { useNavStack } from "../../../common/Layout/NavStack";
import { useAutolockSecs, useBackgroundClient } from "@coral-xyz/recoil";
import { TextInput } from "../../../common/Inputs";

export function PreferencesAutoLock() {
  const nav = useNavStack();
  const theme = useCustomTheme();
  const autoLockSecs = useAutolockSecs();
  const background = useBackgroundClient();
  const [minutes, setMinutes] = useState(autoLockSecs / 60.0);

  useEffect(() => {
    nav.setTitle("Auto-lock timer");
  }, []);

  const onCancel = () => {
    nav.pop();
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes > 0) {
      const secs = Math.round(minutes * 60);
      await background.request({
        method: UI_RPC_METHOD_KEYRING_AUTOLOCK_UPDATE,
        params: [secs],
      });
      nav.pop();
    }
  };

  return (
    <form
      onSubmit={save}
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div>
        <Typography
          style={{
            color: theme.custom.colors.secondary,
            textAlign: "center",
            fontSize: "20px",
            lineHeight: "28px",
            fontWeight: 500,
            marginTop: "46px",
            marginBottom: "63px",
          }}
        >
          Set the duration of the auto-lock timer.
        </Typography>
        <TextInput
          placeholder={""}
          type={"string"}
          error={false}
          autoFocus={true}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          value={minutes.toString()}
          setValue={(e) => {
            if (isNaN(e.target.value)) {
              return;
            }
            setMinutes(+e.target.value.replace(/[.,]/g, ""));
          }}
          endAdornment={
            <Typography
              style={{
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "24px",
                color: theme.custom.colors.secondary,
              }}
            >
              minutes
            </Typography>
          }
        />
      </div>
      <div style={{ display: "flex" }}>
        <SecondaryButton
          label="Cancel"
          onClick={() => onCancel()}
          style={{
            marginRight: "8px",
            border: `${theme.custom.colors.borderFull}`,
          }}
        />
        <PrimaryButton label="Set" type="submit" disabled={minutes <= 0} />
      </div>
    </form>
  );
}
