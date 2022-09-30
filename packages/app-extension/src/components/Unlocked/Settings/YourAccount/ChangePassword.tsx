import { useEffect, useState } from "react";
import { Button, TextField, Typography } from "@mui/material";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import {
  UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
  UI_RPC_METHOD_PASSWORD_UPDATE,
} from "@coral-xyz/common";
import {
  List,
  ListItem,
  PrimaryButton,
  SubtextParagraph,
} from "../../../common";
import { useDrawerContext } from "../../../common/Layout/Drawer";
import { useNavStack } from "../../../common/Layout/NavStack";

const useStyles = styles((theme) => ({
  textFieldRoot: {
    color: theme.custom.colors.secondary,
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: "none",
        color: theme.custom.colors.secondary,
      },
    },
  },
}));

export function ChangePassword() {
  const classes = useStyles();
  const theme = useCustomTheme();
  const { close } = useDrawerContext();
  const nav = useNavStack();
  const background = useBackgroundClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPw1, setNewPw1] = useState("");
  const [newPw2, setNewPw2] = useState("");

  const [currentPasswordError, setCurrentPasswordError] = useState(false);
  const [passwordMismatchError, setPasswordMismatchError] = useState(false);

  useEffect(() => {
    const title = nav.title;
    nav.setTitle("Change password");
    return () => {
      nav.setTitle(title);
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
          <List
            style={{
              border: currentPasswordError
                ? `solid 1pt ${theme.custom.colors.negative}`
                : `${theme.custom.colors.borderFull}`,
              borderRadius: "10px",
            }}
          >
            <ListItem
              isLast
              style={{
                height: "46px",
                padding: "10px",
                borderRadius: "8px",
              }}
              button={false}
            >
              <Typography style={{ width: "80px" }}>Current</Typography>
              <TextField
                placeholder="Enter password"
                type="password"
                classes={{
                  root: classes.textFieldRoot,
                }}
                className={classes.textField}
                inputProps={{
                  style: {
                    color: theme.custom.colors.secondary,
                    padding: 0,
                  },
                }}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </ListItem>
          </List>
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
          <List
            style={{
              border: passwordMismatchError
                ? `solid 1pt ${theme.custom.colors.negative}`
                : `${theme.custom.colors.borderFull}`,
              borderRadius: "10px",
            }}
          >
            <ListItem
              button={false}
              style={{
                height: "44px",
                padding: "10px",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
              }}
            >
              <Typography style={{ width: "80px" }}>New</Typography>
              <TextField
                value={newPw1}
                onChange={(e) => setNewPw1(e.target.value)}
                placeholder="Enter password"
                type="password"
                classes={{
                  root: classes.textFieldRoot,
                }}
                inputProps={{
                  style: {
                    color: theme.custom.colors.secondary,
                    padding: 0,
                  },
                }}
              />
            </ListItem>
            <ListItem
              button={false}
              isLast
              style={{
                height: "44px",
                padding: "10px",
              }}
            >
              <Typography style={{ width: "80px" }}>Verify</Typography>
              <TextField
                value={newPw2}
                onChange={(e) => setNewPw2(e.target.value)}
                placeholder="Re-enter password"
                type="password"
                classes={{
                  root: classes.textFieldRoot,
                }}
                inputProps={{
                  style: {
                    color: theme.custom.colors.secondary,
                    padding: 0,
                  },
                }}
              />
            </ListItem>
          </List>
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
          <PrimaryButton label="Change password" type="submit" />
        </div>
      </form>
    </div>
  );
}
