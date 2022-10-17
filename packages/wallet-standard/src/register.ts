import type { WalletsWindow } from '@wallet-standard/base';
import { BackpackWallet } from './wallet.js';

declare const window: WalletsWindow;

export function register(): void {
    try {
        (window.navigator.wallets ||= []).push(({ register }) => register(new BackpackWallet()));
    } catch (error) {
        console.error(error);
    }
}
