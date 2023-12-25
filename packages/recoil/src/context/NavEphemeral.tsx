import React, { useContext, useState } from "react";

type NavEphemeralContext = {
  push: any;
  pop: any;
  renderComponent: any;
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
};
const _NavEphemeralContext = React.createContext<NavEphemeralContext | null>(
  null
);

// Context for an ephemeral nav stack. I.e., a refresh of the extension will reset this
// state.
export function NavEphemeralProvider(props: any) {
  const [stack, setStack] = useState([props.root]);
  const [title, setTitle] = useState(props.title);
  const [navButtonLeft, setNavButtonLeft] = useState<any>(null);
  const [navButtonRight, setNavButtonRight] = useState<any>(null);
  const [style, setStyle] = useState({});

  const push = (component: any) => {
    setStack([...stack, component]);
  };
  const pop = () => {
    const s = [...stack];
    s.pop();
    setStack(s);
  };
  const toRoot = () => {
    setStack([stack[0]]);
  };

  const renderComponent = stack[stack.length - 1];

  return (
    <_NavEphemeralContext.Provider
      value={{
        push,
        pop,
        renderComponent,
        isRoot: stack.length === 1,
        toRoot,
        title,
        setTitle,
        navButtonRight,
        setNavButtonRight,
        navButtonLeft,
        setNavButtonLeft,
        style,
        setStyle,
      }}
    >
      {props.children}
    </_NavEphemeralContext.Provider>
  );
}

export function useEphemeralNav(): NavEphemeralContext {
  const ctx = useContext(_NavEphemeralContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}
