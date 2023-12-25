import type { WalletDescriptor } from "@coral-xyz/common";
import { Blockchain, getLogger } from "@coral-xyz/common";
import { mnemonicToSeed } from "bip39";
import { encodeBase58, JsonRpcProvider, Transaction } from "ethers6";

import { safeClientResponse } from "../../background-clients/safeClientResponse";
import { SecureUIClient } from "../../background-clients/SecureUIClient";
import type { KeyringStore } from "../../store/KeyringStore/KeyringStore";
import { KeyringStoreState } from "../../types/keyring";
import type {
  TransportHandler,
  TransportReceiver,
  TransportRemoveListener,
  TransportResponder,
  TransportSender,
} from "../../types/transports";
import { LedgerClient } from "../ledger/client";
import { UserClient } from "../user/client";

import type { SECURE_EVM_EVENTS } from "./events";
import { deriveEthereumWallet } from "./util";

const logger = getLogger("secure-background EvmService");

export class EVMService {
  public destroy: TransportRemoveListener;
  private secureUIClient: SecureUIClient;
  private ledgerClient: LedgerClient;
  private userClient: UserClient;
  private keyringStore: KeyringStore;
  private provider: JsonRpcProvider | null = null;
  private providerCacheKey: string | null = null;
  private accounts: string[] = [];
  private accountsCacheKey: string | null = null;

  constructor(interfaces: {
    secureReceiver: TransportReceiver<SECURE_EVM_EVENTS>;
    secureSender: TransportSender;
    keyringStore: KeyringStore;
    secureUISender: TransportSender<SECURE_EVM_EVENTS, "ui">;
  }) {
    this.keyringStore = interfaces.keyringStore;
    this.secureUIClient = new SecureUIClient(interfaces.secureUISender);
    this.userClient = new UserClient(interfaces.secureSender);
    this.ledgerClient = new LedgerClient(interfaces.secureUISender);
    this.destroy = interfaces.secureReceiver.setHandler(
      this.eventHandler.bind(this)
    );
  }

  private eventHandler: TransportHandler<SECURE_EVM_EVENTS> = (request) => {
    switch (request.name) {
      case "SECURE_EVM_SIGN_MESSAGE":
        return this.handleSignMessage(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_EVM_SIGN_TX":
        return this.handleSignTx(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_EVM_GET_ACCOUNTS":
        return this.handleGetAccounts(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_EVM_REQUEST_ACCOUNTS":
        return this.handleRequestAccounts(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_EVM_PROVIDER_SEND":
        return this.handleProviderSend(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_EVM_PREVIEW_PUBLIC_KEYS":
        return this.handlePreviewPublicKeys(
          request as TransportResponder<typeof request.name>
        );
      case "SECURE_EVM_SHOULD_BE_METAMASK":
        return this.handleShouldBeMetaMask(
          request as TransportResponder<typeof request.name>
        );
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const missingEventCase: never = request.name;
        return Promise.resolve();
    }
  };

  private handlePreviewPublicKeys: TransportHandler<"SECURE_EVM_PREVIEW_PUBLIC_KEYS"> =
    async ({ request, event, respond }) => {
      const keyringStoreState = await this.keyringStore.state();
      const userKeyring =
        keyringStoreState !== KeyringStoreState.NeedsOnboarding
          ? await this.keyringStore.activeUserKeyring()
          : null;

      // no mnemonic means we're asking for hardware wallet.
      if (!request.mnemonic) {
        const ledgerResponse = await safeClientResponse(
          this.secureUIClient.confirm(event, {})
        );

        const walletDescriptors = ledgerResponse.walletDescriptors.map(
          (walletDescriptor) => {
            return {
              ...walletDescriptor,
              imported: !!userKeyring?.keyringForPublicKey(
                walletDescriptor.publicKey
              ),
            };
          }
        );
        return respond({ walletDescriptors });
      }

      let mnemonic = request.mnemonic;

      // if we're using the already existing mnemonic, get it.
      if (mnemonic === true) {
        const keyring = await this.keyringStore.activeUserKeyring();
        mnemonic = keyring.exportMnemonic();
      }

      // derive publicKeys from mnemnoic
      const seed = await mnemonicToSeed(mnemonic);
      const walletDescriptors: WalletDescriptor[] = request.derivationPaths.map(
        (derivationPath) => {
          const wallet = deriveEthereumWallet(seed, derivationPath);
          return {
            publicKey: wallet.address,
            derivationPath,
            blockchain: request.blockchain,
          };
        }
      );

      const newWalletDescriptors = walletDescriptors.map((walletDescriptor) => {
        return {
          ...walletDescriptor,
          imported: !!userKeyring?.keyringForPublicKey(
            walletDescriptor.publicKey
          ),
        };
      });

      return respond({ walletDescriptors: newWalletDescriptors });
    };

  private handleShouldBeMetaMask: TransportHandler<"SECURE_EVM_SHOULD_BE_METAMASK"> =
    async (event) => {
      const user = await safeClientResponse(this.userClient.getUser());
      if (user.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
        return event.error(new Error("Needs Onboarding"));
      }
      return event.respond({
        doNotImpersonateMetaMask: Boolean(
          user.preferences.doNotImpersonateMetaMask
        ),
      });
    };

  private handleGetAccounts: TransportHandler<"SECURE_EVM_GET_ACCOUNTS"> =
    async (event) => {
      const user = await safeClientResponse(this.userClient.getUser());
      if (user.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
        return event.error(new Error("Needs Onboarding"));
      }
      const chainId =
        user.preferences.blockchains[Blockchain.ETHEREUM].chainId || "0x1";

      if (
        this.accountsCacheKey &&
        this.accountsCacheKey === (user.user.username ?? null)
      ) {
        return event.respond({ accounts: this.accounts, chainId });
      }
      return event.error(new Error("Not Connected"));
    };

  private handleRequestAccounts: TransportHandler<"SECURE_EVM_REQUEST_ACCOUNTS"> =
    async (event) => {
      let user = await safeClientResponse(this.userClient.getUser());
      if (user.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
        return event.error(new Error("Needs Onboarding"));
      }

      let publicKey =
        user.publicKeys?.platforms[Blockchain.ETHEREUM]?.activePublicKey;

      if (
        !user.preferences?.approvedOrigins.includes(event.event.origin.address)
      ) {
        const response = await safeClientResponse(
          this.userClient.approveOrigin({
            origin: event.event.origin,
            blockchain: Blockchain.ETHEREUM,
            impersonatingMetaMask: event.request.impersonatingMetaMask,
          })
        );
        publicKey = response.publicKey;
      }

      const connectionUrl =
        user.preferences.blockchains[Blockchain.ETHEREUM].connectionUrl;
      const chainId =
        user.preferences.blockchains[Blockchain.ETHEREUM].chainId || "0x1";

      if (!publicKey) {
        return event.error(new Error("No Ethereum Pubkey Found"));
      }
      if (!connectionUrl) {
        return event.error(new Error("No Ethereum connectionUrl Found"));
      }
      if (!chainId) {
        return event.error(new Error("No Ethereum chainId Found"));
      }

      this.accounts = [publicKey];
      this.accountsCacheKey = user.user.username ?? null;

      return event.respond({
        accounts: [publicKey],
        chainId,
        connectionUrl,
      });
    };

  private handleSignMessage: TransportHandler<"SECURE_EVM_SIGN_MESSAGE"> =
    async (event) => {
      let publicKey = event.request.publicKey;

      if (["xnft", "browser"].includes(event.event.origin.context)) {
        const response = await safeClientResponse(
          this.userClient.approveOrigin({
            blockchain: Blockchain.ETHEREUM,
            origin: event.event.origin,
          })
        );
        publicKey = response.publicKey;
      }
      await safeClientResponse(this.secureUIClient.confirm(event.event, {}));

      const userKeyring = event.request.uuid
        ? await this.keyringStore.getUserKeyring(event.request.uuid)
        : await this.keyringStore.activeUserKeyring();

      const blockchainKeyring = userKeyring.keyringForBlockchain(
        Blockchain.ETHEREUM
      );

      const isLedgerWallet = !!blockchainKeyring.ledgerKeyring
        ?.publicKeys()
        .includes(publicKey);

      if (blockchainKeyring.ledgerKeyring && isLedgerWallet) {
        const ledgerRequest =
          await blockchainKeyring.ledgerKeyring.prepareSignMessage({
            message: event.request.message58,
            publicKey,
          });
        const ledgerResponse = await safeClientResponse(
          this.ledgerClient.evmSignMessage(
            {
              message58: ledgerRequest.signableMessage,
              derivationPath: ledgerRequest.derivationPath,
            },
            {
              origin: event.event.origin,
            }
          )
        );
        return event.respond({
          signatureHex: ledgerResponse.signatureHex,
        });
      } else {
        const signature = await blockchainKeyring.signMessage(
          event.request.message58,
          publicKey
        );
        return event.respond({ signatureHex: signature });
      }
    };

  private handleSignTx: TransportHandler<"SECURE_EVM_SIGN_TX"> = async (
    event
  ) => {
    let publicKey = event.request.publicKey;

    if (["xnft", "browser"].includes(event.event.origin.context)) {
      const response = await safeClientResponse(
        this.userClient.approveOrigin({
          blockchain: Blockchain.ETHEREUM,
          origin: event.event.origin,
        })
      );
      publicKey = response.publicKey;
    }

    const tx = event.request.txHex;

    const transaction = Transaction.from(tx);

    const confirmation = await safeClientResponse(
      this.secureUIClient.confirm(
        event.event,
        event.event.uiOptions ?? { type: "ANY" }
      )
    );

    transaction.nonce = confirmation.nonce;
    transaction.gasLimit = confirmation.gasLimit;
    transaction.maxPriorityFeePerGas =
      confirmation.maxPriorityFeePerGas ?? null;
    transaction.maxFeePerGas = confirmation.maxFeePerGas ?? null;

    const userKeyring = event.request.uuid
      ? await this.keyringStore.getUserKeyring(event.request.uuid)
      : await this.keyringStore.activeUserKeyring();

    const blockchainKeyring = userKeyring.keyringForBlockchain(
      Blockchain.ETHEREUM
    );

    const isLedgerWallet = !!blockchainKeyring.ledgerKeyring
      ?.publicKeys()
      .includes(publicKey);

    // If we need ledger signature, request via ledgerClient
    if (blockchainKeyring.ledgerKeyring && isLedgerWallet) {
      const ledgerRequest =
        await blockchainKeyring.ledgerKeyring.prepareSignTransaction({
          tx: event.request.txHex,
          publicKey,
        });
      const ledgerResponse = await safeClientResponse(
        this.ledgerClient.evmSignTransaction(
          {
            txHex: ledgerRequest.signableTx,
            derivationPath: ledgerRequest.derivationPath,
          },
          {
            origin: event.event.origin,
          }
        )
      );
      return event.respond({
        signedTxHex: ledgerResponse.signedTxHex,
      });
    }
    // otherwise sign with keyring
    else {
      const signedTxHex = await blockchainKeyring.signTransaction(
        encodeBase58(transaction.unsignedSerialized),
        publicKey
      );
      return event.respond({ signedTxHex });
    }
  };

  private handleProviderSend: TransportHandler<"SECURE_EVM_PROVIDER_SEND"> =
    async (event) => {
      // no origin check here
      // this method only provides public data returned from RPC without privileges
      const user = await safeClientResponse(this.userClient.getUser());
      if (user.keyringStoreState === KeyringStoreState.NeedsOnboarding) {
        return event.error(new Error("No User. Needs unboarding."));
      }
      const connectionUrl = user.preferences.blockchains.ethereum.connectionUrl;
      const chainId = user.preferences.blockchains.ethereum.chainId;
      if (!connectionUrl || !chainId) {
        return event.error(
          new Error("No Ethereum Connection preferences found.")
        );
      }
      const newProviderCacheKey = connectionUrl + chainId;
      if (!this.provider || this.providerCacheKey !== newProviderCacheKey) {
        this.providerCacheKey = newProviderCacheKey;
        this.provider = new JsonRpcProvider(connectionUrl, parseInt(chainId));
      }

      event.respond({
        result: await this.provider._send(event.request.payload),
      });
    };
}
