import type { Plugin } from "@coral-xyz/common";
import {
  useDarkMode,
  usePlugins,
  xnftPreference as xnftPreferenceAtom,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Button, Divider } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import { useRecoilValue } from "recoil";

import { PluginRenderer } from "../../../plugin/Renderer";
import { MoreIcon, PowerIcon } from "../../common/Icon";
import { Redirect } from "../../common/Layout/Router";

import { Simulator } from "./Simulator";

export function PluginApp({
  xnftAddress,
  closePlugin,
}: {
  xnftAddress: string;
  closePlugin: () => void;
}) {
  return xnftAddress! === PublicKey.default.toString() ? (
    <Simulator xnft={xnftAddress} closePlugin={closePlugin} />
  ) : (
    <PluginDisplay xnft={xnftAddress!} closePlugin={() => closePlugin()} />
  );
}

export function PluginDisplay({
  xnft,
  closePlugin,
}: {
  xnft: string;
  closePlugin: () => void;
}) {
  const plugins: Array<Plugin> = usePlugins();
  const p = plugins.find((p) => p.xnftAddress.toString() === xnft);

  return <_PluginDisplay plugin={p} closePlugin={closePlugin} />;
}

export function _PluginDisplay({
  plugin,
  closePlugin,
}: {
  plugin?: Plugin;
  closePlugin: () => void;
}) {
  const theme = useCustomTheme();
  const xnftPreference = useRecoilValue(
    xnftPreferenceAtom(plugin?.xnftInstallAddress?.toString())
  );

  // TODO: splash loading page.
  return (
    <div
      style={{
        height: "100%",
        backgroundColor: theme.custom.colors.background,
      }}
    >
      <PluginControl closePlugin={closePlugin} />
      {plugin && (
        <PluginRenderer
          key={plugin.iframeRootUrl}
          plugin={plugin}
          xnftPreference={xnftPreference}
        />
      )}
    </div>
  );
}

function PluginControl({ closePlugin }: any) {
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
        <Button
          disableRipple
          onClick={() => closePlugin()}
          style={{
            flex: 1,
            height: "32px",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minWidth: "41.67px",
          }}
        >
          <PowerIcon fill={"#000000"} />
        </Button>
      </div>
    </div>
  );
}
