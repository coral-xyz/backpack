import { useEffect } from "react";
import { XNFT_GG_LINK } from "@coral-xyz/common";
import {
  EmptyState,
  Loading,
  ProxyImage,
  PushDetail,
} from "@coral-xyz/react-common";
import {
  filteredPlugins,
  useActiveSolanaWallet,
  useSolanaConnectionUrl,
} from "@coral-xyz/recoil";
import { Apps } from "@mui/icons-material";
import { useRecoilValueLoadable } from "recoil";

import { useNavigation } from "../../../common/Layout/NavStack";
import { SettingsList } from "../../../common/Settings/List";

export function XnftSettings() {
  const nav = useNavigation();
  // TODO: Aggregate view.
  const activeSolanaWallet = useActiveSolanaWallet();
  const connectionUrl = useSolanaConnectionUrl();
  const publicKey = activeSolanaWallet?.publicKey;
  const { contents, state } = useRecoilValueLoadable(
    filteredPlugins({ publicKey, connectionUrl })
  );

  useEffect(() => {
    nav.setOptions({ headerTitle: "xNFTs" });
  }, [nav.setOptions]);

  if (state !== "hasValue" && state === "loading") {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Loading />
      </div>
    );
  }

  const xnfts = contents || [];
  const settingsMenu = {} as any;
  xnfts.forEach((xnft: any) => {
    const pubkeyStr = xnft.install.publicKey.toString();
    settingsMenu[pubkeyStr] = {
      label: xnft.title,
      onClick: () => nav.push("xnfts-detail", { xnft }),
      icon: () => (
        <ProxyImage
          style={{
            marginRight: "12px",
            borderRadius: "8px",
            width: "44px",
            height: "44px",
          }}
          src={xnft.iconUrl}
        />
      ),
      detailIcon: <PushDetail />,
      style: {
        height: "68px",
      },
    };
  });

  return xnfts.length === 0 ? (
    <EmptyState
      icon={(props: any) => <Apps {...props} />}
      title="No xNFTs"
      subtitle="Get started by adding your first xNFT"
      contentStyle={{
        marginBottom: "64px", // Tab height offset.
      }}
      buttonText="Browse the xNFT Library"
      onClick={() => window.open(XNFT_GG_LINK, "_blank")}
    />
  ) : (
    <div
      style={{
        marginTop: "16px",
        marginBottom: "16px",
      }}
    >
      <SettingsList
        menuItems={settingsMenu}
        style={{
          marginTop: "12px",
        }}
      />
    </div>
  );
}
