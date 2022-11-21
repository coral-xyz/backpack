import React from "react";
import { PrimaryButton } from "../components/common";
import { useBackgroundClient } from "@coral-xyz/recoil";
import {
  BackgroundClient,
  UI_RPC_METHOD_NAVIGATION_TO_DEFAULT,
} from "@coral-xyz/common";

interface State {
  err: boolean;
}

interface Props {
  children?: React.ReactNode;
  background: BackgroundClient;
}

class ErrorBoundaryWithHooks extends React.Component<Props, State> {
  state = { err: false };

  static getDerivedStateFromError(_error: Error) {
    return { err: true };
  }

  componentDidCatch(error: Error, info: any) {
    //TODO: Post to aggregation service
    console.error("Global error caught", error, info);
  }

  render(): React.ReactNode {
    if (this.state.err) {
      return (
        <div
          style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            There was an error.
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            We're working on fixing it!
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
              padding: 5,
            }}
          >
            <PrimaryButton
              label={"Go back"}
              onClick={async () => {
                await this.props.background.request({
                  method: UI_RPC_METHOD_NAVIGATION_TO_DEFAULT,
                  params: [],
                });
                window.location.href = "/balances";
              }}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary(props: { children: React.ReactNode }) {
  const background = useBackgroundClient();
  //@ts-ignore
  return (
    <ErrorBoundaryWithHooks background={background}>
      {props.children}
    </ErrorBoundaryWithHooks>
  );
}
