import { useEffect } from "react";
import {
  BACKPACK_CONFIG_VERSION,
  BACKPACK_GITHUB_LINK,
  BACKPACK_LINK,
  BACKPACK_TERMS_OF_SERVICE,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  DiscordIcon,
  List,
  ListItem,
  RedBackpack,
} from "@coral-xyz/react-common";
import { useTheme, YStack } from "@coral-xyz/tamagui";
import { GitHub, OpenInBrowser } from "@mui/icons-material";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Typography } from "@mui/material";

import { useNavigation } from "../../../common/Layout/NavStack";

export function AboutBackpack() {
  const nav = useNavigation();
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    nav.setOptions({ headerTitle: "About" });
  }, [nav.setOptions]);

  const settingsMenu = [
    {
      label: t("discord"),
      onClick: () => window.open(DISCORD_INVITE_LINK, "_blank"),
      icon: (props: any) => <DiscordIcon {...props} />,
    },

    {
      label: t("twitter"),
      onClick: () => window.open(TWITTER_LINK, "_blank"),
      icon: (props: any) => <TwitterIcon {...props} />,
    },
    {
      label: t("github"),
      onClick: () => window.open(BACKPACK_GITHUB_LINK, "_blank"),
      icon: (props: any) => <GitHub {...props} />,
    },
    {
      label: t("website"),
      onClick: () => window.open(BACKPACK_LINK, "_blank"),
      icon: (props: any) => <OpenInBrowser {...props} />,
    },
  ];

  const termsList = [
    {
      label: t("termsOfService"),
      onClick: () => window.open(BACKPACK_TERMS_OF_SERVICE, "_blank"),
      icon: null,
      // detailIcon: <LaunchDetail />,
    },
  ];

  return (
    <YStack>
      <div style={{ marginBottom: "35px" }}>
        <RedBackpack
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "32px auto",
            marginBottom: 4,
          }}
        />
        <Typography
          style={{
            fontWeight: "600",
            fontSize: 42,
            textAlign: "center",
            color: theme.baseTextHighEmphasis.val,
          }}
        >
          {t("backpack")}
        </Typography>

        <Typography
          style={{ color: theme.baseTextMedEmphasis.val, textAlign: "center" }}
        >
          {BACKPACK_CONFIG_VERSION}
        </Typography>
      </div>
      <List>
        {settingsMenu.map((s, idx) => {
          return (
            <ListItem
              key={s.label}
              isFirst={idx === 0}
              isLast={idx === settingsMenu.length - 1}
              onClick={s.onClick}
              id={s.label}
              style={{
                height: "44px",
                padding: "12px",
              }}
              // detail={s.detailIcon}
            >
              <div
                style={{
                  display: "flex",
                  flex: 1,
                }}
              >
                {s.icon({
                  style: {
                    color: theme.baseIcon.val,
                    marginRight: "8px",
                    height: "24px",
                    width: "24px",
                  },
                  fill: theme.baseIcon.val,
                })}
                <Typography
                  style={{
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "24px",
                  }}
                >
                  {s.label}
                </Typography>
              </div>
            </ListItem>
          );
        })}
      </List>
      <List
        style={{
          marginTop: "12px",
          marginBottom: "16px",
          border: `${theme.baseBorderLight.val}`,
          borderRadius: "10px",
        }}
      >
        {termsList.map((s, idx) => {
          return (
            <ListItem
              key={s.label}
              isFirst={idx === 0}
              isLast={idx === termsList.length - 1}
              onClick={s.onClick}
              id={s.label}
              style={{
                height: "44px",
                padding: "12px",
              }}
              // detail={s.detailIcon}
            >
              <div
                style={{
                  display: "flex",
                  flex: 1,
                }}
              >
                <Typography
                  style={{
                    marginLeft: "8px",
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "24px",
                  }}
                >
                  {s.label}
                </Typography>
              </div>
            </ListItem>
          );
        })}
      </List>
    </YStack>
  );
}
