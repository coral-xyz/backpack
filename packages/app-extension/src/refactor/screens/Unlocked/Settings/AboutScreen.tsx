import {
  BACKPACK_CONFIG_VERSION,
  BACKPACK_GITHUB_LINK,
  BACKPACK_HELP_AND_SUPPORT,
  BACKPACK_LINK,
  BACKPACK_TERMS_OF_SERVICE,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
} from "@coral-xyz/common";
import { useTranslation } from "@coral-xyz/i18n";
import {
  BackpackTextLogo,
  DiscordIcon,
  List,
  ListItem,
  RedBackpack,
  XTwitterIcon,
} from "@coral-xyz/react-common";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import { GitHub } from "@mui/icons-material";
import { Typography } from "@mui/material";

import { ScreenContainer } from "../../../components/ScreenContainer";
import type {
  Routes,
  SettingsScreenProps,
} from "../../../navigation/SettingsNavigator";

export function AboutScreen(props: SettingsScreenProps<Routes.AboutScreen>) {
  return (
    <ScreenContainer loading={<Loading />}>
      <Container {...props} />
    </ScreenContainer>
  );
}

function Loading() {
  // TODO.
  return null;
}

function Container(_props: SettingsScreenProps<Routes.AboutScreen>) {
  const theme = useTheme();
  const { t } = useTranslation();

  const menuItems = [
    {
      label: t("help_ampersand_support"),
      url: BACKPACK_HELP_AND_SUPPORT,
    },
    {
      label: t("website"),
      url: BACKPACK_LINK,
    },
    {
      label: t("terms_of_service"),
      url: BACKPACK_TERMS_OF_SERVICE,
    },
  ];

  const handleOpenURL = (url: string) => window.open(url, "_blank");

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
        <div
          style={{
            textAlign: "center",
            marginTop: 22,
          }}
        >
          <BackpackTextLogo />
        </div>

        <Typography
          style={{ color: theme.baseTextMedEmphasis.val, textAlign: "center" }}
        >
          {BACKPACK_CONFIG_VERSION}
        </Typography>
      </div>
      {menuItems.map((item, idx) => (
        <List
          key={idx}
          style={{
            border: `${theme.baseBorderLight.val}`,
            borderRadius: "10px",
            marginBottom: "8px",
          }}
        >
          <ListItem
            key={item.label}
            isFirst={idx === 0}
            isLast={idx === menuItems.length - 1}
            onClick={() => handleOpenURL(item.url)}
            style={{
              borderRadius: "10px",
              height: "44px",
              padding: "12px",
            }}
          >
            <Typography
              style={{ fontWeight: 500, fontSize: "16px", lineHeight: "24px" }}
            >
              {item.label}
            </Typography>
          </ListItem>
        </List>
      ))}
      <div style={{ marginTop: 24 }}>
        <SocialMediaRow />
      </div>
    </YStack>
  );
}

const socialMediaItems = [
  {
    label: "X",
    onClick: () => window.open(TWITTER_LINK, "_blank"),
    icon: (props: any) => <XTwitterIcon {...props} />,
  },
  {
    label: "Discord",
    onClick: () => window.open(DISCORD_INVITE_LINK, "_blank"),
    icon: (props: any) => <DiscordIcon {...props} />,
  },
  {
    label: "Github",
    onClick: () => window.open(BACKPACK_GITHUB_LINK, "_blank"),
    icon: (props: any) => <GitHub {...props} />,
  },
];

const SocialMediaRow: React.FC = () => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {socialMediaItems.map((item) => (
        <div
          key={item.label}
          className={classes.icon}
          onClick={item.onClick}
          style={{ cursor: "pointer", margin: "0 12px" }}
        >
          <item.icon
            fill={theme.baseIcon.val}
            style={{ color: theme.baseIcon.val }}
            size={item.label === "X" ? 27 : 22}
          />
        </div>
      ))}
    </div>
  );
};

const useStyles = temporarilyMakeStylesForBrowserExtension(() => ({
  icon: {
    "&:hover": {
      opacity: 0.8,
    },
  },
}));
