import type { ReactNode } from "react";
import { DISCORD_INVITE_LINK, TWITTER_LINK } from "@coral-xyz/common";
import { Trans, useTranslation } from "@coral-xyz/i18n";
import {
  DiscordIcon,
  ExtensionIcon,
  PinIcon,
  XTwitterIcon,
} from "@coral-xyz/react-common";
import {
  BpPrimaryButton,
  RedBackpackIcon,
  StyledText,
  useTheme,
  XStack,
  YStack,
} from "@coral-xyz/tamagui";
import { Typography } from "@mui/material";

export function SetupComplete({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const isMac = window.navigator.userAgent.includes("Mac OS");

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: "40px",
          right: "40px",
        }}
      >
        <_PinNotification />
      </div>
      <YStack gap={40}>
        <YStack gap={16}>
          <StyledText fontSize={36} fontWeight="$semiBold" textAlign="center">
            {t("youre_all_good")}
          </StyledText>
          <StyledText color="$baseTextMedEmphasis" textAlign="center">
            <Trans
              i18nKey="open_backpack_with"
              values={{ alt: isMac ? "Option" : "Alt" }}
              components={{ blue: <StyledText color="$accentBlue" /> }}
            />
          </StyledText>
        </YStack>
        <XStack gap={12}>
          <_CallToAction
            icon={
              <RedBackpackIcon
                style={{ marginLeft: 4 }}
                height={24}
                width={17}
              />
            }
            title={t("support")}
            onClick={() => {
              window.open("https://support.backpack.exchange", "_blank");
            }}
          />
          <_CallToAction
            icon={<XTwitterIcon style={{ height: 24 }} />}
            title="@Backpack"
            onClick={() => window.open(TWITTER_LINK, "_blank")}
          />
          <_CallToAction
            icon={
              <DiscordIcon
                style={{ height: 24, marginLeft: 4 }}
                fill="#5865F2"
              />
            }
            title={t("discord")}
            onClick={() => window.open(DISCORD_INVITE_LINK, "_blank")}
          />
        </XStack>
        <BpPrimaryButton
          label={`${t("open_backpack")}`}
          labelProps={{ fontWeight: "$semiBold" }}
          onPress={onClose}
        />
      </YStack>
    </>
  );
}

function _CallToAction({
  icon,
  title,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <YStack
      backgroundColor="$baseBackgroundL1"
      borderRadius={12}
      cursor="pointer"
      gap={8}
      hoverStyle={{ opacity: 0.7 }}
      onPress={onClick}
      padding={16}
      pointerEvents="box-only"
      width={140}
    >
      {icon}
      <StyledText color="$baseTextMedEmphasis">{title}</StyledText>
    </YStack>
  );
}

function _PinNotification() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <div
      style={{
        background: theme.accentBlue.val,
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "16px",
        paddingBottom: "16px",
        color: theme.baseBackgroundL1.val,
        borderRadius: "12px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Typography
        style={{
          fontWeight: 700,
        }}
      >
        {t("pin_extension")}
      </Typography>
      <div style={{ display: "flex", marginTop: "4px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            marginRight: "4px",
          }}
        >
          <Typography
            style={{
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            Click
          </Typography>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <ExtensionIcon fill={theme.baseBackgroundL1.val} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            marginLeft: "4px",
            marginRight: "4px",
          }}
        >
          <Typography
            style={{
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            and
          </Typography>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <PinIcon fill={theme.baseBackgroundL1.val} />
        </div>
      </div>
    </div>
  );
}
