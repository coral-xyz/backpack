import * as Linking from "expo-linking";

export function openSettings(): void {
  Linking.openSettings();
}

export function openUrl(url: string): void {
  Linking.openURL(url);
}
