import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import { useCustomTheme, styles } from "@coral-xyz/themes";
import { UI_RPC_METHOD_KEYRING_AUTOLOCK_UPDATE } from "@coral-xyz/common";
import { TextField, PrimaryButton, SecondaryButton } from "../../../common";
import { useNavStack } from "../../../common/Layout/NavStack";
import { useAutolockSecs, useBackgroundClient } from "@coral-xyz/recoil";

const useStyles = styles((theme) => ({
  textRootClass: {
    marginTop: "0 !important",
    marginBottom: "0 !important",
    "& .MuiOutlinedInput-root": {
      background: theme.custom.colors.nav,
      "& fieldset": {
        border: `${theme.custom.colors.borderFull}`,
      },
      "&:hover fieldset": {
        border: `solid 2pt ${theme.custom.colors.primaryButton}`,
      },
      "& input": {
        border: "none",
      },
    },
  },
}));

export function PreferencesAutoLock() {
  const nav = useNavStack();
  const theme = useCustomTheme();
  const classes = useStyles();
  const autoLockSecs = useAutolockSecs();
  const background = useBackgroundClient();
  const [minutes, setMinutes] = useState(autoLockSecs / 60.0);

  useEffect(() => {
    nav.setTitle("Auto-lock timer");
  }, []);

  const onCancel = () => {
    nav.pop();
  };
  const onSet = async () => {
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
    <div
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
        <TextField
          autoFocus
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          rootClass={classes.textRootClass}
          value={minutes.toString()}
          setValue={(v: string) => setMinutes(+v.replace(/[.,]/g, ""))}
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
        <PrimaryButton
          disabled={minutes <= 0}
          label="Set"
          onClick={() => onSet()}
          style={{}}
        />
      </div>
    </div>
  );
}
