import { LegacyRef, useEffect, useRef, useState } from "react";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import GifIcon from "@mui/icons-material/Gif";
import { IconButton } from "@mui/material";

export const Attatchment = ({
  buttonStyle,
  onImageSelect,
}: {
  buttonStyle: any;
  onImageSelect: any;
}) => {
  const theme = useCustomTheme();
  const hiddenInputRef = useRef<any>();

  useEffect(() => {
    if (hiddenInputRef && hiddenInputRef.current) {
      hiddenInputRef.current.onchange = () => {
        const selectedFile = hiddenInputRef.current.files[0];
        onImageSelect(selectedFile);
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
        size={"small"}
        style={{ color: theme.custom.colors.icon, ...buttonStyle }}
        onClick={async (e) => {
          hiddenInputRef.current.click();
        }}
      >
        {" "}
        <AttachFileIcon
          style={{ color: theme.custom.colors.icon, fontSize: 20 }}
        />{" "}
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
