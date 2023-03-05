import React from "react";
import type { BackgroundClient } from "@coral-xyz/common";
import { UI_RPC_METHOD_NAVIGATION_TO_DEFAULT } from "@coral-xyz/common";
import { EmptyState } from "@coral-xyz/react-common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import { styles } from "@coral-xyz/themes";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface State {
  err: boolean;
}

interface Props {
  children?: React.ReactNode;
  background: BackgroundClient;
  classes: any;
}

const useStyles = styles((theme) => {
  return {
    appContainer: {
      background: theme.custom.colors.backgroundBackdrop,
      height: "100vh",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
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
    if (this.state.err) {
      return (
        <div className={this.props.classes.appContainer}>
          <EmptyState
            icon={(props: any) => <ErrorOutlineIcon {...props} />}
            title="There was an error"
            subtitle="Hang tight while we work to fix it!"
            buttonText="Go back"
            onClick={async () => {
              await this.props.background.request({
                method: UI_RPC_METHOD_NAVIGATION_TO_DEFAULT,
                params: [],
              });
              window.location.hash = "#/balances";
              window.location.reload();
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary(props: { children: React.ReactNode }) {
  const background = useBackgroundClient();
  const classes = useStyles();
  return (
    //@ts-ignore
    <ErrorBoundaryWithHooks classes={classes} background={background}>
      {props.children}
    </ErrorBoundaryWithHooks>
  );
}
