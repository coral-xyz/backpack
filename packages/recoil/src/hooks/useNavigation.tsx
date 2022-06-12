import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import * as atoms from "../atoms";

type NavigationContext = {
  isRoot: boolean;
  title: string;
  url: string;
  push: any;
  pop: any;
  navButtonRight: any | null;
  setNavButtonRight: (b: null | any) => void;
};

export function useNavigation(): NavigationContext {
  const activeTab = useRecoilValue(atoms.navigationActiveTab)!;
  const navData = useRecoilValue(atoms.navigationDataMap(activeTab));
  const [navButtonRight, setNavButtonRight] = useRecoilState(
    atoms.navigationRightButton
  );
  const { push, pop } = useNavigationSegue();
  const isRoot = navData.urls.length === 1;
  const url = navData.urls[navData.urls.length - 1];
  const params = new URLSearchParams(url);
  const title = params.get("title") ?? "";
  return {
    isRoot,
    url,
    title,
    push,
    pop,
    navButtonRight,
    setNavButtonRight,
  };
}

export function useNavigationSegue() {
  const pushUrl = useSetRecoilState(atoms.navigationUrlPush);
  const popUrl = useSetRecoilState(atoms.navigationUrlPop);

  const push = ({
    title,
    componentId,
    componentProps,
  }: {
    title: string;
    componentId: string;
    componentProps: any;
  }) => {
    const url = `/${componentId}?props=${JSON.stringify(
      componentProps
    )}&title=${title}`;
    pushUrl(url);
  };
  const pop = () => {
    popUrl();
  };

  return {
    push,
    pop,
  };
}

export function useTab(): { tab: string; setTab: (tab: string) => void } {
  const [tab, setTab] = useRecoilState(atoms.navigationActiveTab);
  return {
    tab,
    setTab,
  };
}
