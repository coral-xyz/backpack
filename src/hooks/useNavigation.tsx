import { useRecoilValue, useRecoilState } from "recoil";
import * as atoms from "../recoil/atoms";

type NavigationContext = {
  isRoot: boolean;
  title: string;
  push: any;
  pop: any;
  navBorderBottom: boolean;
  navButtonRight: any | null;
  setNavButtonRight: (b: null | any) => void;
  setNavBorderBottom: any;
};

export function useNavigation(): NavigationContext {
  const activeTab = useRecoilValue(atoms.navigationActiveTab)!;
  const [navData, setNavData] = useRecoilState(
    atoms.navigationDataMap(activeTab)
  );
  const [navBorderBottom, setNavBorderBottom] = useRecoilState(
    atoms.navigationBorderBottom
  );
  const [navButtonRight, setNavButtonRight] = useRecoilState(
    atoms.navigationRightButton
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
    navBorderBottom,
    setNavBorderBottom,
    navButtonRight,
    setNavButtonRight,
  };
}

export function useNavigationRender(): () => any {
  const activeTab = useRecoilValue(atoms.navigationActiveTab)!;
  const root = useNavigationRoot(activeTab);
  const renderer = useRecoilValue(atoms.navigationRenderer(activeTab));
  if (!renderer) {
    return () => root();
  }
  return renderer;
}

export function useNavigationRoot(tab: string) {
  return useRecoilValue(atoms.navigationTabRootRenderer(tab));
}
