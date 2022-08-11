import type {
  ProviderInjection,
  ProviderUiInjection,
} from "@coral-xyz/provider-injection";
import type {
  NavigatorWallets,
  WalletAccount,
} from "@wallet-standard/standard";

declare global {
  interface Window {
    backpack: ProviderInjection;
    xnft: ProviderUiInjection;
  }

  interface Navigator {
    wallets?: NavigatorWallets<WalletAccount>;
  }
}
