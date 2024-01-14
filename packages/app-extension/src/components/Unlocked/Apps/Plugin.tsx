import { Suspense, useEffect, useState } from "react";
import type { Plugin } from "@coral-xyz/common";
import { DEFAULT_PUBKEY_STR } from "@coral-xyz/common";
import { Loading, PowerIcon } from "@coral-xyz/react-common";
import {
  transactionRequest,
  useActiveSolanaWallet,
  useClosePlugin,
  useFreshPlugin,
  useOpenPlugin,
  usePlugins,
} from "@coral-xyz/recoil";
import { useTheme } from "@coral-xyz/tamagui";
import { Button } from "@mui/material";
import { useSetRecoilState } from "recoil";

import { PluginRenderer } from "./Renderer";
import { Simulator } from "./Simulator";

export function PluginApp({
  xnftAddress,
  deepXnftPath,
}: {
  xnftAddress: string | undefined;
  deepXnftPath: string;
}) {
  const theme = useTheme();
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: theme.baseBackgroundL1.val,
      }}
    >
      <LoadPlugin xnftAddress={xnftAddress} deepXnftPath={deepXnftPath} />
    </div>
  );
}

function LoadPlugin({
  xnftAddress,
  deepXnftPath,
}: {
  xnftAddress: string | undefined;
  deepXnftPath: string;
}) {
  const { publicKey } = useActiveSolanaWallet(); // TODO: aggregate wallet considerations.
  const plugins = usePlugins(publicKey);
  const setTransactionRequest = useSetRecoilState(transactionRequest);
  const openPlugin = useOpenPlugin();

  if (!xnftAddress) {
    return <Loading />;
  }

  const plugin = plugins?.find((p) => p.xnftAddress.toString() === xnftAddress);

  if (!plugin) {
    return (
      <DisplayFreshPlugin
        xnftAddress={xnftAddress}
        deepXnftPath={deepXnftPath}
      />
    );
  }
  plugin.setHostApi({
    request: setTransactionRequest,
    openPlugin,
  });

  if (xnftAddress === DEFAULT_PUBKEY_STR) {
    return <Simulator plugin={plugin} deepXnftPath={deepXnftPath} />;
  }
  return <PluginDisplay plugin={plugin} deepXnftPath={deepXnftPath} />;
}

function DisplayFreshPlugin({
  xnftAddress,
  deepXnftPath,
}: {
  xnftAddress: string;
  deepXnftPath: string;
}) {
  const p = useFreshPlugin(xnftAddress);
  if (!p.result) {
    return null;
  }
  return <PluginDisplay plugin={p.result} deepXnftPath={deepXnftPath} />;
}

export function PluginDisplay({
  plugin,
  deepXnftPath,
}: {
  plugin?: Plugin;
  deepXnftPath: string;
}) {
  return (
    <>
      <PluginControl plugin={plugin} />
      <Suspense fallback={<Loading />}>
        {plugin ? (
          <PluginRenderer
            key={plugin?.iframeRootUrl}
            plugin={plugin}
            deepXnftPath={deepXnftPath}
          />
        ) : null}
      </Suspense>
    </>
  );
}

function PluginControl({ plugin }: { plugin: any | null }) {
  const closePlugin = useClosePlugin();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    plugin?.didFinishSetup!.then(() => {
      setIsLoading(false);
    });
  });

  return (
    <div
      style={{
        position: "fixed",
        height: "36px",
        right: 16,
        top: 10,
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          //          width: "87px",
          width: "60px",
          height: "32px",
          borderRadius: "18.5px",
          display: "flex",
          background: "#fff",
        }}
      >
        {/*
        <Button
          disableRipple
          onClick={() => {}}
          sx={{
						borderTopLeftRadius: '18.5px',
						borderBottomLeftRadius: '18.5px',
            flex: 1,
            height: "32px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: "41.67px",
          }}
        >
          <MoreIcon fill={"#000000"} />
        </Button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Divider
            orientation="vertical"
            style={{
              width: "0.5px",
              height: "20px",
              backgroundColor: "#E9E9E9",
            }}
          />
        </div>
				*/}
        <Button
          disableRipple
          onClick={() => closePlugin()}
          sx={{
            position: "relative",
            borderRadius: "18.5px",
            flex: 1,
            height: "32px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minWidth: "41.67px",
          }}
        >
          {isLoading ? (
            <div
              style={{ position: "relative", height: "20px", width: "20px" }}
            >
              <Loading
                size="small"
                color="secondary"
                style={{ display: "block" }}
              />
            </div>
          ) : (
            <PowerIcon fill="#000000" />
          )}
        </Button>
      </div>
    </div>
  );
}
