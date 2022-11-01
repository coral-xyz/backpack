import React, { useState, useContext } from "react";
import { AnimatePresence } from "framer-motion";
import { WithMotion } from "../../../plugin/Component";
import { WithNav, NavBackButton } from "./Nav";

export { WithMotion } from "../../../plugin/Component";

/**
 * Ephemeral nav stack API for animating transitions between components on the
 * push/pop navigation stack.
 */
export function NavStackEphemeral({
  initialRoute,
  children,
  options,
  style,
  navButtonRight,
  navButtonLeft,
  onClose,
}: {
  initialRoute: { name: string; title?: string; props?: any };
  children: any;
  options: NavStackOptions;
  style?: React.CSSProperties;
  navButtonRight?: React.ReactNode;
  navButtonLeft?: React.ReactNode;
  onClose?: () => void;
}) {
  const isArray = children && children.length !== undefined;
  const navScreens =
    children === undefined ? [] : isArray ? children : [children];
  return (
    <NavStackProvider
      initialRoute={initialRoute}
      style={style}
      navButtonRight={navButtonRight}
      navButtonLeft={navButtonLeft}
      onClose={onClose}
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
    title,
    style,
    contentStyle,
  } = useNavStack();
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
          navbarStyle={style}
          navContentStyle={contentStyle}
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
  style,
  children,
  onClose,
}: any) {
  const [stack, setStack] = useState([{ navAction: "push", ...initialRoute }]);
  const [titleOverride, setTitleOverride] = useState(initialRoute.title);
  const [navButtonRightOverride, setNavButtonRightOverride] =
    useState<any>(navButtonRight);
  const [navButtonLeftOverride, setNavButtonLeftOverride] =
    useState<any>(navButtonLeft);
  const [_style, setStyle] = useState(style);
  const [contentStyle, setContentStyle] = useState({});

  const push = (route: string, props: any) => {
    setStack([...stack, { name: route, props, navAction: "push" }]);
  };
  const pop = (count?: number) => {
    let newStack = [...stack];
    newStack = newStack.slice(0, newStack.length - (count ?? 1));
    newStack[newStack.length - 1]["navAction"] = "pop";
    setStack(newStack);
  };
  const toRoot = () => {
    setStack([stack[0]]);
  };

  return (
    <_NavStackContext.Provider
      value={{
        activeRoute: stack[stack.length - 1],
        push,
        pop,
        isRoot: stack.length === 1,
        toRoot,
        title: titleOverride,
        setTitle: setTitleOverride,
        navButtonRight: navButtonRightOverride,
        setNavButtonRight: setNavButtonRightOverride,
        navButtonLeft: navButtonLeftOverride,
        setNavButtonLeft: setNavButtonLeftOverride,
        style: _style,
        setStyle,
        contentStyle,
        setContentStyle,
        close: onClose,
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
  activeRoute: { name: string; props?: any; navAction?: "push" | "pop" };
  push: (route: string, props?: any) => void;
  pop: (count?: number) => void;
  close: () => void;
  isRoot: boolean;
  toRoot: () => void;
  title: string;
  setTitle: any;
  navButtonRight: any;
  setNavButtonRight: any;
  navButtonLeft: any;
  setNavButtonLeft: any;
  style: any;
  setStyle: any;
  contentStyle: any;
  setContentStyle: any;
};

const _NavStackContext = React.createContext<NavStackContext | null>(null);

export function useNavStack(): NavStackContext {
  const ctx = useContext(_NavStackContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export function NavStackScreen({
  name,
  component,
}: {
  name: string;
  component: (props: any) => React.ReactNode;
}) {
  return <></>;
}
