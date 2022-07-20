import { useSearchParams } from "react-router-dom";
import { Button, Divider } from "@mui/material";
import { PluginRenderer } from "@coral-xyz/react-xnft-renderer";
import {
  useNavigation,
  useBackgroundClient,
  usePlugins,
  useTablePlugins,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import { UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE } from "@coral-xyz/common";
import { PowerIcon, MoreIcon } from "../../Icon";

export function PluginDisplay({ pluginUrl }: SearchParamsFor.Plugin["props"]) {
  const theme = useCustomTheme();
  const plugins = usePlugins();
  const p = plugins.find((p) => p.iframeUrl === encodeURI(pluginUrl));

  // Hack: This is hit due to the framer-motion animation.
  if (!pluginUrl) {
    return <></>;
  }
  if (p === undefined) {
    throw new Error("unable to find plugin");
  }

  // TODO: splash loading page.
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: theme.custom.colors.background,
      }}
    >
      <PluginControl />
      <PluginRenderer key={p.iframeUrl} plugin={p} />
    </div>
  );
}

export function PluginTableDetailDisplay({
  pluginUrl,
}: SearchParamsFor.Plugin["props"]) {
  const plugins = useTablePlugins();
  const p = plugins.find((p) => p.iframeUrl === encodeURI(pluginUrl));
  if (p === undefined) {
    throw new Error("unable to find plugin");
  }
  return <PluginRenderer key={p.iframeUrl} plugin={p} />;
}

function PluginControl() {
  const background = useBackgroundClient();
  const [searchParams] = useSearchParams();
  const theme = useCustomTheme();

  const closePlugin = () => {
    const newUrl;
    background
      .request({
        method: UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
        params: [newUrl],
      })
      .catch(console.error);
  };

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
          width: "87px",
          height: "32px",
          border: `solid 1pt ${theme.custom.colors.border}`,
          borderRadius: "18.5px",
          display: "flex",
          background: "#fff",
        }}
      >
        <Button
          disableRipple
          onClick={() => {}}
          style={{
            flex: 1,
            height: "30px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: "41.67px",
          }}
        >
          <MoreIcon fill={theme.custom.colors.border1} />
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
              backgroundColor: theme.custom.colors.secondary,
            }}
          />
        </div>
        <Button
          disableRipple
          onClick={() => closePlugin()}
          style={{
            flex: 1,
            height: "30px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: "41.67px",
          }}
        >
          <PowerIcon fill={theme.custom.colors.border1} />
        </Button>
      </div>
    </div>
  );
}
