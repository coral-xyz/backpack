import { LegacyRef, useEffect, useRef, useState } from "react";
import { BACKEND_API_URL } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import GifIcon from "@mui/icons-material/Gif";
import { IconButton } from "@mui/material";

export const Attatchment = ({
  buttonStyle,
  setSelectedFile,
  setSelectedFileName,
}: {
  buttonStyle: any;
  setSelectedFileName: any;
  setSelectedFile: any;
}) => {
  const theme = useCustomTheme();
  const hiddenInputRef = useRef<any>();

  const createImage = (file: File) => {
    let reader = new FileReader();
    reader.onload = (e) => {
      setSelectedFileName(file.name);
      setSelectedFile(e.target?.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (hiddenInputRef && hiddenInputRef.current) {
      hiddenInputRef.current.onchange = () => {
        const selectedFile = hiddenInputRef.current.files[0];
        createImage(selectedFile);
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
          ref={hiddenInputRef}
          type="file"
          id="hiddenAttachment"
          style={{ display: "none" }}
        />
      </IconButton>
    </div>
  );
};
