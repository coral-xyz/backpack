import React, { Suspense, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  TAB_SET,
  UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
} from "@coral-xyz/common/src/constants";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import {
  PluginManager,
  useBackgroundClient,
  useClosePlugin,
  useDecodedSearchParams,
  useFreshPlugin,
  useNavigation,
  useRedirectUrl,
  useUpdateSearchParams,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import { AnimatePresence } from "framer-motion";

import { WithDrawer } from "../../common/Layout/Drawer";
import { Apps } from "../../Unlocked/Apps";
import { PluginApp } from "../../Unlocked/Apps/Plugin";
import { Balances } from "../../Unlocked/Balances";
import { Token } from "../../Unlocked/Balances/TokensWidget/Token";
import { ChatScreen } from "../../Unlocked/Messages/ChatScreen";
import { Inbox } from "../../Unlocked/Messages/Inbox";
import { ProfileScreen } from "../../Unlocked/Messages/ProfileScreen";
import { RequestsScreen } from "../../Unlocked/Messages/RequestsScreen";
import { Nfts } from "../../Unlocked/Nfts";
import { NftsCollection } from "../../Unlocked/Nfts/Collection";
import { NftOptionsButton, NftsDetail } from "../../Unlocked/Nfts/Detail";
import { NftChat, NftsExperience } from "../../Unlocked/Nfts/Experience";
import { SettingsButton } from "../../Unlocked/Settings";
import { Swap } from "../../Unlocked/Swap";
import { Loading } from "..";

import { NavBackButton, WithNav } from "./Nav";
import { WithMotion } from "./NavStack";

export function Router() {
  const location = useLocation();
  return (
    <AnimatePresence initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/balances" element={<BalancesPage />} />
        <Route path="/balances/token" element={<TokenPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/chat" element={<ChatPage />} />
        <Route path="/messages/profile" element={<ProfilePage />} />
        <Route path="/messages/requests" element={<RequestsPage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/nfts" element={<NftsPage />} />
        {/*<Route path="/swap" element={<SwapPage />} />*/}
        <Route path="/nfts/collection" element={<NftsCollectionPage />} />
        <Route path="/nfts/experience" element={<NftsExperiencePage />} />
        <Route path="/nfts/chat" element={<NftsChatPage />} />
        <Route path="/nfts/detail" element={<NftsDetailPage />} />
        <Route path="*" element={<Redirect />} />
      </Routes>
    </AnimatePresence>
  );
}

export function Redirect() {
  let url = useRedirectUrl();
  const [searchParams] = useSearchParams();
  const pluginProps = searchParams.get("pluginProps");
  if (pluginProps) {
    // TODO: probably want to use some API to append the search param instead.
    url = `${url}&pluginProps=${encodeURIComponent(pluginProps)}`;
  }
  console.log(url);
  return <Navigate to={url} replace />;
}

function BalancesPage() {
  return <NavScreen component={<Balances />} />;
}

function NftsPage() {
  return <NavScreen component={<Nfts />} />;
}

function NftsChatPage() {
  const { props } = useDecodedSearchParams();
  return <NavScreen component={<NftChat {...props} />} />;
}

function NftsExperiencePage() {
  const { props } = useDecodedSearchParams();
  return <NavScreen component={<NftsExperience {...props} />} />;
}

function NftsCollectionPage() {
  const { props } = useDecodedSearchParams();
  // @ts-expect-error TS2322: Property 'id' is missing in type '{}' but required in type '{ id: string; }'
  return <NavScreen component={<NftsCollection {...props} />} />;
}

function NftsDetailPage() {
  const { props } = useDecodedSearchParams();
  // @ts-expect-error TS2322: Property 'nftId' is missing in type '{}' but required in type '{ nftId: string; }'.
  return <NavScreen component={<NftsDetail {...props} />} />;
}

function MessagesPage() {
  return <NavScreen component={<Inbox />} />;
}

function ChatPage() {
  const { props } = useDecodedSearchParams();
  // @ts-ignore
  return <NavScreen component={<ChatScreen userId={props.userId} />} />;
}

function RequestsPage() {
  // @ts-ignore
  return <NavScreen component={<RequestsScreen />} />;
}

function ProfilePage() {
  const { props } = useDecodedSearchParams();
  // @ts-ignore
  return <NavScreen component={<ProfileScreen userId={props.userId} />} />;
}

function AppsPage() {
  return <NavScreen component={<Apps />} />;
}

function TokenPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Token>();
  return <NavScreen component={<Token {...props} />} />;
}

/*
function SwapPage() {
  return <NavScreen component={<Swap />} />;
}
*/

function NavScreen({ component }: { component: React.ReactNode }) {
  const { title, isRoot, pop } = useNavigation();
  const { style, navButtonLeft, navButtonRight } = useNavBar();

  const _navButtonLeft = navButtonLeft ? (
    navButtonLeft
  ) : isRoot ? null : (
    <NavBackButton onClick={pop} />
  );

  return (
    <WithMotionWrapper>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <WithNav
          title={title}
          navButtonLeft={_navButtonLeft}
          navButtonRight={navButtonRight}
          navbarStyle={style}
        >
          <NavBootstrap>
            <PluginManager>
              {component}
              <PluginDrawer />
            </PluginManager>
          </NavBootstrap>
        </WithNav>
      </div>
    </WithMotionWrapper>
  );
}

function PluginDrawer() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [searchParams] = useSearchParams();
  const closePlugin = useClosePlugin();

  const pluginProps = searchParams.get("pluginProps");
  const { xnftAddress } = JSON.parse(decodeURIComponent(pluginProps ?? "{}"));

  useEffect(() => {
    if (xnftAddress) {
      setOpenDrawer(true);
    }
  }, [xnftAddress]);

  return (
    <WithDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}>
      <Suspense fallback={<Loading />}>
        {xnftAddress && (
          <PluginApp
            xnftAddress={xnftAddress}
            closePlugin={() => {
              setOpenDrawer(false);
              setTimeout(closePlugin, 100);
            }}
          />
        )}
      </Suspense>
    </WithDrawer>
  );
}

function WithMotionWrapper({ children }: { children: any }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navAction = searchParams.get("nav");

  return (
    <WithMotion id={location.pathname} navAction={navAction}>
      {children}
    </WithMotion>
  );
}

function useNavBar() {
  let { isRoot } = useNavigation();
  const pathname = useLocation().pathname;
  const theme = useCustomTheme();

  let navButtonLeft = null as any;
  let navButtonRight = null as any;

  let navStyle = {
    fontSize: "18px",
  } as React.CSSProperties;

  if (isRoot) {
    const emoji = pathname.startsWith("/balances")
      ? "💰"
      : pathname.startsWith("/apps")
      ? "👾"
      : pathname.startsWith("/messages")
      ? "💬"
      : "🎨";
    navButtonRight = <SettingsButton />;
    navButtonLeft = (
      <div style={{ display: "flex" }}>
        <Typography
          style={{
            fontSize: "24px",
            marginRight: "8px",
          }}
        >
          {emoji}
        </Typography>
        <Typography
          style={{
            fontSize: "18px",
            color: theme.custom.colors.fontColor,
            fontWeight: 600,
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {pathname.startsWith("/balances")
            ? "Balances"
            : pathname.startsWith("/apps")
            ? "Applications"
            : pathname.startsWith("/messages")
            ? "Messages"
            : "Collectibles"}
        </Typography>
      </div>
    );
  } else if (pathname === "/balances/token") {
    navButtonRight = null;
  } else if (pathname === "/nfts/detail") {
    navButtonRight = <NftOptionsButton />;
  }

  return {
    navButtonRight,
    navButtonLeft,
    style: navStyle,
  };
}

function NavBootstrap({ children }: any) {
  return <>{children}</>;
}
