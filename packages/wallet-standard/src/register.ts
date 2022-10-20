import type { ProviderSolanaInjection } from '@coral-xyz/provider-core';
import type { WalletsWindow } from '@wallet-standard/base';
import { BackpackWallet } from './wallet.js';

declare const window: WalletsWindow;

export function register(backpack: ProviderSolanaInjection): void {
    try {
        (window.navigator.wallets ||= []).push(({ register }) => register(new BackpackWallet(backpack)));
    } catch (error) {
        console.error(error);
    }
}
