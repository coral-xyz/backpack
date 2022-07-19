import React, { useState, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WithNav, NavBackButton } from "./Nav";

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
}: {
  initialRoute: { name: string; props?: any };
  children: any;
  options: NavStackOptions;
  style?: React.CSSProperties;
  navButtonRight?: React.ReactNode;
}) {
  const isArray = children && children.length !== undefined;
  const navScreens =
    children === undefined ? [] : isArray ? children : [children];
  return (
    <NavStackProvider
      initialRoute={initialRoute}
      style={style}
      navButtonRight={navButtonRight}
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
  let { isRoot, activeRoute, pop, navButtonRight, title, style } =
    useNavStack();

  const navButtonLeft = isRoot ? null : <NavBackButton onClick={() => pop()} />;
  const activeScreen = navScreens.find(
    (c: any) => c.props.name === activeRoute.name
  );

  let { title: titleDefault } = options({
    route: activeRoute,
  });
  if (!title) {
    title = titleDefault;
  }

  // TODO: plumb through the nav action.
  return (
    <AnimatePresence initial={false}>
      <WithMotion id={activeRoute.name} navAction={"push"}>
        <WithNav
          title={title}
          navButtonLeft={navButtonLeft}
          navButtonRight={navButtonRight}
          navbarStyle={style}
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
  style,
  children,
}: any) {
  const [stack, setStack] = useState([initialRoute]);
  const [titleOverride, setTitleOverride] = useState(initialRoute.title);
  const [navButtonRightOverride, setNavButtonRightOverride] =
    useState<any>(navButtonRight);
  const [_style, setStyle] = useState(style);

  const push = (route: string, props: any) => {
    setStack([...stack, { name: route, props }]);
  };
  const pop = () => {
    const newStack = [...stack];
    setStack(newStack.slice(0, newStack.length - 1));
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
        style: _style,
        setStyle,
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
  activeRoute: { name: string; props?: any };
  push: (route: string, props?: any) => void;
  pop: () => void;
  isRoot: boolean;
  toRoot: () => void;
  title: string;
  setTitle: any;
  navButtonRight: any;
  setNavButtonRight: any;
  style: any;
  setStyle: any;
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

////////////////////////////////////////////////////////////////////////////////
// Examples. of the nav stack api.
////////////////////////////////////////////////////////////////////////////////

function Router() {
  return (
    <NavStackEphemeral initialRoute={{ name: "home1" }} options={routeOptions}>
      <NavStackScreen name={"home1"} component={NavHome1} />
      <NavStackScreen name={"home2"} component={NavHome2} />
    </NavStackEphemeral>
  );
}

function routeOptions({ route }: { route: { name: string; props?: any } }) {
  switch (route.name) {
    case "home1":
      return {
        title: "Home Title 1",
      };
    case "home2":
      return {
        title: "Test 2",
      };
    default:
      console.log(route);
      throw new Error("unknown route");
  }
}

export function Router2() {
  const [page, setPage] = useState(1);
  return (
    <AnimatePresence initial={false}>
      <WithMotion id={page} navAction={"push"}>
        {page === 1 && <Home1 onClick={() => setPage(2)} />}
        {page === 2 && <Home2 onClick={() => setPage(1)} />}
      </WithMotion>
    </AnimatePresence>
  );
}

function NavHome1() {
  const { push, pop } = useNavStack();
  return (
    <div>
      <div
        onClick={() => push("home2", { title: "armani" })}
        style={{ color: "white" }}
      >
        Push home 1
      </div>
      <div onClick={() => pop()} style={{ color: "white" }}>
        Pop home 1
      </div>
    </div>
  );
}

function NavHome2({ title }: any) {
  const { push, pop } = useNavStack();
  return (
    <div>
      <div onClick={() => push("home1")} style={{ color: "white" }}>
        Push home 2
      </div>
      <div onClick={() => pop()} style={{ color: "white" }}>
        {title}
      </div>
    </div>
  );
}

function Home1({ onClick, asdf }: any) {
  return (
    <div onClick={() => onClick()} style={{ color: "white" }}>
      Testing home 1
    </div>
  );
}

function Home2({ onClick, asdf }: any) {
  return (
    <div onClick={() => onClick()} style={{ color: "white" }}>
      Testing home 2
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
