import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { SubscriptionType } from "@coral-xyz/common";
import {
  BACKPACK_TEAM,
  NAV_COMPONENT_MESSAGE_PROFILE,
} from "@coral-xyz/common";
import {
  ChatScreen,
  Inbox,
  ParentCommunicationManager,
  ProfileScreen,
  RequestsScreen,
} from "@coral-xyz/message-sdk";
import { useBreakpoints, useUsersMetadata } from "@coral-xyz/react-common";
import type { SearchParamsFor } from "@coral-xyz/recoil";
import {
  useDarkMode,
  useDecodedSearchParams,
  useNavigation,
  useRedirectUrl,
  useUser,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { Typography } from "@mui/material";
import { AnimatePresence } from "framer-motion";

import { Apps } from "../../Unlocked/Apps";
import { Balances } from "../../Unlocked/Balances";
import { Notifications } from "../../Unlocked/Balances/Notifications";
import { RecentActivity } from "../../Unlocked/Balances/RecentActivity";
import { Token } from "../../Unlocked/Balances/TokensWidget/Token";
import { ChatDrawer } from "../../Unlocked/Messages/ChatDrawer";
import { MessageOptions } from "../../Unlocked/Messages/MessageOptions";
import { Nfts } from "../../Unlocked/Nfts";
import { NftsCollection } from "../../Unlocked/Nfts/Collection";
import { NftOptionsButton, NftsDetail } from "../../Unlocked/Nfts/Detail";
import { NftChat, NftsExperience } from "../../Unlocked/Nfts/Experience";
import { SettingsButton } from "../../Unlocked/Settings";

import { NavBackButton, WithNav } from "./Nav";
import { WithMotion } from "./NavStack";
import { Scrollbar } from "./Scrollbar";
import { XnftAppStack } from "./XnftAppStack";

export function Router() {
  const location = useLocation();
  const { isXs } = useBreakpoints();
  return (
    <AnimatePresence initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/balances" element={<BalancesPage />} />
        <Route path="/balances/token" element={<TokenPage />} />
        <Route path={"/messages/*"} element={<Messages />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/nfts" element={<NftsPage />} />
        <Route path="/nfts/collection" element={<NftsCollectionPage />} />
        <Route path="/nfts/experience" element={<NftsExperiencePage />} />
        <Route path="/nfts/chat" element={<NftsChatPage />} />
        <Route path="/nfts/detail" element={<NftsDetailPage />} />
        {!isXs ? (
          <>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/recent-activity" element={<RecentActivityPage />} />
          </>
        ) : null}
        {/*
          Auto-lock functionality is dependent on checking if the URL contains
          "xnft", if this changes then please verify that it still works
          */}
        <Route path="/xnft/:xnftAddress/*" element={<XnftAppStack />} />
        <Route path="/xnft/:xnftAddress" element={<XnftAppStack />} />
        {isXs ? (
          <Route path="*" element={<RedirectXs />} />
        ) : (
          <Route path="*" element={<Redirect />} />
        )}
      </Routes>
    </AnimatePresence>
  );
}

export function NotificationsPage() {
  return <NavScreen component={<Notifications />} />;
}

export function RecentActivityPage() {
  return <NavScreen component={<RecentActivity />} />;
}

export function Redirect() {
  let url = useRedirectUrl();
  return <Navigate to={url} replace />;
}

// We use a separate redirect for the xs size because some routes, e.g., /notifications
// and /recent-activity don't exist on the xs size--for xs, they are ephemeral drawers,
// for larger screens they are normal routes.
export function RedirectXs() {
  let url = useRedirectUrl();
  if (url.startsWith("/notifications") || url.startsWith("/recent-activity")) {
    return <Navigate to="/balances" replace />;
  }
  return <Navigate to={url} replace />;
}

function BalancesPage() {
  return <NavScreen component={<Balances />} />;
}

function NftsPage() {
  return <NavScreen noScrollbars component={<Nfts />} />;
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
  const { push, pop } = useNavigation();
  const { isXs } = useBreakpoints();

  useEffect(() => {
    ParentCommunicationManager.getInstance().setNativePush(push);
    ParentCommunicationManager.getInstance().setNativePop(pop);
  }, []);

  if (!isXs) {
    return <FullChatPage />;
  }

  return <MessageNativeInner />;
}

function MessageNativeInner() {
  const isDarkMode = useDarkMode();
  const hash = location.hash.slice(1);
  const { uuid } = useUser();
  const { props } = useDecodedSearchParams<any>();
  const { isXs } = useBreakpoints();

  if (hash.startsWith("/messages/requests")) {
    return <NavScreen noMotion component={<RequestsScreen />} />;
  }

  if (hash.startsWith("/messages/chat")) {
    return (
      <NavScreen
        noMotion
        component={
          <ChatScreen
            isDarkMode={isDarkMode}
            userId={props.userId}
            uuid={uuid}
            username={props.username}
          />
        }
      />
    );
  }

  if (hash.startsWith("/messages/groupchat")) {
    return (
      <NavScreen
        noMotion
        component={<NftChat collectionId={props.id} {...props} />}
      />
    );
  }

  if (hash.startsWith("/messages/profile")) {
    return (
      <NavScreen noMotion component={<ProfileScreen userId={props.userId} />} />
    );
  }

  if (!isXs) {
    return <div />;
  }

  return <NavScreen noMotion component={<Inbox />} />;
}

function FullChatPage() {
  const { props } = useDecodedSearchParams<any>();
  const [userId, setRefresh] = useState(props.userId);
  const [collectionId, setCollectionIdRefresh] = useState(props.id);

  useEffect(() => {
    if (props.userId !== userId) {
      console.error("Setting refresh");
      setRefresh(props.userId);
    }
  }, [props.userId]);

  useEffect(() => {
    if (props.id !== collectionId) {
      setCollectionIdRefresh(props.id);
    }
  }, [props.id]);

  return (
    <div style={{ height: "100%", display: "flex" }}>
      <div style={{ width: "365px" }}>
        <Scrollbar>
          <Inbox />
        </Scrollbar>
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          flex: 1,
        }}
      >
        <MessageNativeInner />
      </div>
    </div>
  );
}

function AppsPage() {
  return <NavScreen component={<Apps />} />;
}

function TokenPage() {
  const { props } = useDecodedSearchParams<SearchParamsFor.Token>();
  return <NavScreen component={<Token {...props} />} />;
}

function NavScreen({
  component,
  noScrollbars,
  noMotion,
}: {
  noScrollbars?: boolean;
  component: React.ReactNode;
  messageProps?: {
    type: SubscriptionType;
    remoteUuid?: string;
    room?: string;
  };
  noMotion?: boolean;
}) {
  const { title, isRoot, pop } = useNavigation();

  const {
    style,
    navButtonLeft,
    navButtonRight,
    notchViewComponent,
    image,
    onClick,
    isVerified,
  } = useNavBar();

  const _navButtonLeft = navButtonLeft ? (
    navButtonLeft
  ) : isRoot ? null : (
    <NavBackButton onClick={() => pop()} />
  );

  if (noMotion) {
    return (
      <NavScreenInner
        title={title}
        image={image}
        onClick={onClick}
        notchViewComponent={notchViewComponent}
        navButtonLeft={_navButtonLeft}
        navButtonRight={navButtonRight}
        navbarStyle={style}
        noScrollbars={noScrollbars}
        isVerified={isVerified}
        component={component}
      />
    );
  }
  return (
    <WithMotionWrapper>
      <NavScreenInner
        title={title}
        image={image}
        onClick={onClick}
        notchViewComponent={notchViewComponent}
        navButtonLeft={_navButtonLeft}
        navButtonRight={navButtonRight}
        navbarStyle={style}
        noScrollbars={noScrollbars}
        isVerified={isVerified}
        component={component}
      />
    </WithMotionWrapper>
  );
}

function NavScreenInner({
  title,
  image,
  onClick,
  notchViewComponent,
  navButtonLeft,
  navButtonRight,
  navbarStyle,
  noScrollbars,
  isVerified,
  component,
}: any) {
  return (
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
        image={image}
        onClick={onClick}
        notchViewComponent={notchViewComponent}
        navButtonLeft={navButtonLeft}
        navButtonRight={navButtonRight}
        navbarStyle={navbarStyle}
        noScrollbars={noScrollbars}
        isVerified={isVerified}
      >
        {component}
      </WithNav>
    </div>
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
  let { isRoot, push } = useNavigation();
  const pathname = useLocation().pathname;
  const theme = useCustomTheme();
  const { props }: any = useDecodedSearchParams(); // TODO: fix type
  const { isXs } = useBreakpoints();
  const profileUser = useUsersMetadata({ remoteUserIds: [props?.userId] });
  const image: string | undefined = profileUser[props?.userId]?.image;

  let navButtonLeft = null as any;
  let navButtonRight = null as any;

  let navStyle = {
    fontSize: "18px",
  } as React.CSSProperties;

  if (pathname === "/messages/chat" || pathname === "/messages/groupchat") {
    navStyle.background = theme.custom.colors.chatFadeGradientStart;
  }

  if (isRoot) {
    navButtonRight = isXs ? <SettingsButton /> : undefined;
    navButtonLeft = (
      <div style={{ display: "flex" }}>
        <Typography
          style={{
            userSelect: "none",
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
              : pathname.startsWith("/messages") && !isXs
                ? ""
                : pathname.startsWith("/messages")
                  ? "Messages"
                  : pathname.startsWith("/nfts")
                    ? "Collectibles"
                    : pathname.startsWith("/notifications")
                      ? "Notifications"
                      : "Recent Activity"}
        </Typography>
      </div>
    );
  } else if (pathname === "/balances/token") {
    navButtonRight = null;
  } else if (pathname === "/nfts/detail") {
    navButtonRight = <NftOptionsButton />;
  } else if (pathname === "/messages/chat") {
    navButtonRight = <MessageOptions />;
  }

  let onClick;
  if (pathname === "/messages/chat") {
    onClick = () => {
      push({
        title: `@${props.username}`,
        componentId: NAV_COMPONENT_MESSAGE_PROFILE,
        componentProps: {
          userId: props.userId,
        },
      });
    };
  }

  const notchViewComponent =
    pathname === "/nfts/chat" || pathname === "/messages/groupchat" ? (
      <ChatDrawer setOpenDrawer={() => { }} />
    ) : null;

  return {
    navButtonRight,
    navButtonLeft,
    style: navStyle,
    notchViewComponent,
    image:
      pathname === "/messages/chat"
        ? image
        : pathname === "/messages/groupchat" && props.id === "backpack-chat"
          ? "https://user-images.githubusercontent.com/321395/206757416-a80e662a-0ccc-41cc-a20f-ff397755d47f.png"
          : undefined,
    isVerified:
      (pathname === "/messages/groupchat" && props.id === "backpack-chat") ||
      (pathname === "/messages/chat" && BACKPACK_TEAM.includes(props.userId)),
    onClick,
  };
}
