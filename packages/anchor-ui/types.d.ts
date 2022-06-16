import type {
  ProviderInjection,
  ProviderUiInjection,
} from "@coral-xyz/provider-injection";

declare global {
  interface Window {
    anchor: ProviderInjection;
    anchorUi: ProviderUiInjection;
  }
}
