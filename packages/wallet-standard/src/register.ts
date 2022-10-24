import type { ProviderSolanaInjection } from '@coral-xyz/provider-core';
import { setupWindowNavigatorWallets } from './setup.js';
import { BackpackWallet } from './wallet.js';

export function register(backpack: ProviderSolanaInjection): void {
    try {
        setupWindowNavigatorWallets(({ register }) => register(new BackpackWallet(backpack)));
    } catch (error) {
        console.error(error);
    }
}
