import { useCustomTheme } from "@coral-xyz/themes";
import CheckIcon from "@mui/icons-material/Check";

export const Success = ({ title, body }: { title: string; body: string }) => {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        display: "flex",
        borderRadius: 12,
        paddingRight: 20,
        paddingTop: 5,
      }}
    >
      <div style={{ paddingRight: 15 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            background: "#F1FFEF",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <CheckIcon style={{ color: "#11A800" }} />
          </div>
        </div>
      </div>
      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 16,
            color: theme.custom.colors.fontColor2,
          }}
        >
          {title}
        </div>
        <div style={{ color: theme.custom.colors.fontColor3, fontSize: 14 }}>
          {body}
        </div>
      </div>
    </div>
  );
};
