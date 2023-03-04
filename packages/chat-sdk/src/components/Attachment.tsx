import { LegacyRef, useEffect, useRef, useState } from "react";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import GifIcon from "@mui/icons-material/Gif";
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

export const Attachment = ({
  buttonStyle,
  onMediaSelect,
}: {
  buttonStyle: any;
  onMediaSelect: any;
}) => {
  const theme = useCustomTheme();
  const hiddenInputRef = useRef<any>();

  useEffect(() => {
    if (hiddenInputRef && hiddenInputRef.current) {
      hiddenInputRef.current.onchange = () => {
        const selectedFile = hiddenInputRef.current.files[0];
        onMediaSelect(selectedFile);
      };
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <IconButton
        size="small"
        sx={{
          color: theme.custom.colors.icon,
          "&:hover": {
            background: `${theme.custom.colors.avatarIconBackground} !important`,
          },
        }}
        style={buttonStyle}
        onClick={async (e) => {
          hiddenInputRef.current.click();
        }}
      >
        {" "}
        <Tooltip title="Attach">
          <AttachFileIcon
            style={{ color: theme.custom.colors.icon, fontSize: 20 }}
          />
        </Tooltip>
        <input
          onClick={(e) => {
            // @ts-ignore
            e.target.value = null;
          }}
          ref={hiddenInputRef}
          type="file"
          id="hiddenAttachment"
          style={{ display: "none" }}
          accept=".mp4,.png,.jpg,.jpeg"
        />
      </IconButton>
    </div>
  );
};
