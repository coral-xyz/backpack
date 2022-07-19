import React, { useState, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WithNav, NavBackButton } from "./Nav";

export function NavStack({
  initialRoute,
  children,
  options,
}: {
  initialRoute: string;
  children: any;
  options: NavStackOptions;
}) {
  const isArray = children && children.length !== undefined;
  const navScreens =
    children === undefined ? [] : isArray ? children : [children];
  return (
    <NavStackProvider initialRoute={initialRoute}>
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
  const { activeRoute } = useNavStack();
  const activeScreen = navScreens.find(
    (c: any) => c.props.route === activeRoute
  );
  const { title, rightNavButton, leftNavButton, style } = options({
    route: activeRoute,
  });

  // todo: componoent props

  return (
    <AnimatePresence initial={false}>
      <WithMotion id={activeRoute} navAction={"push"}>
        <WithNav
          title={title}
          navButtonLeft={leftNavButton}
          navButtonRight={rightNavButton}
          navbarStyle={style}
        >
          {activeScreen.props.component()}
        </WithNav>
      </WithMotion>
    </AnimatePresence>
  );
}

function NavStackProvider({ initialRoute, children }: any) {
  const [stack, setStack] = useState([initialRoute]);
  const push = (route: string) => {
    setStack([...stack, route]);
  };
  const pop = () => {
    const newStack = [...stack];
    setStack(newStack.slice(0, newStack.length - 1));
  };
  return (
    <_NavStackContext.Provider
      value={{
        activeRoute: stack[stack.length - 1],
        push,
        pop,
      }}
    >
      {children}
    </_NavStackContext.Provider>
  );
}

type NavStackOptions = ({ route }: { route: string }) => RoutedNavStackOptions;
type RoutedNavStackOptions = {
  title: string;
  rightNavButton?: any;
  leftNavButton?: any;
  style?: any;
};

type NavStackContext = {
  activeRoute: string;
  push: (route: string) => void;
  pop: () => void;
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
  route,
  component,
}: {
  route: string;
  component: (props: any) => React.ReactNode;
}) {
  // todo
  return <></>;
}

export function WithMotion({ children, id, navAction }: any) {
  return (
    <motion.div
      key={id}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
      variants={MOTION_VARIANTS}
      initial={!navAction || navAction === "tab" ? {} : "initial"}
      animate={!navAction || navAction === "tab" ? {} : "animate"}
      exit={!navAction || navAction === "tab" ? {} : "exit"}
    >
      {children}
    </motion.div>
  );
}

const MOTION_VARIANTS = {
  initial: {
    opacity: 0,
  },
  animate: {
    translateX: 0,
    opacity: 1,
    transition: { delay: 0.09 },
  },
  exit: {
    translateX: window.innerWidth,
    transition: { delay: 0.09, duration: 0.1 },
    opacity: 0,
  },
};
