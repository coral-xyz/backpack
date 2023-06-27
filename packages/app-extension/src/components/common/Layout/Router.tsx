import React, { Suspense, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useUsersMetadata } from "@coral-xyz/chat-xplat";
import type { SearchParamsFor, SubscriptionType } from "@coral-xyz/common";
import {
  BACKPACK_TEAM,
  Blockchain,
  NAV_COMPONENT_MESSAGE_PROFILE,
} from "@coral-xyz/common";
import {
  ChatScreen,
  Inbox,
  ParentCommunicationManager,
  ProfileScreen,
  RequestsScreen,
} from "@coral-xyz/message-sdk";
import { Loading, useBreakpoints } from "@coral-xyz/react-common";
import {
  SwapProvider,
  useActiveWallet,
  useDarkMode,
  useDecodedSearchParams,
  useFeatureGates,
  useNavigation,
  useRedirectUrl,
  useUser,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { AnimatePresence } from "framer-motion";

import { WalletDrawerButton } from "../../common/WalletList";
import { Apps } from "../../Unlocked/Apps";
import { Balances } from "../../Unlocked/Balances";
import { RecentActivity as LegacyTransactions } from "../../Unlocked/Balances/RecentActivity";
import { Token } from "../../Unlocked/Balances/TokensWidget/Token";
import { ChatDrawer } from "../../Unlocked/Messages/ChatDrawer";
import { MessageOptions } from "../../Unlocked/Messages/MessageOptions";
import { Nfts } from "../../Unlocked/Nfts";
import { NftsCollection } from "../../Unlocked/Nfts/Collection";
import { NftChat, NftsExperience } from "../../Unlocked/Nfts/Experience";
import { NftOptionsButton, NftsDetail } from "../../Unlocked/Nfts/NftDetail";
import { Notifications } from "../../Unlocked/Notifications";
import { Notifications as LegacyNotifications } from "../../Unlocked/Notifications/legacy";
import { SettingsButton } from "../../Unlocked/Settings";
import { AvatarPopoverButton } from "../../Unlocked/Settings/AvatarPopover";
import { _Swap } from "../../Unlocked/Swap";
import { Transactions } from "../../Unlocked/Transactions";

import { NavBackButton, WithNav } from "./Nav";
import { WithMotion } from "./NavStack";
import { Scrollbar } from "./Scrollbar";
import { WithTabs } from "./Tab";
import { XnftAppStack } from "./XnftAppStack";

export function Router() {
  const location = useLocation();
  const { isXs } = useBreakpoints();
  return (
    <AnimatePresence initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/tokens" element={<BalancesPage />} />
        <Route path="/tokens/token" element={<TokenPage />} />
        <Route path={"/messages/*"} element={<Messages />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/swap" element={<SwapPage />} />
        <Route path="/nfts" element={<NftsPage />} />
        <Route path="/nfts/collection" element={<NftsCollectionPage />} />
        <Route path="/nfts/experience" element={<NftsExperiencePage />} />
        <Route path="/nfts/chat" element={<NftsChatPage />} />
        <Route path="/nfts/detail" element={<NftsDetailPage />} />
        <Route path="/recent-activity" element={<TransactionsPage />} />
        {!isXs ? (
          <Route path="/notifications" element={<NotificationsPage />} />
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

function NotificationsPage() {
  const _Component = () => {
    const gates = useFeatureGates();
    return gates.GQL_NOTIFICATIONS ? (
      <Notifications />
    ) : (
      <LegacyNotifications />
    );
  };
  return <NavScreen component={<_Component />} />;
}

function TransactionsPage() {
  const _Component = () => {
    const gates = useFeatureGates();

    return gates.GQL_TRANSACTION_HISTORY ? (
      <Transactions />
    ) : (
      <LegacyTransactions />
    );
  };

  return <NavScreen component={<_Component />} />;
}

function Redirect() {
  let url = useRedirectUrl();
  return <Navigate to={url} replace />;
}

// We use a separate redirect for the xs size because some routes, e.g., /notifications
// and /recent-activity don't exist on the xs size--for xs, they are ephemeral drawers,
// for larger screens they are normal routes.
function RedirectXs() {
  let url = useRedirectUrl();
  if (url.startsWith("/notifications")) {
    return <Navigate to="/tokens" replace />;
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
    return <NavScreen noMotion component={<FullChatPage />} />;
  }

  return <NavScreen noMotion component={<MessageNativeInner />} />;
}

function MessageNativeInner() {
  const isDarkMode = useDarkMode();
  const hash = location.hash.slice(1);
  const { uuid } = useUser();
  const { props } = useDecodedSearchParams<any>();
  const { isXs } = useBreakpoints();

  if (hash.startsWith("/messages/requests")) {
    return <RequestsScreen />;
  }
  if (hash.startsWith("/messages/chat")) {
    return (
      <ChatScreen
        isDarkMode={isDarkMode}
        userId={props.userId}
        uuid={uuid}
        username={props.username}
      />
    );
  }
  if (hash.startsWith("/messages/groupchat")) {
    return <NftChat collectionId={props.id} {...props} />;
  }

  if (hash.startsWith("/messages/profile")) {
    return <ProfileScreen userId={props.userId} />;
  }

  if (!isXs) {
    return null;
  }

  return <Inbox />;
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

function SwapPage() {
  return (
    <NavScreen
      component={
        <SwapProvider>
          <_Swap isInDrawer={false} />
        </SwapProvider>
      }
    />
  );
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
    navButtonCenter,
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
        navButtonCenter={navButtonCenter}
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
        navButtonCenter={navButtonCenter}
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
  navButtonCenter,
  navbarStyle,
  noScrollbars,
  isVerified,
  component,
}: any) {
  const { isXs } = useBreakpoints();
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
      {isXs ? (
        <WithNav
          title={title}
          image={image}
          onClick={onClick}
          notchViewComponent={notchViewComponent}
          navButtonLeft={navButtonLeft}
          navButtonRight={navButtonRight}
          navButtonCenter={navButtonCenter}
          navbarStyle={navbarStyle}
          noScrollbars={noScrollbars}
          isVerified={isVerified}
        >
          <WithTabs>{component}</WithTabs>
        </WithNav>
      ) : (
        <WithTabs>
          <WithNav
            title={title}
            image={image}
            onClick={onClick}
            notchViewComponent={notchViewComponent}
            navButtonLeft={navButtonLeft}
            navButtonRight={navButtonRight}
            navButtonCenter={navButtonCenter}
            navbarStyle={navbarStyle}
            noScrollbars={noScrollbars}
            isVerified={isVerified}
          >
            {component}
          </WithNav>
        </WithTabs>
      )}
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
  const wallet = useActiveWallet();
  const isDark = useDarkMode();
  const profileUser = useUsersMetadata({ remoteUserIds: [props?.userId] });
  const image: string | undefined =
    props && props.image ? props.image : profileUser[props?.userId]?.image;

  let navButtonLeft = null as any;
  let navButtonRight = null as any;
  let navButtonCenter = null as any;

  let navStyle = {
    fontSize: "18px",
  } as React.CSSProperties;

  if (pathname === "/messages/chat" || pathname === "/messages/groupchat") {
    navStyle.background = theme.custom.colors.chatFadeGradientStart;
  }
  if (pathname === "/swap") {
    if (isDark) {
      navStyle.background = "#1D1D20";
    }
  }

  if (isRoot) {
    navButtonRight = isXs ? <SettingsButton /> : undefined;
    navButtonLeft = isXs ? <AvatarPopoverButton /> : undefined;
    navButtonCenter = <WalletDrawerButton wallet={wallet} />;
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
      <ChatDrawer image={image} setOpenDrawer={() => {}} />
    ) : null;

  return {
    navButtonRight,
    navButtonLeft,
    navButtonCenter,
    style: navStyle,
    notchViewComponent,
    image:
      pathname === "/messages/chat"
        ? image
        : pathname === "/messages/groupchat" && props.id === "backpack-chat"
        ? "https://user-images.githubusercontent.com/321395/206757416-a80e662a-0ccc-41cc-a20f-ff397755d47f.png"
        : pathname === "/messages/groupchat"
        ? image
        : undefined,
    isVerified:
      (pathname === "/messages/groupchat" && props.id === "backpack-chat") ||
      (pathname === "/messages/chat" && BACKPACK_TEAM.includes(props.userId)),
    onClick,
  };
}
