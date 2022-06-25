import { useSearchParams } from "react-router-dom";
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

export module SearchParamsFor {
  export interface Plugin {
    props: { pluginUrl: string };
  }
  export interface Tab {
    props: {};
  }
  export interface Token {
    props: { address: string; blockchain: string };
  }
}
type ExtensionSearchParams = { title?: string } & (
  | SearchParamsFor.Plugin
  | SearchParamsFor.Tab
  | SearchParamsFor.Token
);

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
  const title =
    useDecodedSearchParams<ExtensionSearchParams>(params).title || "";
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
    const url = makeUrl(componentId, {
      props: componentProps,
      title,
    });
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

/**
 * @param urlSearchParams optional URLSearchParams object
 * @returns a key/value object of search params that have been
 * correctly URL decoded and JSON.parsed
 */
export function useDecodedSearchParams<
  SearchParamsType extends ExtensionSearchParams
>(urlSearchParams?: URLSearchParams) {
  const [searchParams] = urlSearchParams
    ? [urlSearchParams]
    : useSearchParams();
  const ob = {};
  searchParams.forEach((v, k) => {
    ob[k as keyof ExtensionSearchParams] = JSON.parse(decodeURIComponent(v));
  });
  return ob as SearchParamsType;
}

export function makeUrl(path, params: ExtensionSearchParams) {
  return [`/${path}`.replace("//", "/"), makeParams(params)]
    .filter(Boolean)
    .join("?");
}

/**
 * @returns a query string where each item in the provided
 * object is JSON.stringified and URL encoded
 */
function makeParams(ob = {}) {
  return Object.entries(ob)
    .reduce(
      (acc: Array<string>, [k, v]) =>
        acc.concat(`${k}=${encodeURIComponent(JSON.stringify(v))}`),
      []
    )
    .join("&");
}
