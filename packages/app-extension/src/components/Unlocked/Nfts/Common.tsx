import { ProxyImage } from "@coral-xyz/react-common";
import { HOVER_OPACITY, styles, useCustomTheme } from "@coral-xyz/themes";
import { Button, Typography } from "@mui/material";

const useStyles = styles((theme) => ({
  button: {
    "&:hover": {
      opacity: HOVER_OPACITY,
    },
  },
}));

export function GridCard({ onClick, nft, subtitle }: any) {
  const classes = useStyles();
  const theme = useCustomTheme();
  if (!nft) {
    return null;
  }
  return (
    <Button
      className={classes.button}
      onClick={onClick}
      disableRipple
      style={{
        textTransform: "none",
        padding: 0,
        borderRadius: "8px",
        position: "relative",
        overflow: "hidden",
        minWidth: "153.5px",
        minHeight: "153.5px",
        aspectRatio: "1",
      }}
    >
      <ProxyImage
        style={{
          width: "100%",
        }}
        loadingStyles={{
          height: "100%",
        }}
        removeOnError={true}
        src={nft.imageUrl}
      />
      {subtitle && (
        <div
          style={{
            backgroundColor: theme.custom.colors.nav,
            position: "absolute",
            left: 0,
            bottom: 8,
            zIndex: 2,
            height: "24px",
            borderRadius: "12px",
            padding: "0 8px",
            margin: "0 5%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            maxWidth: "90%",
          }}
        >
          <Typography
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              color: theme.custom.colors.fontColor,
            }}
          >
            <div
              style={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {subtitle.name}
            </div>
            <span
              style={{
                marginLeft: "8px",
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
