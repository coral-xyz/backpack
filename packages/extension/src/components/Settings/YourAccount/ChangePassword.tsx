import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField, Typography } from "@mui/material";
import { useEphemeralNav } from "@coral-xyz/recoil";
import { styles, useCustomTheme } from "@coral-xyz/themes";
import { List, ListItem, PrimaryButton, SubtextParagraph } from "../../common";
import z from "zod";

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

const schema = z
  .object({
    currentPassword: z.string(),
    newPassword: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,}$/i,
        "Your password must be at least 8 characters long and contain letters and numbers."
      ),
    confirmNewPassword: z.string(),
  })
  .refine((data: any) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["newPassword"],
  });
// XXX: won't work because recoil needs to be inside a react component
// .refine(
//   async (data) => {
//     return await useBackgroundClient().request({
//       method: UI_RPC_METHOD_KEYRING_STORE_CHECK_PASSWORD,
//       params: [data.currentPassword],
//     });
//   },
//   {
//     message: "Current password is incorrect",
//     path: ["currentPassword"],
//   }
// )

export function ChangePassword({ close }: { close: () => void }) {
  const theme = useCustomTheme();
  const classes = useStyles();
  const nav = useEphemeralNav();

  useEffect(() => {
    const navButton = nav.navButtonRight;
    const title = nav.title;
    nav.setNavButtonRight(null);
    nav.setTitle("Change password");
    return () => {
      nav.setNavButtonRight(navButton);
      nav.setTitle(title);
    };
  }, []);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <div style={{ paddingTop: "16px", height: "100%" }}>
      <form
        onSubmit={handleSubmit((d: any) => {
          alert("password changed");
          close();
        })}
        style={{ display: "flex", height: "100%", flexDirection: "column" }}
      >
        <div style={{ flex: 1, flexGrow: 1 }}>
          <List>
            <ListItem
              isLast
              style={{
                height: "46px",
                padding: "10px",
              }}
              button={false}
            >
              <Typography style={{ width: "80px" }}>Current</Typography>
              <TextField
                placeholder="enter password"
                type="password"
                classes={{
                  root: classes.textFieldRoot,
                }}
                {...register("currentPassword")}
                className={classes.textField}
                inputProps={{
                  style: {
                    color: theme.custom.colors.secondary,
                    padding: 0,
                  },
                }}
              />
            </ListItem>
          </List>
          <Button
            disableRipple
            style={{
              padding: 0,
              backgroundColor: "transparent",
              marginTop: "10px",
              marginLeft: "26px",
              marginBottom: "26px",
              textTransform: "none",
              color: theme.custom.colors.activeNavButton,
            }}
          >
            <Typography
              style={{
                fontSize: "14px",
                fontWeight: 500,
                lineHeight: "24px",
              }}
            >
              Forgot Password ?
            </Typography>
          </Button>
          <List>
            <ListItem
              button={false}
              style={{
                height: "44px",
                padding: "10px",
              }}
            >
              <Typography style={{ width: "80px" }}>New</Typography>
              <TextField
                placeholder="enter password"
                type="password"
                classes={{
                  root: classes.textFieldRoot,
                }}
                {...register("newPassword")}
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
                placeholder="re-enter password"
                type="password"
                classes={{
                  root: classes.textFieldRoot,
                }}
                {...register("confirmNewPassword")}
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
            Your password must be at least 8 characters long and container
            letters and numbers.
          </SubtextParagraph>
        </div>
        <div style={{ padding: 16 }}>
          <PrimaryButton label="Change password" type="submit" />
        </div>
      </form>
    </div>
  );
}
