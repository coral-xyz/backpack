import { useState } from "react";
import { useAvatarUrl } from "@coral-xyz/recoil";
import { styled } from "@coral-xyz/themes";
import { Edit } from "@mui/icons-material";

import { CloseButton, WithDrawer } from "../../../common/Layout/Drawer";
import {
  NavStackEphemeral,
  NavStackScreen,
} from "../../../common/Layout/NavStack";

import { UpdateProfilePicture } from "./UpdateProfilePicture";

const title = "Change Profile Picture";

export function AvatarHeader() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const avatarUrl = useAvatarUrl(64);
  console.log(avatarUrl);
  const onClick = () => {
    setOpenDrawer(true);
  };

  return (
    <div style={{ marginTop: "16px", marginBottom: "36px" }}>
      <AvatarWrapper onClick={onClick}>
        <img
          src={avatarUrl}
          style={{
            width: "64px",
            height: "64px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "block",
            zIndex: 0,
          }}
        />
        <EditOverlay className={"editOverlay"}>
          <Edit />
        </EditOverlay>
      </AvatarWrapper>
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
            onClose={() => setOpenDrawer(false)}
          >
            <NavStackScreen
              key={"update"}
              name={"UpdateProfilePicture"}
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

const AvatarWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  background: theme.custom.colors.avatarIconBackground,
  borderRadius: "40px",
  padding: "3px",
  width: "70px",
  height: "70px",
  marginLeft: "auto",
  marginRight: "auto",
  overflow: "hidden",
  display: "block",
  "&:hover .editOverlay": {
    visibility: "visible",
  },
}));

const EditOverlay = styled("div")(({ theme }) => ({
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
