import type { ReactNode } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import type { SearchParamsFor } from "@coral-xyz/common";
import { useBreakpoints } from "@coral-xyz/react-common";
import {
  useActiveWallet,
  useDarkMode,
  useDecodedSearchParams,
  useNavigation,
  useRedirectUrl,
} from "@coral-xyz/recoil";
import { AnimatePresence } from "framer-motion";

import { WalletDrawerButton } from "../../common/WalletList";
import {
  CollectibleDetailsView,
  CollectibleGroupView,
  CollectibleOptionsButton,
  Collectibles,
} from "../../Unlocked/Collectibles";
import { SettingsButton } from "../../Unlocked/Settings";
import { AvatarPopoverButton } from "../../Unlocked/Settings/AvatarPopover";
import { _Swap } from "../../Unlocked/Swap";
import { TokenBalances, TokenDetails } from "../../Unlocked/TokenBalances";
import { Transactions } from "../../Unlocked/Transactions";

import { NavBackButton, WithNav } from "./Nav";
import { WithMotion } from "./NavStack";
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
        <Route path="/nfts" element={<NftsPage />} />
        <Route path="/nfts/collection" element={<NftsCollectionPage />} />
        <Route path="/nfts/detail" element={<NftsDetailPage />} />
        <Route path="/recent-activity" element={<TransactionsPage />} />
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

function TransactionsPage() {
  const _Component = () => {
    const activeWallet = useActiveWallet();
    return (
      <Transactions
        ctx={{
          blockchain: activeWallet.blockchain,
          publicKey: activeWallet.publicKey,
        }}
      />
    );
  };
  return <NavScreen noScrollbars component={<_Component />} />;
}

function Redirect() {
  let url = useRedirectUrl();
  return <Navigate to={url} replace />;
}

// We use a separate redirect for the xs size because some routes, e.g.,
// and /recent-activity don't exist on the xs size--for xs, they are ephemeral drawers,
// for larger screens they are normal routes.
function RedirectXs() {
  let url = useRedirectUrl();
  if (url.startsWith("/apps") || url.startsWith("/swap")) {
    return <Navigate to="/tokens" replace />;
  }
  return <Navigate to={url} replace />;
}

function BalancesPage() {
  return <NavScreen component={<TokenBalances />} />;
}

function TokenPage() {
  const _Component = () => {
    const { props } = useDecodedSearchParams<SearchParamsFor.Token>();
    return <TokenDetails {...(props as any)} />;
  };
  return <NavScreen component={<_Component />} />;
}

function NftsPage() {
  return <NavScreen component={<Collectibles />} />;
}

function NftsDetailPage() {
  const _Component = () => {
    const { props } = useDecodedSearchParams();
    return (
      /* @ts-expect-error TS2322: Property 'nftId' is missing in type '{}' but required in type '{ nftId: string; }'. */
      <CollectibleDetailsView {...props} />
    );
  };
  return <NavScreen component={<_Component />} />;
}

function NftsCollectionPage() {
  const _Component = () => {
    const { props } = useDecodedSearchParams();
    return (
      /* @ts-expect-error TS2322: Property 'id' is missing in type '{}' but required in type '{ id: string; }' */
      <CollectibleGroupView {...props} />
    );
  };
  return <NavScreen component={<_Component />} />;
}

function NavScreen({
  component,
  noScrollbars,
  noMotion,
}: {
  noScrollbars?: boolean;
  component: ReactNode;
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
          noScrollbars
          isVerified={isVerified}
        >
          <WithTabs noScrollbars={noScrollbars}>{component}</WithTabs>
        </WithNav>
      ) : (
        <WithTabs noScrollbars>
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
  let { isRoot } = useNavigation();
  const pathname = useLocation().pathname;
  const { isXs } = useBreakpoints();
  const wallet = useActiveWallet();
  const isDark = useDarkMode();

  let navButtonLeft = null as any;
  let navButtonRight = null as any;
  let navButtonCenter = null as any;

  let navStyle = {
    fontSize: "18px",
  } as React.CSSProperties;

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
    navButtonRight = <CollectibleOptionsButton />;
  }

  let onClick;
  const notchViewComponent = null;

  return {
    navButtonRight,
    navButtonLeft,
    navButtonCenter,
    style: navStyle,
    notchViewComponent,
    image: undefined,
    isVerified: false,
    onClick,
  };
}
