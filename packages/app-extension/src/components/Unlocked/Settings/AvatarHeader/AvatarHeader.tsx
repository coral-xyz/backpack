import { useUser } from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";
import styled from "@mui/system/styled";

import { IncognitoAvatar } from "../AvatarPopover";

export function AvatarHeader() {
  const user = useUser();
  const theme = useTheme();

  return (
    <div style={{ marginBottom: "24px" }}>
      <AvatarWrapper>
        <IncognitoAvatar uuid={user.uuid} variant="lg" />
      </AvatarWrapper>
      <Typography
        style={{
          color: theme.baseTextHighEmphasis.val,
          textAlign: "center",
          marginTop: "4px",
        }}
      >
        {user.username}
      </Typography>
    </div>
  );
}

const AvatarWrapper = styled("div")(() => ({
  position: "relative",
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
