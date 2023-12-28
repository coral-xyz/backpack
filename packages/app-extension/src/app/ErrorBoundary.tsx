import React from "react";
import type { BackgroundClient } from "@coral-xyz/common";
import { UI_RPC_METHOD_NAVIGATION_TO_DEFAULT } from "@coral-xyz/common";
import { EmptyState } from "@coral-xyz/react-common";
import { useBackgroundClient, userClientAtom } from "@coral-xyz/recoil";
import type { UserClient } from "@coral-xyz/secure-clients";
import {
  temporarilyMakeStylesForBrowserExtension,
  useTheme,
  YStack,
} from "@coral-xyz/tamagui";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, Typography } from "@mui/material";
import { useRecoilValue } from "recoil";

interface State {
  err: boolean;
}

interface Props {
  children?: React.ReactNode;
  background: BackgroundClient;
  userClient: UserClient;
  classes: any;
  theme: any;
}

const useStyles = temporarilyMakeStylesForBrowserExtension(() => {
  return {
    // eslint-disable-next-line mui-custom/unused-styles
    appContainer: {
      height: "100vh",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
    },
    // eslint-disable-next-line mui-custom/unused-styles
    exportMnemonic: {
      opacity: 0.5,
      fontSize: "16px",
      textAlign: "center",
      cursor: "pointer",
      lineHeight: "24px",
      fontWeight: 500,
    },
  };
});

class ErrorBoundaryWithHooks extends React.Component<Props, State> {
  state = { err: false };

  static getDerivedStateFromError() {
    return { err: true };
  }

  componentDidCatch(error: Error, info: any) {
    //TODO: Post to aggregation service
    console.error("Global error caught", error, info);
  }

  render(): React.ReactNode {
    if (this.state.err || window.location.hash === "#error") {
      return (
        <div
          className={this.props.classes.appContainer}
          style={{
            backgroundColor: this.props.theme.baseBackgroundL0.val,
          }}
        >
          <YStack padding="$4">
            <EmptyState
              icon={(props: any) => <ErrorOutlineIcon {...props} />}
              title="There was an error"
              subtitle="Hang tight while we work to fix it!"
              buttonText="Go back"
              style={{
                height: "auto",
              }}
              onClick={async () => {
                await this.props.background.request({
                  method: UI_RPC_METHOD_NAVIGATION_TO_DEFAULT,
                  params: [],
                });
                window.location.hash = "#/balances";
                window.location.reload();
              }}
            />
          </YStack>
          <Box
            sx={{
              width: "100%",
              display: "block",
              marginTop: "24px",
            }}
          >
            <Typography
              className={this.props.classes.exportMnemonic}
              style={{
                color: this.props.theme.baseTextMedEmphasis.val,
              }}
              onClick={async () => {
                try {
                  await this.props.userClient.getMnemonic();
                } catch {
                  null;
                }
              }}
            >
              Export Secrets
            </Typography>
          </Box>
          <Box
            sx={{
              width: "100%",
              display: "block",
              marginTop: "24px",
            }}
          >
            <Typography
              className={this.props.classes.exportMnemonic}
              style={{
                color: this.props.theme.baseTextMedEmphasis.val,
              }}
              onClick={async () => {
                try {
                  console.log(await this.props.userClient.resetBackpack());
                } catch {
                  null;
                }
              }}
            >
              Reset Backpack
            </Typography>
          </Box>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary(props: { children: React.ReactNode }) {
  const background = useBackgroundClient();
  const userClient = useRecoilValue(userClientAtom);
  const classes = useStyles();
  const theme = useTheme();
  return (
    //@ts-ignore
    <ErrorBoundaryWithHooks
      classes={classes}
      background={background}
      userClient={userClient}
      theme={theme}
    >
      {props.children}
    </ErrorBoundaryWithHooks>
  );
}
