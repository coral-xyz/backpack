import type { ProviderSolanaInjection } from '@coral-xyz/provider-core';
import type {
    SolanaSignAndSendTransactionFeature,
    SolanaSignAndSendTransactionMethod,
    SolanaSignAndSendTransactionOutput,
    SolanaSignMessageFeature,
    SolanaSignMessageMethod,
    SolanaSignMessageOutput,
    SolanaSignTransactionFeature,
    SolanaSignTransactionMethod,
    SolanaSignTransactionOutput,
} from '@solana/wallet-standard-features';
import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import type { Wallet, WalletAccount } from '@wallet-standard/base';
import type {
    StandardConnectFeature,
    StandardConnectMethod,
    StandardDisconnectFeature,
    StandardDisconnectMethod,
    StandardEventsFeature,
    StandardEventsListeners,
    StandardEventsNames,
    StandardEventsOnMethod,
} from '@wallet-standard/features';
import bs58 from 'bs58';
import { BackpackWalletAccount } from './account.js';
import { getChainForEndpoint, getEndpointForChain } from './endpoint.js';
import { icon } from './icon.js';
import { isSolanaChain, SOLANA_CHAINS } from './solana.js';
import { bytesEqual } from './util.js';

export type BackpackFeature = {
    'backpack:': {
        backpack: ProviderSolanaInjection;
    };
};

export class BackpackWallet implements Wallet {
    readonly #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } = {};
    readonly #version = '1.0.0' as const;
    readonly #name = 'Backpack' as const;
    readonly #icon = icon;
    #account: BackpackWalletAccount | null = null;
    readonly #backpack: ProviderSolanaInjection;

    get version() {
        return this.#version;
    }

    get name() {
        return this.#name;
    }

    get icon() {
        return this.#icon;
    }

    get chains() {
        return SOLANA_CHAINS.slice();
    }

    get features(): StandardConnectFeature &
        StandardDisconnectFeature &
        StandardEventsFeature &
        SolanaSignAndSendTransactionFeature &
        SolanaSignTransactionFeature &
        SolanaSignMessageFeature &
        BackpackFeature {
        return {
            'standard:connect': {
                version: '1.0.0',
                connect: this.#connect,
            },
            'standard:disconnect': {
                version: '1.0.0',
                disconnect: this.#disconnect,
            },
            'standard:events': {
                version: '1.0.0',
                on: this.#on,
            },
            'solana:signAndSendTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signAndSendTransaction: this.#signAndSendTransaction,
            },
            'solana:signTransaction': {
                version: '1.0.0',
                supportedTransactionVersions: ['legacy', 0],
                signTransaction: this.#signTransaction,
            },
            'solana:signMessage': {
                version: '1.0.0',
                signMessage: this.#signMessage,
            },
            'backpack:': {
                backpack: this.#backpack,
            },
        };
    }

    get accounts() {
        return this.#account ? [this.#account] : [];
    }

    constructor(backpack: ProviderSolanaInjection) {
        if (new.target === BackpackWallet) {
            Object.freeze(this);
        }

        this.#backpack = backpack;

        backpack.on('connect', this.#connected);
        backpack.on('disconnect', this.#disconnected);
        backpack.on('connectionDidChange', this.#reconnected);

        this.#connected();
    }

    #connected = () => {
        const address = this.#backpack.publicKey?.toBase58();
        if (address) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const publicKey = this.#backpack.publicKey!.toBytes();

            const account = this.#account;
            if (!account || account.address !== address || !bytesEqual(account.publicKey, publicKey)) {
                this.#account = new BackpackWalletAccount({ address, publicKey });
                this.#emit('change', { accounts: this.accounts });
            }
        }
    };

    #disconnected = () => {
        if (this.#account) {
            this.#account = null;
            this.#emit('change', { accounts: this.accounts });
        }
    };

    #reconnected = () => {
        if (this.#backpack.publicKey) {
            this.#connected();
        } else {
            this.#disconnected();
        }
    };

    #connect: StandardConnectMethod = async ({ silent } = {}) => {
        if (!silent && !this.#backpack.publicKey) {
            await this.#backpack.connect();
        }

        this.#connected();

        return { accounts: this.accounts };
    };

    #disconnect: StandardDisconnectMethod = async () => {
        await this.#backpack.disconnect();
    };

    #on: StandardEventsOnMethod = (event, listener) => {
        this.#listeners[event]?.push(listener) || (this.#listeners[event] = [listener]);
        return (): void => this.#off(event, listener);
    };

    #emit<E extends StandardEventsNames>(event: E, ...args: Parameters<StandardEventsListeners[E]>): void {
        // eslint-disable-next-line prefer-spread
        this.#listeners[event]?.forEach((listener) => listener.apply(null, args));
    }

    #off<E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]): void {
        this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
    }

    #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (...inputs) => {
        const outputs: SolanaSignAndSendTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = inputs[0]!;
            if (!isSolanaChain(input.chain)) throw new Error('invalid chain');

            const transaction = VersionedTransaction.deserialize(input.transaction);
            const publicKey = new PublicKey(input.account.publicKey);
            const { commitment, preflightCommitment, skipPreflight, maxRetries, minContextSlot } = input.options || {};

            const connection =
                getChainForEndpoint(this.#backpack.connection.rpcEndpoint) === input.chain
                    ? undefined
                    : new Connection(
                          getEndpointForChain(input.chain),
                          commitment || preflightCommitment || this.#backpack.connection.commitment
                      );

            const signature = commitment
                ? await this.#backpack.sendAndConfirm(
                      transaction,
                      [],
                      {
                          commitment,
                          preflightCommitment,
                          skipPreflight,
                          maxRetries,
                          minContextSlot,
                      },
                      connection,
                      publicKey
                  )
                : await this.#backpack.send(
                      transaction,
                      [],
                      {
                          preflightCommitment,
                          skipPreflight,
                          maxRetries,
                          minContextSlot,
                      },
                      connection,
                      publicKey
                  );

            outputs.push({ signature: bs58.decode(signature) });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signAndSendTransaction(input)));
            }
        }

        return outputs;
    };

    #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
        const outputs: SolanaSignTransactionOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = inputs[0]!;
            const transaction = VersionedTransaction.deserialize(input.transaction);
            const publicKey = new PublicKey(input.account.publicKey);
            const signedTransaction = await this.#backpack.signTransaction(transaction, publicKey);

            outputs.push({ signedTransaction: signedTransaction.serialize() });
        } else if (inputs.length > 1) {
            // Group the transactions by the account that will be signing, noting the order of the transactions.
            const groups = new Map<WalletAccount, [number, VersionedTransaction][]>();
            for (const [i, input] of inputs.entries()) {
                let group = groups.get(input.account);
                if (!group) {
                    group = [];
                    groups.set(input.account, group);
                }
                group.push([i, VersionedTransaction.deserialize(input.transaction)]);
            }

            // For each account, call `signAllTransactions` with the transactions, preserving their order in the output.
            for (const [account, group] of groups.entries()) {
                // Unzip the indexes and transactions.
                const [indexes, transactions] = group.reduce(
                    ([indexes, transactions], [index, transaction]) => {
                        indexes.push(index);
                        transactions.push(transaction);
                        return [indexes, transactions];
                    },
                    [<number[]>[], <VersionedTransaction[]>[]]
                );

                const signedTransactions = await this.#backpack.signAllTransactions(
                    transactions,
                    new PublicKey(account.publicKey)
                );

                for (const [i, index] of indexes.entries()) {
                    outputs[index] = {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        signedTransaction: signedTransactions[i]!.serialize(),
                    };
                }
            }
        }

        return outputs;
    };

    #signMessage: SolanaSignMessageMethod = async (...inputs) => {
        const outputs: SolanaSignMessageOutput[] = [];

        if (inputs.length === 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const input = inputs[0]!;
            const publicKey = new PublicKey(input.account.publicKey);
            const signedMessage = input.message;
            const signature = await this.#backpack.signMessage(signedMessage, publicKey);

            outputs.push({ signedMessage, signature });
        } else if (inputs.length > 1) {
            for (const input of inputs) {
                outputs.push(...(await this.#signMessage(input)));
            }
        }

        return outputs;
    };
}
