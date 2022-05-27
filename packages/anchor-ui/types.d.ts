import type {
  ProviderInjection,
  ProviderUiInjection,
} from "@200ms/provider-injection";

declare global {
  interface Window {
    anchor: ProviderInjection;
    anchorUi: ProviderUiInjection;
    libs: Record<string, any>;
  }
}
