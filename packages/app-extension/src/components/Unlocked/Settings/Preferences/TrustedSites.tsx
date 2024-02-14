import { UI_RPC_METHOD_APPROVED_ORIGINS_DELETE } from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import { EmptyState, List } from "@coral-xyz/react-common";
import { useApprovedOrigins, useBackgroundClient } from "@coral-xyz/recoil";
import {
  BpPrimaryButton,
  ListItemCore,
  RoundedContainerGroup,
  StyledText,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import { GppBad } from "@mui/icons-material";

export function PreferencesTrustedSites() {
  const theme = useTheme();
  const approvedOrigins = useApprovedOrigins();
  const { t } = useTranslation();

  return approvedOrigins.length === 0 ? (
    <YStack padding="$4" flex={1} justifyContent="center" alignItems="center">
      <EmptyState
        icon={(props: any) => <GppBad {...props} />}
        title={t("no_trusted_sites")}
        subtitle={t("trusted_sites_will_be_listed_here")}
        contentStyle={{
          marginLeft: "16px",
          marginRight: "16px",
          marginTop: "8px",
          marginBottom: "16px",
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
          <RoundedContainerGroup
            key={key}
            disableBottomRadius={i !== length - 1}
            disableTopRadius={i !== 0}
            pointerEvents="auto"
          >
            <ListItemCore
              style={{
                gap: 12,
                height: 66,
                padding: 12,
                pointerEvents: "auto",
              }}
            >
              <StyledText
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                {_trimProtocol(origin)}
              </StyledText>
              <RevokeButton origin={origin} />
            </ListItemCore>
          </RoundedContainerGroup>
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
    <BpPrimaryButton
      backgroundColor={theme.redText.val}
      cursor="pointer"
      flexGrow={0}
      width={71}
      height={34}
      borderRadius={4}
      onPress={onClick}
      label="Revoke"
    />
  );
}

function _trimProtocol(origin: string): string {
  return origin.replace(/^https?:\/\/(?:www\.)?/, "");
}
