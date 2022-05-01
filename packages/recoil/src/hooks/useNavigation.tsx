import { useRecoilValue, useRecoilState } from "recoil";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const [params] = useSearchParams() as any;
  const activeTab = useRecoilValue(atoms.navigationActiveTab)!;
  const [navData, setNavData] = useRecoilState(
    atoms.navigationDataMap(activeTab)
  );
  const [navButtonRight, setNavButtonRight] = useRecoilState(
    atoms.navigationRightButton
  );
  const title = params.get("title") ?? "";
  const isRoot = navData.urls.length === 1;
  const url = navData.urls[navData.urls.length - 1];
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
    setNavData({
      ...navData,
      urls: [...navData.urls, url],
    });
    navigate(url);
  };
  const pop = () => {
    const urls = [...navData.urls];
    urls.pop();
    setNavData({
      ...navData,
      urls,
    });
    navigate(urls[urls.length - 1]);
  };
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

export function useTab(): { tab: string; setTab: (tab: string) => void } {
  const navigate = useNavigate();
  const [tab, setTabRecoil] = useRecoilState(atoms.navigationActiveTab);
  const allNavData = useRecoilValue(atoms.navigationData);
  const setTab = (tab: string) => {
    const navData = allNavData[tab];
    const url = navData.urls[navData.urls.length - 1];
    navigate(url);
    setTabRecoil(tab);
  };
  return {
    tab,
    setTab,
  };
}
