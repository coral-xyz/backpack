import type { Blockchain } from ".";

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

// eslint-disable-next-line
export namespace SearchParamsFor {
  export interface Plugin {
    props: { pluginUrl: string };
  }
  export interface Tab {
    props: {};
  }
  export interface Token {
    props: { tokenAddress: string; blockchain: Blockchain; publicKey: string };
  }
}

export type ExtensionSearchParams = { title?: string } & (
  | SearchParamsFor.Plugin
  | SearchParamsFor.Tab
  | SearchParamsFor.Token
);
