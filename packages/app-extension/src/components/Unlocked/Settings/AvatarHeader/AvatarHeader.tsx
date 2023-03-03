import { useState } from "react";
import { ProxyImage } from "@coral-xyz/react-common";
import { useAvatarUrl, useUser } from "@coral-xyz/recoil";
import type { CustomTheme } from "@coral-xyz/themes";
import { styled, useCustomTheme } from "@coral-xyz/themes";
import { Edit } from "@mui/icons-material";
import { Typography } from "@mui/material";

import { CloseButton, WithDrawer } from "../../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../../common/Layout/NavStack";

import { UpdateProfilePicture } from "./UpdateProfilePicture";

const title = "Change Profile Picture";

export function AvatarHeader() {
  const user = useUser();
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  const avatarUrl = useAvatarUrl(64);

  const onClick = () => {
    setOpenDrawer(true);
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <AvatarWrapper onClick={onClick}>
        <ProxyImage
          key={avatarUrl}
          src={avatarUrl}
          style={{
            width: "74px",
            height: "74px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "block",
            zIndex: 0,
            borderRadius: "50%",
          }}
        />
        <EditOverlay className="editOverlay">
          <Edit />
        </EditOverlay>
      </AvatarWrapper>
      <Typography
        style={{
          color: theme.custom.colors.fontColor,
          textAlign: "center",
          marginTop: "4px",
        }}
      >
        @{user.username}
      </Typography>
      <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
        <div style={{ height: "100%" }}>
          <NavStackEphemeral
            options={() => ({
              title,
            })}
            initialRoute={{
              name: "UpdateProfilePicture",
              title,
            }}
            navButtonLeft={<CloseButton onClick={() => setOpenDrawer(false)} />}
          >
            <NavStackScreen
              key="update"
              name="UpdateProfilePicture"
              component={() => (
                <UpdateProfilePicture setOpenDrawer={setOpenDrawer} />
              )}
            />
          </NavStackEphemeral>
        </div>
      </WithDrawer>
    </div>
  );
}

const AvatarWrapper = styled("div")(({ theme }: { theme: CustomTheme }) => ({
  position: "relative",
  background: theme.custom.colors.avatarIconBackground,
  borderRadius: "40px",
  padding: "3px",
  width: "80px",
  height: "80px",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "hidden",
  display: "block",
  "&:hover .editOverlay": {
    visibility: "visible",
  },
}));

const EditOverlay = styled("div")(() => ({
  position: "absolute",
  top: "0px",
  left: "0px",
  height: "100%",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: "1",
  visibility: "hidden",
  cursor: "pointer",
  backgroundColor: "rgba(255,255,255, 0.5)",
}));
