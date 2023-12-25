import { useEffect, useState } from "react";
import { UI_RPC_METHOD_KEYRING_AUTO_LOCK_SETTINGS_UPDATE } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { ListItem, TextInput } from "@coral-xyz/react-common";
import { useAutoLockSettings, useBackgroundClient } from "@coral-xyz/recoil";
import {
  BpPrimaryButton,
  BpSecondaryButton,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import { LockClock } from "@mui/icons-material";
import { Typography } from "@mui/material";

import { useNavigation } from "../../../common/Layout/NavStack";

import { Checkmark } from "./Blockchains/ConnectionSwitch";

export function PreferencesAutoLock() {
  const nav = useNavigation();
  const theme = useTheme();
  const settings = useAutoLockSettings();
  const background = useBackgroundClient();
  const [minutes, setMinutes] = useState(
    settings.seconds ? settings.seconds / 60.0 : undefined
  );
  const [option, setOption] = useState(settings.option);
  const { t } = useTranslation();

  useEffect(() => {
    nav.setOptions({ headerTitle: "Autolock Settings" });
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
    // ph101pp todo
    await background.request({
      method: UI_RPC_METHOD_KEYRING_AUTO_LOCK_SETTINGS_UPDATE,
      params,
    });
    nav.pop();
  };

  const options = [
    { id: "never", text: t("never") },
    // { id: "onClose", text: t("every_time_close_backpack") },
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
        color: theme.baseTextMedEmphasis.val,
      }}
    >
      <LockClock
        sx={{
          color: theme.baseIcon.val,
          fontSize: 40,
          margin: "32px auto",
        }}
      />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridAutoRows: "max-content",
          rowGap: 12,
        }}
      >
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

        <Typography
          style={{
            fontSize: 14,
            fontWeight: 500,
            margin: "8px auto 0",
          }}
        >
          {t("autolock_title")}:
        </Typography>
        <div style={{ marginTop: -8, marginBottom: -4 }}>
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
                  color: theme.baseTextMedEmphasis.val,
                }}
              >
                {t("minutes")}
              </Typography>
            }
          />
        </div>

        <Typography
          style={{
            fontSize: 14,
            fontWeight: 500,
            margin: "0px auto",
          }}
        >
          {t("autolock_description")}
        </Typography>
      </div>

      <YStack space="$4">
        <BpSecondaryButton label={t("cancel")} onPress={() => onCancel()} />
        <BpPrimaryButton
          label={t("set")}
          onPress={() => save()}
          disabled={!option ? !minutes : false}
        />
      </YStack>
    </form>
  );
}
