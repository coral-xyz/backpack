import { AsyncStorage } from "@coral-xyz/common";
import type { AtomEffect } from "recoil";
import { atom } from "recoil";

const key = (str: string) => `mobileBrowser.${str}`;

const url = atom<string>({
  key: key("url"),
  effects: [asyncStorageEffect(key("url"), "")],
});

const displayUrl = atom<string>({
  key: key("displayUrl"),
  default: url,
});

const error = atom<boolean>({
  key: key("error"),
  default: true,
});

const meta = atom<{
  canGoBack: boolean;
  canGoForward: boolean;
  title: string | undefined | null;
}>({
  key: key("meta"),
  default: {
    canGoBack: false,
    canGoForward: false,
    title: undefined,
  },
});

const loadProgress = atom<number>({
  key: key("loadProgress"),
  default: 0,
});

const overlayVisible = atom<boolean>({
  key: key("overlayVisible"),
  effects: [asyncStorageEffect(key("overlayVisible"), true)],
});

const favorites = atom<{ url: string }[]>({
  key: key("favorites"),
  effects: [asyncStorageEffect(key("favorites"), [])],
});

/**
 * https://recoiljs.org/docs/guides/atom-effects/#asynchronous-setself
 * @param keyName name of key to be stored in Async Storage
 */
function asyncStorageEffect<T>(
  keyName: string,
  defaultValue: any
): AtomEffect<T> {
  return function ({ setSelf, onSet, trigger }) {
    // If there's a persisted value - set it on load
    const loadPersisted = async () => {
      const savedValue = await AsyncStorage.getItem(keyName);
      setSelf(savedValue !== null ? JSON.parse(savedValue) : defaultValue);
    };
    // Asynchronously set the persisted data
    if (trigger === "get") {
      void loadPersisted();
    }
    // Asynchronously set the persisted data
    // Subscribe to state changes and persist them to AsyncStorage
    onSet((newValue, _, isReset) => {
      isReset
        ? void AsyncStorage.removeItem(keyName)
        : void AsyncStorage.setItem(keyName, JSON.stringify(newValue));
    });
  };
}

export const mobileBrowser = {
  /**
   * This is what a user thinks they are visiting, if everything loaded instantly
   * it wouldn't be necessary. It helps with to avoid redirect loops and displaying
   * the expected URL for sites that are slow to load & when going through history.
   */
  displayUrl,
  error,
  favorites,
  /**
   * A float from 0-1
   */
  loadProgress,
  meta,
  /**
   * The overlay is like chrome://bookmarks in a chromium browser
   */
  overlayVisible,
  /**
   * What would be considered the authortitative state of the browser's current URL
   */
  url,
};
