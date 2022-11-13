import { useSearchParams, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import {
  Blockchain,
  UI_RPC_METHOD_NAVIGATION_TO_ROOT,
  UI_RPC_METHOD_NAVIGATION_PUSH,
  UI_RPC_METHOD_NAVIGATION_POP,
  TAB_SET,
} from "@coral-xyz/common";
import * as atoms from "../atoms";

type NavigationContext = {
  isRoot: boolean;
  title: string;
  push: any;
  pop: () => void;
  toRoot: () => void;
};

export function useNavigation(): NavigationContext {
  const location = useLocation();
  const { push, pop, toRoot } = useNavigationSegue();

  const pathname = location.pathname;
  const isRoot = TAB_SET.has(pathname.slice(1));
  const params = new URLSearchParams(location.search);
  const title = isRoot
    ? ""
    : useDecodedSearchParams<ExtensionSearchParams>(params).title || "";

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

export function useNavigationSegue() {
  const background = useRecoilValue(atoms.backgroundClient);

  const push = async ({
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
    return await background.request({
      method: UI_RPC_METHOD_NAVIGATION_PUSH,
      params: [url],
    });
  };
  const pop = async () => {
    return await background.request({
      method: UI_RPC_METHOD_NAVIGATION_POP,
      params: [],
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
  const [searchParams] = urlSearchParams
    ? [urlSearchParams]
    : useSearchParams();
  const ob = {};
  searchParams.forEach((v, k) => {
    if (k !== "nav") {
      try {
        ob[k as keyof ExtensionSearchParams] = JSON.parse(
          decodeURIComponent(v)
        );
      } catch {}
    }
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

export namespace SearchParamsFor {
  export interface Plugin {
    props: { pluginUrl: string };
  }
  export interface Tab {
    props: {};
  }
  export interface Token {
    props: { address: string; blockchain: Blockchain };
  }
}

type ExtensionSearchParams = { title?: string } & (
  | SearchParamsFor.Plugin
  | SearchParamsFor.Tab
  | SearchParamsFor.Token
);
