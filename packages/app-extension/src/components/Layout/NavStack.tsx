import React, { useState, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WithNav, NavBackButton } from "./Nav";

export function NavStack({
  initialRoute,
  children,
  options,
}: {
  initialRoute: { name: string; props?: any };
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
    (c: any) => c.props.name === activeRoute.name
  );
  const { title, rightNavButton, leftNavButton, style } = options({
    route: activeRoute,
  });
  return (
    <AnimatePresence initial={false}>
      <WithMotion id={activeRoute.name} navAction={"push"}>
        <WithNav
          title={title}
          navButtonLeft={leftNavButton}
          navButtonRight={rightNavButton}
          navbarStyle={style}
        >
          {activeScreen.props.component({ ...(activeRoute.props ?? {}) })}
        </WithNav>
      </WithMotion>
    </AnimatePresence>
  );
}

function NavStackProvider({ initialRoute, children }: any) {
  const [stack, setStack] = useState([initialRoute]);
  const push = (route: string, props: any) => {
    setStack([...stack, { name: route, props }]);
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
    <NavStack initialRoute={{ name: "home1" }} options={routeOptions}>
      <NavStackScreen name={"home1"} component={NavHome1} />
      <NavStackScreen name={"home2"} component={NavHome2} />
    </NavStack>
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
