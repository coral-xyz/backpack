import React, { useContext, useMemo, useState } from "react";
import { CSSTransition } from "react-transition-group";

type NavigationContext = {
  name: string;
  push: (component: any) => void;
  pop: () => void;
  stack: any;
  title: string;
  setTitle: (title: string) => void;
};
const _NavigationContext = React.createContext<NavigationContext | null>(null);

export function NavigationProvider(props: any) {
  const [title, setTitle] = useState(props.title);
  const name = props.name;
  const [stack, setStack] = useState<any>({
    transition: "init",
    components: [props.root],
  });
  const push = (component: any) => {
    const render = component;
    const newStack = {
      transition: "push",
      components: [...stack.components, render],
    };
    setStack(newStack);
  };
  const pop = () => {
    const components = [...stack.components];
    components.pop();
    const newStack = {
      transition: "pop",
      components,
    };
    setStack(newStack);
  };
  return (
    <_NavigationContext.Provider
      value={{
        push,
        pop,
        name,
        stack,
        title,
        setTitle,
      }}
    >
      {props.children}
    </_NavigationContext.Provider>
  );
}

export function useNavigationContext(): NavigationContext {
  const ctx = useContext(_NavigationContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export function NavigationContent(props: any) {
  // Hack to allow the component to mount before triggering the animation in.
  const [display, setDisplay] = useState(false);
  setTimeout(() => setDisplay(true), 1);
  //  const isPushing = props.isPushing;
  return props.children;
}
