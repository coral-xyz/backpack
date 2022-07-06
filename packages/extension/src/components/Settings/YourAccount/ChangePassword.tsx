import { useEffect } from "react";
import { ListItemText, TextField } from "@mui/material";
import { useBackgroundClient, useEphemeralNav } from "@coral-xyz/recoil";
import { List, ListItem, PrimaryButton, SubtextParagraph } from "../../common";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

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
          // console.log({ d, formState, errors: formState.errors })
          alert("password changed");
          close();
        })}
        style={{ display: "flex", height: "100%", flexDirection: "column" }}
      >
        <div style={{ flex: 1, flexGrow: 1 }}>
          <List style={{ marginBottom: "50px" }}>
            <ListItem isLast>
              <ListItemText>Current</ListItemText>
              <TextField
                placeholder="enter password"
                type="password"
                {...register("currentPassword")}
              />
            </ListItem>
          </List>
          {/* <SubtextParagraph>
							{formState.errors.currentPassword?.message}
							</SubtextParagraph> */}

          {/* <Link to="">Forgot password?</Link> */}

          <List>
            <ListItem>
              <ListItemText>New</ListItemText>
              <TextField
                placeholder="enter password"
                type="password"
                {...register("newPassword")}
              />
            </ListItem>
            <ListItem isLast>
              <ListItemText>Verify</ListItemText>
              <TextField
                placeholder="re-enter password"
                type="password"
                {...register("confirmNewPassword")}
              />
            </ListItem>
          </List>
          <SubtextParagraph>
            {formState.errors.newPassword?.message}
          </SubtextParagraph>
        </div>
        <div style={{ padding: 16 }}>
          <PrimaryButton label="Change password" type="submit" />
        </div>
      </form>
    </div>
  );
}
