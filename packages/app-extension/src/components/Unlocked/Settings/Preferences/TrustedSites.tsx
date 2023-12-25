import { useEffect } from "react";
import { UI_RPC_METHOD_APPROVED_ORIGINS_DELETE } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  EmptyState,
  List,
  ListItem,
  PrimaryButton,
} from "@coral-xyz/react-common";
import { useApprovedOrigins, useBackgroundClient } from "@coral-xyz/recoil";
import { useTheme, YStack } from "@coral-xyz/tamagui";
import { GppBad } from "@mui/icons-material";
import { ListItemText } from "@mui/material";

import { useNavigation } from "../../../common/Layout/NavStack";

export function PreferencesTrustedSites() {
  const theme = useTheme();
  const nav = useNavigation();
  const approvedOrigins = useApprovedOrigins();
  const { t } = useTranslation();

  useEffect(() => {
    nav.setOptions({ headerTitle: t("trusted_sites") });
  }, [nav]);

  return approvedOrigins.length === 0 ? (
    <YStack padding="$4" flex={1} justifyContent="center" alignItems="center">
      <EmptyState
        icon={(props: any) => <GppBad {...props} />}
        title={t("trustedSites.title")}
        subtitle={t("trustedSites.subtitle")}
        contentStyle={{
          marginBottom: "64px", // Tab height offset.
        }}
      />
    </YStack>
  ) : (
    <List
      style={{
        marginTop: "16px",
        border: `${theme.baseBorderLight.val}`,
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
              padding: "12px",
            }}
            detail={<RevokeButton origin={origin} />}
          >
            <ListItemText
              style={{
                fontWeight: 500,
                maxWidth: "90%",
                overflow: "hidden",
              }}
              primaryTypographyProps={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "pre-wrap",
                style: {
                  wordWrap: "break-word",
                  wordBreak: "break-all",
                },
              }}
            >
              {_trimProtocol(origin)}
            </ListItemText>
          </ListItem>
        )
      )}
    </List>
  );
}

function RevokeButton({ origin }: { origin: string }) {
  const theme = useTheme();
  const background = useBackgroundClient();

  const onClick = async () => {
    // ph101pp todo
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
        backgroundColor: theme.redBackgroundSolid.val,
        width: "71px",
        height: "34px",
        borderRadius: "4px",
      }}
    />
  );
}

function _trimProtocol(origin: string): string {
  return origin.replace(/^https?:\/\/(?:www\.)?/, "");
}
