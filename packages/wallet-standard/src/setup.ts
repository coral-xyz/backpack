// This is copied from @wallet-standard/wallet

import type { NavigatorWalletsWindow, WindowNavigatorWalletsPushCallback } from '@wallet-standard/base';

declare const window: NavigatorWalletsWindow;

export function setupWindowNavigatorWallets(...callbacks: WindowNavigatorWalletsPushCallback[]): void {
    let callbacksOrNull: WindowNavigatorWalletsPushCallback[] | null = callbacks;
    let push = (...callbacks: WindowNavigatorWalletsPushCallback[]) => {
        callbacksOrNull?.push(...callbacks);
    };

    let wallets = window.navigator.wallets;
    if (!wallets) {
        wallets = Object.freeze({
            get push() {
                return push;
            },
            set push(newPush) {
                if (!callbacksOrNull)
                    throw new Error(
                        'window.navigator.wallets was already initialized.\nA wallet may have incorrectly initialized it before the page loaded.'
                    );
                const callbacks = callbacksOrNull;
                callbacksOrNull = null;
                push = newPush;
                push(...callbacks);
            },
        });

        Object.defineProperty(window.navigator, 'wallets', {
            value: wallets,
            // These normally default to false, but are required if window.navigator.wallets was already defined.
            writable: false,
            configurable: false,
            enumerable: false,
        });
    }

    wallets.push(...callbacksOrNull);
}
