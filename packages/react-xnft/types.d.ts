import type {
  ProviderInjection,
  ProviderUiInjection,
} from "@coral-xyz/provider-injection";
import type { NavigatorWallets, WalletAccount } from "@solana/wallet-standard";

declare global {
  interface Window {
    backpack: ProviderInjection;
    xnft: ProviderUiInjection;
  }

  interface Navigator {
    wallets?: NavigatorWallets<WalletAccount>;
  }
}
