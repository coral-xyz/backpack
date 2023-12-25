import { useCallback } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import type { ExtensionSearchParams } from "@coral-xyz/common";
import {
  makeUrl,
  TAB_SET,
  UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
  UI_RPC_METHOD_NAVIGATION_POP,
  UI_RPC_METHOD_NAVIGATION_PUSH,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
} from "@coral-xyz/common";
import { useRecoilValue } from "recoil";

import * as atoms from "../atoms";

import { useBreakpoints } from "./useBreakpoints";

type NavigationContext = {
  isRoot: boolean;
  title: string;
  push: ReturnType<typeof useNavigationSegue>["push"];
  pop: ReturnType<typeof useNavigationSegue>["pop"];
  toRoot: ReturnType<typeof useNavigationSegue>["toRoot"];
};

export function useNavigation(): NavigationContext {
  const location = useLocation();

  const { push, pop, toRoot } = useNavigationSegue();

  const pathname = location.pathname;
  const isRoot = TAB_SET.has(pathname.slice(1));
  const params = new URLSearchParams(location.search);
  const paramsTitle =
    useDecodedSearchParams<ExtensionSearchParams>(params).title || "";
  const title = isRoot ? "" : paramsTitle;

  return {
    isRoot,
    title,
    push,
    pop,
    toRoot,
  };
}

// Assumes all urls are of the form `/<tab>/<component-id>/.../`.
export function useTab(): string {
  const location = useLocation();
  const pathname = location.pathname;
  const tab = pathname.split("/")[1];
  return tab;
}

export function useUpdateSearchParams(): (params: URLSearchParams) => void {
  const background = useRecoilValue(atoms.backgroundClient);
  const location = useLocation();
  const activeTab = TAB_SET.has(location.pathname)
    ? location.pathname.slice(1)
    : null;

  return useCallback(
    (params) => {
      const url = `${location.pathname}?${params.toString()}`;
      background
        .request({
          method: UI_RPC_METHOD_NAVIGATION_CURRENT_URL_UPDATE,
          params: [url, activeTab],
        })
        .catch(console.error);
    },
    [location.pathname, background]
  );
}

export function useNavigationSegue() {
  const background = useRecoilValue(atoms.backgroundClient);
  const { isXs } = useBreakpoints();

  const push = async (
    {
      title,
      componentId,
      componentProps,
      pushAboveRoot,
    }: {
      title: string;
      componentId: string;
      componentProps: any;
      pushAboveRoot?: boolean;
    },
    tab?: string
  ) => {
    const url = makeUrl(componentId, {
      props: componentProps,
      title,
    });
    return await background.request({
      method: UI_RPC_METHOD_NAVIGATION_PUSH,
      params: [url, tab, !isXs && pushAboveRoot ? true : false],
    });
  };
  const pop = async (tab?: string) => {
    return await background.request({
      method: UI_RPC_METHOD_NAVIGATION_POP,
      params: [tab],
    });
  };
  const toRoot = async () => {
    return await background.request({
      method: UI_RPC_METHOD_NAVIGATION_TO_ROOT,
      params: [],
    });
  };

  return {
    push,
    pop,
    toRoot,
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
  const _searchParams = useSearchParams();
  const [searchParams] = urlSearchParams ? [urlSearchParams] : _searchParams;
  const ob = {};
  searchParams.forEach((v, k) => {
    if (k !== "nav") {
      try {
        // @ts-ignore
        ob[k as keyof ExtensionSearchParams] = JSON.parse(
          decodeURIComponent(v)
        );
      } catch {
        // Pass
      }
    }
  });
  return ob as SearchParamsType;
}
