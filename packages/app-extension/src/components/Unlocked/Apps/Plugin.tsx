import { Button, Divider } from "@mui/material";
import { PluginRenderer } from "@coral-xyz/react-xnft-renderer";
import { useNavigation, usePlugins, useTablePlugins } from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import { PowerIcon, MoreIcon } from "../../Icon";

export function PluginDisplay({ pluginUrl }: SearchParamsFor.Plugin["props"]) {
  const plugins = usePlugins();
  const p = plugins.find((p) => p.iframeUrl === encodeURI(pluginUrl));

  // Hack: This is hit due to the framer-motion animation.
  if (!pluginUrl) {
    return <></>;
  }
  if (p === undefined) {
    throw new Error("unable to find plugin");
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
  const { pop } = useNavigation();
  const theme = useCustomTheme();
  return (
    <div
      style={{
        position: "fixed",
        height: "36px",
        right: 16,
        top: 10,
        zIndex: 2,
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
          onClick={() => pop()}
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
