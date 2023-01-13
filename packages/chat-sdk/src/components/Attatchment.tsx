import { BACKEND_API_URL } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import GifIcon from "@mui/icons-material/Gif";
import { IconButton } from "@mui/material";

export const Attatchment = ({ buttonStyle }: { buttonStyle: any }) => {
  const theme = useCustomTheme();

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
          const response = await fetch(`${BACKEND_API_URL}/s3/signedUrl`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          });
        }}
      >
        {" "}
        <AttachFileIcon
          style={{ color: theme.custom.colors.icon, fontSize: 20 }}
        />{" "}
      </IconButton>
    </div>
  );
};
