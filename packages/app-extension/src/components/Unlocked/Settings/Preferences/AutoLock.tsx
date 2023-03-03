import { useEffect, useState } from "react";
import { UI_RPC_METHOD_KEYRING_AUTO_LOCK_SETTINGS_UPDATE } from "@coral-xyz/common";
import {
  ListItem,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from "@coral-xyz/react-common";
import { useAutoLockSettings, useBackgroundClient } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { LockClock } from "@mui/icons-material";
import { Typography } from "@mui/material";

import { useNavigation } from "../../../common/Layout/NavStack";

import { Checkmark } from "./Solana/ConnectionSwitch";

export function PreferencesAutoLock() {
  const nav = useNavigation();
  const theme = useCustomTheme();
  const settings = useAutoLockSettings();
  const background = useBackgroundClient();
  const [minutes, setMinutes] = useState(
    settings.seconds ? settings.seconds / 60.0 : undefined
  );
  const [option, setOption] = useState(settings.option);

  useEffect(() => {
    nav.setOptions({ headerTitle: "Auto-lock timer" });
  }, []);

  const onCancel = () => {
    nav.pop();
  };

  const save = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = (() => {
      if (!option && minutes) {
        const secs = Math.round(minutes * 60);
        return [secs, undefined];
      } else {
        return [undefined, option];
      }
    })();
    await background.request({
      method: UI_RPC_METHOD_KEYRING_AUTO_LOCK_SETTINGS_UPDATE,
      params,
    });
    nav.pop();
  };

  const options = [
    { id: "never", text: "Never" },
    { id: "onClose", text: "Every time I close Backpack" },
  ] as { id: typeof settings.option; text: string }[];

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
        textAlign: "center",
        alignContent: "center",
        color: theme.custom.colors.secondary,
      }}
    >
      <LockClock
        sx={{
          color: theme.custom.colors.icon,
          fontSize: 40,
          margin: "32px auto 0",
        }}
      />
      <Typography
        style={{
          fontSize: 14,
          fontWeight: 500,
          margin: "16px auto",
        }}
      >
        Lock Backpack when I'm inactive for:
      </Typography>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridAutoRows: "max-content",
          rowGap: 12,
        }}
      >
        <div style={{ marginBottom: -2 }}>
          <TextInput
            placeholder=""
            type="string"
            required={false}
            error={false}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            value={!option && minutes ? minutes.toString() : ""}
            setValue={(e) => {
              if (isNaN(e.target.value)) {
                return;
              }
              if (option) setOption(undefined);
              setMinutes(+e.target.value.replace(/[.,]/g, "").substring(0, 3));
            }}
            // disabled={option !== "seconds"}
            endAdornment={
              <Typography
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  lineHeight: "24px",
                  color: theme.custom.colors.secondary,
                }}
              >
                Minutes
              </Typography>
            }
          />
        </div>

        {options.map(({ id, text }) => (
          <ListItem
            key={id}
            isFirst
            isLast
            onClick={() => {
              setOption(id);
            }}
            detail={option === id ? <Checkmark /> : null}
          >
            <Typography style={{ padding: "0 8px" }}>{text}</Typography>
          </ListItem>
        ))}
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
        <PrimaryButton
          label="Set"
          type="submit"
          disabled={!option ? !minutes : false}
        />
      </div>
    </form>
  );
}
