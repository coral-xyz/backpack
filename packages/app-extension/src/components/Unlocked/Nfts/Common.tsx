import { Button, Typography } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";

export function GridCard({ onClick, nft, subtitle }: any) {
  const theme = useCustomTheme();
  return (
    <Button
      onClick={onClick}
      disableRipple
      style={{
        marginBottom: "16px",
        textTransform: "none",
        padding: 0,
        borderRadius: "8px",
        position: "relative",
        height: "164px",
        overflow: "hidden",
      }}
    >
      <img
        style={{
          width: "164px",
        }}
        src={nft.tokenMetaUriData.image}
      />
      {subtitle && (
        <div
          style={{
            backgroundColor: theme.custom.colors.nav,
            position: "absolute",
            left: 8,
            bottom: 8,
            zIndex: 2,
            height: "24px",
            borderRadius: "12px",
            paddingLeft: "8px",
            paddingRight: "8px",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Typography
            style={{
              fontSize: "12px",
              color: theme.custom.colors.fontColor,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              maxWidth: "130px",
            }}
          >
            {subtitle.name}{" "}
            <span
              style={{
                color: theme.custom.colors.secondary,
              }}
            >
              {subtitle.length}
            </span>
          </Typography>
        </div>
      )}
    </Button>
  );
}
