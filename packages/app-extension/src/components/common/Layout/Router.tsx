import React, { Suspense, useEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  MESSAGE_IFRAME_ENABLED,
  MESSAGING_COMMUNICATION_FETCH_RESPONSE,
} from "@coral-xyz/common";
import {
  MESSAGING_COMMUNICATION_FETCH,
  MESSAGING_COMMUNICATION_PUSH,
} from "@coral-xyz/common/src/constants";
import {
  ChatScreen,
  Inbox,
  ParentCommunicationManager,
  ProfileScreen,
  RequestsScreen,
} from "@coral-xyz/message-sdk";
import { Loading } from "@coral-xyz/react-common";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import {
  PluginManager,
  useClosePlugin,
  useDarkMode,
  useDecodedSearchParams,
  useFeatureGates,
  useNavigation,
  useRedirectUrl,
  useUser,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import { AnimatePresence } from "framer-motion";

import { WithDrawer } from "../../common/Layout/Drawer";
import { Apps } from "../../Unlocked/Apps";
import { PluginApp } from "../../Unlocked/Apps/Plugin";
import { Balances } from "../../Unlocked/Balances";
import { Token } from "../../Unlocked/Balances/TokensWidget/Token";
import { ChatDrawer } from "../../Unlocked/Messages/ChatDrawer";
import { Nfts } from "../../Unlocked/Nfts";
import { NftsCollection } from "../../Unlocked/Nfts/Collection";
import { NftOptionsButton, NftsDetail } from "../../Unlocked/Nfts/Detail";
import { NftChat, NftsExperience } from "../../Unlocked/Nfts/Experience";
import { SettingsButton } from "../../Unlocked/Settings";

import { NavBackButton, WithNav } from "./Nav";
import { WithMotion } from "./NavStack";

export function Router() {
  const location = useLocation();
  return (
    <AnimatePresence initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/balances" element={<BalancesPage />} />
        <Route path="/balances/token" element={<TokenPage />} />
        <Route path={"/messages/*"} element={<Messages />} />
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
  return <Navigate to={url} replace />;
}

function BalancesPage() {
  return <NavScreen component={<Balances />} />;
}

function NftsPage() {
  return <NavScreen noScrollbars={true} component={<Nfts />} />;
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
  return (
    <NavScreen
      /* @ts-expect-error TS2322: Property 'id' is missing in type '{}' but required in type '{ id: string; }' */
      component={<NftsCollection {...props} />}
    />
  );
}

function NftsDetailPage() {
  const { props } = useDecodedSearchParams();
  return (
    <NavScreen
      /* @ts-expect-error TS2322: Property 'nftId' is missing in type '{}' but required in type '{ nftId: string; }'. */
      component={<NftsDetail {...props} />}
    />
  );
}

function Messages() {
  const featureGates = useFeatureGates();

  if (featureGates[MESSAGE_IFRAME_ENABLED]) {
    return <MessagesIframe />;
  }

  return <MessagesNative />;
}

function MessagesNative() {
  const hash = location.hash.slice(1);
  const isDarkMode = useDarkMode();
  const { uuid, username } = useUser();
  const { props } = useDecodedSearchParams<any>();
  const { push } = useNavigation();

  useEffect(() => {
    ParentCommunicationManager.getInstance().setNativePush(push);
  }, []);

  if (hash.startsWith("/messages/chat")) {
    return (
      <NavScreen
        component={
          <ChatScreen
            isDarkMode={isDarkMode}
            userId={props.userId}
            uuid={uuid}
            username={username}
          />
        }
      />
    );
  }

  if (hash.startsWith("/messages/profile")) {
    return <NavScreen component={<ProfileScreen userId={props.userId} />} />;
  }

  if (hash.startsWith("/messages/requests")) {
    return <NavScreen component={<RequestsScreen />} />;
  }

  return <NavScreen component={<Inbox />} />;
}

function MessagesIframe() {
  const MESSAGING_URL = "http://localhost:3000";
  const iframeRef = useRef<any>();
  const { push } = useNavigation();
  const location = useLocation();
  const { props }: any = useDecodedSearchParams();
  const { uuid, username } = useUser();
  const isDarkMode = useDarkMode();

  useEffect(() => {
    if (iframeRef && iframeRef.current) {
      window.addEventListener(
        "message",
        async (event) => {
          if (event.origin !== MESSAGING_URL) return;

          if (event.data.type === MESSAGING_COMMUNICATION_FETCH) {
            try {
              const response = await fetch(
                event.data.payload.url,
                event.data.payload.args
              );
              iframeRef.current?.contentWindow?.postMessage(
                {
                  type: MESSAGING_COMMUNICATION_FETCH_RESPONSE,
                  payload: {
                    counter: event.data.payload.counter,
                    data: await response.json(),
                    success: true,
                  },
                },
                "*"
              );
            } catch (e) {
              iframeRef.current?.contentWindow?.postMessage(
                {
                  type: MESSAGING_COMMUNICATION_FETCH_RESPONSE,
                  payload: {
                    counter: event.data.payload.counter,
                    success: false,
                  },
                },
                "*"
              );
            }
          }
          if (event.data.type === MESSAGING_COMMUNICATION_PUSH) {
            push(event.data.payload);
          }
        },
        false
      );
    }
  }, [iframeRef]);

  const route = location.pathname;

  return (
    <NavScreen
      component={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <iframe
            ref={iframeRef}
            frameBorder="0"
            src={`${MESSAGING_URL}/#${route}?parentUrl=${
              window.location.origin
            }&userId=${
              props.userId || ""
            }&uuid=${uuid}&username=${username}&isDarkMode=${isDarkMode}`}
            width={"100%"}
            height={"100%"}
          />
        </div>
      }
    />
  );
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

function NavScreen({
  component,
  noScrollbars,
}: {
  noScrollbars?: boolean;
  component: React.ReactNode;
}) {
  const { title, isRoot, pop } = useNavigation();
  const { style, navButtonLeft, navButtonRight, notchViewComponent } =
    useNavBar();

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
          notchViewComponent={notchViewComponent}
          navButtonLeft={_navButtonLeft}
          navButtonRight={navButtonRight}
          navbarStyle={style}
          noScrollbars={noScrollbars}
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

  // Auto-lock functionality is dependent on checking if the URL contains
  // "xnftAddress", if this changes then please verify that it still works
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
  if (pathname === "/messages/chat") {
    navStyle.background = theme.custom.colors.bg3;
  }

  if (isRoot) {
    /**
    const emoji = pathname.startsWith("/balances")
      ? "💰"
      : pathname.startsWith("/apps")
      ? "👾"
      : pathname.startsWith("/messages")
      ? "💬"
      : "🎨";
    **/
    navButtonRight = <SettingsButton />;
    navButtonLeft = (
      <div style={{ display: "flex" }}>
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

  const notchViewComponent =
    pathname === "/messages/chat" ? (
      <ChatDrawer setOpenDrawer={() => {}} />
    ) : null;

  return {
    navButtonRight,
    navButtonLeft,
    style: navStyle,
    notchViewComponent,
  };
}

function NavBootstrap({ children }: any) {
  return <>{children}</>;
}
