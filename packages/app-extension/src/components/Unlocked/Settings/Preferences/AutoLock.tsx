import { useState } from "react";
import { useTranslation } from "@coral-xyz/i18n";
import { ListItem, TextInput } from "@coral-xyz/react-common";
import {
  secureUserAtom,
  useAutoLockSettings,
  useBackgroundClient,
  userClientAtom,
} from "@coral-xyz/recoil";
import {
  BpPrimaryButton,
  BpSecondaryButton,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import { LockClock } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { useNavigation } from "@react-navigation/native";
import { useRecoilValue } from "recoil";

import { Checkmark } from "./Blockchains/ConnectionSwitch";

export function PreferencesAutoLock() {
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const settings = useAutoLockSettings();
  const userClient = useRecoilValue(userClientAtom);
  const user = useRecoilValue(secureUserAtom);
  const [minutes, setMinutes] = useState(
    settings.seconds ? settings.seconds / 60.0 : 10
  );
  const [option, setOption] = useState(settings.option);
  const { t } = useTranslation();

  const onCancel = (e: any) => {
    e?.preventDefault();
    navigation.goBack();
  };

  const save = async (e?: any) => {
    e?.preventDefault();
    navigation.goBack();

    // Hack to allow the react navigation animation to complete nicely.
    setTimeout(async () => {
      const seconds = Math.round(minutes * 60);
      await userClient.updateUserPreferences({
        uuid: user.user.uuid,
        preferences: {
          autoLockSettings: {
            seconds,
          },
        },
      });
    }, 500);
  };

  const options = [
    // { id: "never", text: t("never") },
    // { id: "onClose", text: t("every_time_close_backpack") },
  ] as { id: typeof settings.option; text: string }[];

  return (
    <form
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
      </div>

      <YStack space="$4">
        <BpSecondaryButton label={t("cancel")} onPress={onCancel} />
        <BpPrimaryButton
          label={t("set")}
          onPress={save}
          disabled={!option ? !minutes : false}
        />
      </YStack>
    </form>
  );
}
