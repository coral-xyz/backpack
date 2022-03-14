import React, { useContext, useState } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import * as atoms from "../recoil/atoms";

type NavigationStackRootContext = {
  root: any;
};

type NavigationContext = {
  isRoot: boolean;
  title: string;
  push: any;
  pop: any;
};

type NavigationStackContext = {
  push: any;
  pop: any;
  navData: any; // todo: remove?
};

const _NavigationStackRootContext =
  React.createContext<NavigationStackRootContext | null>(null);

// The root component prop *must* not have any props.
export function NavigationStackProvider(props: any) {
  const root = props.root;
  return (
    <_NavigationStackRootContext.Provider
      value={{
        root,
      }}
    >
      {props.children}
    </_NavigationStackRootContext.Provider>
  );
}

export function useNavigationContext(): NavigationContext {
  const activeTab = useRecoilValue(atoms.navigationActiveTab);
  const [navData, setNavData] = useRecoilState(
    atoms.navigationDataMap(activeTab)
  );
  const isRoot = navData.components.length === 0;
  const title = isRoot
    ? navData.title
    : navData.titles[navData.titles.length - 1];
  const push = ({
    title,
    componentId,
    componentProps,
  }: {
    title: string;
    componentId: string;
    componentProps: any;
  }) => {
    setNavData({
      ...navData,
      transition: "push",
      components: [...navData.components, componentId],
      props: [...navData.props, componentProps],
      titles: [...navData.titles, title],
    });
  };
  const pop = () => {
    const components = [...navData.components];
    const componentProps = [...navData.props];
    const titles = [...navData.titles];
    components.pop();
    componentProps.pop();
    titles.pop();
    setNavData({
      ...navData,
      transition: "pop",
      components,
      titles,
      props: componentProps,
    });
  };
  return {
    title,
    isRoot,
    push,
    pop,
  };
}

function useNavigationStackRootContext(): NavigationStackRootContext {
  const ctx = useContext(_NavigationStackRootContext);
  if (ctx === null) {
    throw new Error("Context not available");
  }
  return ctx;
}

export function useNavigationRender(): () => any {
  const { root } = useNavigationStackRootContext();
  const activeTab = useRecoilValue(atoms.navigationActiveTab);
  const renderer = useRecoilValue(atoms.navigationRenderer(activeTab));
  if (!renderer) {
    return () => root;
  }
  return renderer;
}
