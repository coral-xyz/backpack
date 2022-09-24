import { useEffect } from "react";
import { ListItemText } from "@mui/material";
import { GppBad } from "@mui/icons-material";
import { UI_RPC_METHOD_APPROVED_ORIGINS_DELETE } from "@coral-xyz/common";
import { useCustomTheme } from "@coral-xyz/themes";
import { useBackgroundClient, useApprovedOrigins } from "@coral-xyz/recoil";
import { useNavStack } from "../../../common/Layout/NavStack";
import { List, ListItem, PrimaryButton } from "../../../common";
import { EmptyState } from "../../../common/EmptyState";

export function PreferencesTrustedApps() {
  const theme = useCustomTheme();
  const nav = useNavStack();
  const approvedOrigins = useApprovedOrigins();

  useEffect(() => {
    nav.setTitle("Trusted Apps");
  }, [nav]);

  return approvedOrigins.length === 0 ? (
    <EmptyState
      icon={(props: any) => <GppBad {...props} />}
      title={"No trusted apps"}
      subtitle={"Trusted apps will be listed here"}
      contentStyle={{
        marginBottom: "64px", // Tab height offset.
      }}
    />
  ) : (
    <List
      style={{
        marginTop: "16px",
        border: `${theme.custom.colors.borderFull}`,
      }}
    >
      {Object.entries(approvedOrigins).map(
        ([key, origin]: any, i, { length }) => (
          <ListItem
            button={false}
            key={key}
            id={key}
            isFirst={i === 0}
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
