import { useEffect } from "react";
import { Typography, ListItemText } from "@mui/material";
import { CloudOff } from "@mui/icons-material";
import { UI_RPC_METHOD_APPROVED_ORIGINS_DELETE } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useBackgroundClient, useApprovedOrigins } from "@coral-xyz/recoil";
import { useNavStack } from "../../Layout/NavStack";
import { List, ListItem, PrimaryButton } from "../../common";

export function PreferencesTrustedApps() {
  const nav = useNavStack();
  const approvedOrigins = useApprovedOrigins();

  useEffect(() => {
    nav.setTitle("Trusted Apps");
  }, [nav]);

  return approvedOrigins.length === 0 ? (
    <EmptyOrigins />
  ) : (
    <List style={{ marginTop: "16px" }}>
      {Object.entries(approvedOrigins).map(
        ([key, origin]: any, i, { length }) => (
          <ListItem
            key={key}
            id={key}
            isLast={i === length - 1}
            style={{
              height: "66px",
              padding: "8px",
            }}
            detail={<RevokeButton origin={origin} />}
          >
            <ListItemText style={{ fontWeight: 500 }}>{origin}</ListItemText>
          </ListItem>
        )
      )}
    </List>
  );
}

function EmptyOrigins() {
  const theme = useCustomTheme();
  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <div
        style={{
          marginTop: "-30px",
        }}
      >
        <CloudOff
          style={{
            color: theme.custom.colors.secondary,
            width: "100px",
            height: "100px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "block",
          }}
        />
        <Typography
          style={{
            color: theme.custom.colors.secondary,
            textAlign: "center",
            fontSize: "22px",
            lineHeight: "28px",
            fontWeight: 500,
          }}
        >
          No approved applications
        </Typography>
      </div>
    </div>
  );
}

function RevokeButton({ origin }: { origin: string }) {
  const theme = useCustomTheme();
  const background = useBackgroundClient();

  const onClick = async () => {
    await background.request({
      method: UI_RPC_METHOD_APPROVED_ORIGINS_DELETE,
      params: [origin],
    });
  };

  return (
    <PrimaryButton
      onClick={() => onClick()}
      label="Revoke"
      style={{
        backgroundColor: theme.custom.colors.negative,
        width: "71px",
        height: "34px",
        borderRadius: "4px",
      }}
    />
  );
}
