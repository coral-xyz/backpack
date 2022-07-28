import { useEffect } from "react";
import { ListItemText } from "@mui/material";
import { useCustomTheme } from "@coral-xyz/themes";
import { useApprovedOrigins } from "@coral-xyz/recoil";
import { useNavStack } from "../../Layout/NavStack";
import { List, ListItem, PrimaryButton } from "../../common";

export function PreferencesTrustedApps() {
  const nav = useNavStack();
  const approvedOrigins = useApprovedOrigins();

  useEffect(() => {
    nav.setTitle("Trusted Apps");
  }, [nav]);

  return (
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

function RevokeButton({ origin }: { origin: string }) {
  const theme = useCustomTheme();
  return (
    <PrimaryButton
      label="Revoke"
      style={{
        backgroundColor: theme.custom.colors.negative,
      }}
    />
  );
}
