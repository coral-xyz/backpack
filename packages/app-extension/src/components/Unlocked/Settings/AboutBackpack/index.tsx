import React, { useEffect } from "react";
import {
  BACKPACK_CONFIG_VERSION,
  BACKPACK_GITHUB_LINK,
  BACKPACK_LINK,
  BACKPACK_TERMS_OF_SERVICE,
  DISCORD_INVITE_LINK,
  TWITTER_LINK,
} from "@coral-xyz/common";
import {
  DiscordIcon,
  LaunchDetail,
  List,
  ListItem,
  RedBackpack,
} from "@coral-xyz/react-common";
import { useCustomTheme } from "@coral-xyz/themes";
import { GitHub, OpenInBrowser } from "@mui/icons-material";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Typography } from "@mui/material";

import { useNavigation } from "../../../common/Layout/NavStack";

export function AboutBackpack() {
  const nav = useNavigation();
  const theme = useCustomTheme();

  useEffect(() => {
    nav.setOptions({ headerTitle: "About" });
  }, [nav.setOptions]);

  const settingsMenu = [
    {
      label: "Discord",
      onClick: () => window.open(DISCORD_INVITE_LINK, "_blank"),
      icon: (props: any) => <DiscordIcon {...props} />,
    },

    {
      label: "Twitter",
      onClick: () => window.open(TWITTER_LINK, "_blank"),
      icon: (props: any) => <TwitterIcon {...props} />,
    },
    {
      label: "GitHub",
      onClick: () => window.open(BACKPACK_GITHUB_LINK, "_blank"),
      icon: (props: any) => <GitHub {...props} />,
    },
    {
      label: "Website",
      onClick: () => window.open(BACKPACK_LINK, "_blank"),
      icon: (props: any) => <OpenInBrowser {...props} />,
    },
  ];

  const termsList = [
    {
      label: "Terms of Service",
      onClick: () => window.open(BACKPACK_TERMS_OF_SERVICE, "_blank"),
      icon: null,
      // detailIcon: <LaunchDetail />,
    },
  ];

  return (
    <>
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
            color: theme.custom.colors.fontColor,
          }}
        >
          Backpack
        </Typography>

        <Typography
          style={{ color: theme.custom.colors.secondary, textAlign: "center" }}
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
                    color: theme.custom.colors.icon,
                    marginRight: "8px",
                    height: "24px",
                    width: "24px",
                  },
                  fill: theme.custom.colors.icon,
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
          border: `${theme.custom.colors.borderFull}`,
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
    </>
  );
}
