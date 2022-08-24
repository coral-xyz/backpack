import React, { useState, useContext } from "react";

type NavStackContext = {
  activeRoute: { name: string; props?: any; navAction?: "push" | "pop" };
  push: (route: string, props?: any) => void;
  pop: () => void;
  isRoot: boolean;
  toRoot: () => void;
  title: string;
  setTitle: any;
  navButtonRight: any;
  setNavButtonRight: any;
  style: React.CSSProperties;
  setStyle: (s: React.CSSProperties) => void;
  contentStyle: React.CSSProperties;
  setContentStyle: (s: React.CSSProperties) => void;
  titleStyle: React.CSSProperties;
  setTitleStyle: (s: React.CSSProperties) => void;
};

const _NavStackContext = React.createContext<NavStackContext | null>(null);

export type NavStackOptions = ({
  route,
}: {
  route: { name: string; props?: any };
}) => RoutedNavStackOptions;
type RoutedNavStackOptions = {
  title: string;
  rightNavButton?: any;
  leftNavButton?: any;
  style?: React.CSSProperties;
};

export function useNavigation(): NavStackContext {
  const ctx = useContext(_NavStackContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export function NavStackProvider({
  initialRoute,
  navButtonRight,
  style,
  titleStyle,
  children,
}: any) {
  const [stack, setStack] = useState([{ navAction: "push", ...initialRoute }]);
  const [titleOverride, setTitleOverride] = useState(initialRoute.title);
  const [navButtonRightOverride, setNavButtonRightOverride] =
    useState<any>(navButtonRight);
  const [_style, setStyle] = useState(style);
  const [contentStyle, setContentStyle] = useState({});
  const [_titleStyle, _setTitleStyle] = useState(titleStyle);

  const push = (route: string, props: any) => {
    setStack((oldStack) => [
      ...oldStack,
      { name: route, props, navAction: "push" },
    ]);
  };
  const pop = () => {
    setStack((oldStack) => {
      let newStack = [...oldStack];
      newStack = newStack.slice(0, newStack.length - 1);
      newStack[newStack.length - 1]["navAction"] = "pop";
      return newStack;
    });
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
        contentStyle,
        setContentStyle,
        titleStyle: _titleStyle,
        setTitleStyle: _setTitleStyle,
      }}
    >
      {children}
    </_NavStackContext.Provider>
  );
}
