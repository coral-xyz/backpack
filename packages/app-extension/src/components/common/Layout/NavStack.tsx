import React, { type CSSProperties, useContext, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { WithMotion } from "../../../plugin/Component";

import { NavBackButton, WithNav } from "./Nav";

export { WithMotion } from "../../../plugin/Component";

/**
 * Ephemeral nav stack API for animating transitions between components on the
 * push/pop navigation stack.
 */
export function NavStackEphemeral({
  initialRoute,
  children,
  options,
  navButtonRight,
  navButtonLeft,
}: {
  initialRoute: { name: string; title?: string; props?: any };
  children: any;
  options: NavStackOptions;
  navButtonRight?: React.ReactNode;
  navButtonLeft?: React.ReactNode;
}) {
  const isArray = children && children.length !== undefined;
  const navScreens =
    children === undefined ? [] : isArray ? children : [children];
  return (
    <NavStackProvider
      initialRoute={initialRoute}
      navButtonRight={navButtonRight}
      navButtonLeft={navButtonLeft}
    >
      <NavStackInner navScreens={navScreens} options={options} />
    </NavStackProvider>
  );
}

function NavStackInner({
  navScreens,
  options,
}: {
  navScreens: any;
  options: NavStackOptions;
}) {
  let {
    isRoot,
    activeRoute,
    pop,
    navButtonRight,
    navButtonLeft,
    navStyle,
    title,
  } = useNavigation();
  const _navButtonLeft =
    navButtonLeft && isRoot ? (
      navButtonLeft
    ) : isRoot ? null : (
      <NavBackButton onClick={() => pop()} />
    );
  const activeScreen = navScreens.find(
    (c: any) => c.props.name === activeRoute.name
  );

  let { title: titleDefault } = options({
    route: activeRoute,
  });
  if (!title) {
    title = titleDefault;
  }
  return (
    <AnimatePresence initial={false}>
      <WithMotion id={activeRoute.name} navAction={activeRoute.navAction}>
        <WithNav
          title={title}
          navButtonLeft={_navButtonLeft}
          navButtonRight={navButtonRight}
          navbarStyle={navStyle}
        >
          {activeScreen.props.component({ ...(activeRoute.props ?? {}) })}
        </WithNav>
      </WithMotion>
    </AnimatePresence>
  );
}

function NavStackProvider({
  initialRoute,
  navButtonRight,
  navButtonLeft,
  children,
}: any) {
  const [stack, setStack] = useState([{ navAction: "push", ...initialRoute }]);
  const [titleOverride, setTitleOverride] = useState(initialRoute.title);
  const [navButtonRightOverride, setNavButtonRightOverride] =
    useState<any>(navButtonRight);
  const [navButtonLeftOverride, setNavButtonLeftOverride] =
    useState<any>(navButtonLeft);
  const [navStyleOverride, setNavStyleOverride] = useState<CSSProperties>({});

  const push = (route: string, props: any) => {
    setStack([...stack, { name: route, props, navAction: "push" }]);
  };
  const pop = (count?: number) => {
    let newStack = [...stack];
    newStack = newStack.slice(0, newStack.length - (count ?? 1));
    newStack[newStack.length - 1]["navAction"] = "pop";
    setStack(newStack);
  };

  const setOptions = ({
    headerLeft,
    headerTitle,
    headerRight,
    style,
  }: {
    headerLeft?: React.ReactElement | null;
    headerTitle?: string | React.ReactElement;
    headerRight?: React.ReactElement | null;
    style?: CSSProperties;
  }) => {
    if (headerLeft !== undefined) {
      setNavButtonLeftOverride(headerLeft);
    }
    if (headerTitle !== undefined) {
      setTitleOverride(headerTitle);
    }
    if (headerRight !== undefined) {
      setNavButtonRightOverride(headerRight);
    }
    if (style !== undefined) {
      setNavStyleOverride(style);
    }
  };

  return (
    <_NavStackContext.Provider
      value={{
        activeRoute: stack[stack.length - 1],
        push,
        pop,
        isRoot: stack.length === 1,
        title: titleOverride,
        navButtonRight: navButtonRightOverride,
        navButtonLeft: navButtonLeftOverride,
        navStyle: navStyleOverride,
        setOptions,
      }}
    >
      {children}
    </_NavStackContext.Provider>
  );
}

type NavStackOptions = ({
  route,
}: {
  route: { name: string; props?: any };
}) => RoutedNavStackOptions;
type RoutedNavStackOptions = {
  title: string;
  rightNavButton?: any;
  leftNavButton?: any;
  style?: any;
};

type NavStackContext = {
  push: (route: string, props?: any) => void;
  pop: (count?: number) => void;
  isRoot: boolean;
  title: string;

  activeRoute: { name: string; props?: any; navAction?: "push" | "pop" };
  navButtonRight: any;
  navButtonLeft: any;
  navStyle: CSSProperties;
  setOptions: ({
    headerLeft,
    headerTitle,
    headerRight,
    style,
  }: {
    headerLeft?: React.ReactElement | null;
    headerTitle?: string | React.ReactElement;
    headerRight?: React.ReactElement | null;
    style?: CSSProperties;
  }) => void;
};

const _NavStackContext = React.createContext<NavStackContext | null>(null);

export function useNavigation(): NavStackContext {
  const ctx = useContext(_NavStackContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export function NavStackScreen(_props: {
  name: string;
  component: (props: any) => React.ReactNode;
}) {
  return null;
}
