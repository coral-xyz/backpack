import { Blockchain } from "@coral-xyz/common";
import {
  EVMClient,
  getBlockchainConfig,
  safeClientResponse,
} from "@coral-xyz/secure-background/clients";
import type {
  BlockchainConfig,
  SecureEvent,
  TransportSender,
} from "@coral-xyz/secure-background/types";
// import type { JsonRpcProvider } from "@ethersproject/providers";
// import { JsonRpcSigner } from "@ethersproject/providers";
import type { ethers as ethers5 } from "ethers5";
import type {
  JsonRpcApiProviderOptions,
  JsonRpcPayload,
  JsonRpcResult,
  Networkish,
  Provider,
  Signer,
  TransactionLike,
  TransactionRequest,
  TransactionResponse,
  TypedDataDomain,
  TypedDataField,
} from "ethers6";
import {
  AbstractSigner,
  Contract,
  encodeBase58,
  JsonRpcApiProvider,
  toUtf8Bytes,
  toUtf8String,
  Transaction,
  ZeroAddress,
} from "ethers6";

import type { BackpackAssetId, BackpackEntity } from "../BlockchainClientBase";
import { BlockchainClientBase } from "../BlockchainClientBase";

import type { EthereumContext } from "./ethereum";
import { Ethereum } from "./ethereum";

type UiOptions = SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"];

export class EthereumClient extends BlockchainClientBase<Blockchain.ETHEREUM> {
  // Do NOT delete this.
  public static config: BlockchainConfig = getBlockchainConfig(
    Blockchain.ETHEREUM
  );
  private secureEvmClient: EVMClient;
  public provider: BackpackEthereumProvider & Provider;

  constructor(client: TransportSender) {
    super();
    this.secureEvmClient = new EVMClient(client);
    this.provider = new BackpackEthereumProvider(this.secureEvmClient);
    // Do NOT delete this.
    this.config = getBlockchainConfig(Blockchain.ETHEREUM);
  }

  public async transferAsset(
    req: {
      assetId: BackpackAssetId;
      from: BackpackEntity;
      to: BackpackEntity;
      amount: string;
    }
    // uiOptions?: SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"]
  ): Promise<string> {
    const { assetId, from, to, amount } = req;
    const token = JSON.parse(assetId);

    // const network = await this.provider.getNetwork();
    // const chainId = parseInt(network.chainId.toString());
    const ethereumCtx: EthereumContext = {
      walletPublicKey: from.publicKey,
      provider: this.provider as unknown as ethers5.providers.Provider,
      ethereumClient: this,
      chainId: "0x1",
      // feeData: await this.provider.getFeeData()
      // backgroundClient: undefined;
    };
    let transaction;
    let uiOptions: UiOptions = { type: "ANY" };
    if (token.address === ZeroAddress) {
      // Zero address token is native ETH
      transaction = await Ethereum.transferEthTransaction(ethereumCtx, {
        to: to.publicKey.toLocaleLowerCase(),
        value: amount.toString(),
      });
      uiOptions = {
        type: "SEND_TOKEN",
        assetId: token.id,
        to: {
          address: to.publicKey,
          username: to.username,
        },
        amount: amount.toString(),
        token,
      };
    } else {
      // Token has a tokenId, must be an ERC721 token
      const ERC1155InterfaceId: string = "0xd9b67a26";
      const ERC721InterfaceId: string = "0x80ac58cd";
      const ERC20InterfaceId: string = "0x36372b07";
      const ERC160abi = [
        {
          inputs: [
            {
              internalType: "bytes4",
              name: "interfaceId",
              type: "bytes4",
            },
          ],
          name: "supportsInterface",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ];
      const erc160 = new Contract(token.address, ERC160abi, this.getProvider());
      const [isErc721, isErc1155, isErc20] = await Promise.all([
        erc160.supportsInterface(ERC721InterfaceId),
        erc160.supportsInterface(ERC1155InterfaceId),
        erc160.supportsInterface(ERC20InterfaceId),
      ]);

      if (isErc721 || isErc1155) {
        if (isErc1155) {
          transaction = await Ethereum.transferErc1155Transaction(ethereumCtx, {
            to: to.publicKey.toLocaleLowerCase(),
            from: from.publicKey.toLocaleLowerCase(),
            contractAddress: token.address!.toLocaleLowerCase(),
            tokenId: token.tokenId,
            amount: amount,
          });
        } else {
          transaction = await Ethereum.transferErc721Transaction(ethereumCtx, {
            to: to.publicKey.toLocaleLowerCase(),
            from: from.publicKey.toLocaleLowerCase(),
            contractAddress: token.address!.toLocaleLowerCase(),
            tokenId: token.tokenId,
          });
        }
        uiOptions = {
          type: "SEND_NFT",
          assetId: token.id,
          to: {
            address: to.publicKey,
            username: to.username,
          },
          amount: amount.toString(),
          token,
        };
      } else if (isErc20) {
        // Otherwise assume it is an ERC20 token
        transaction = await Ethereum.transferErc20Transaction(ethereumCtx, {
          to: to.publicKey.toLocaleLowerCase(),
          contractAddress: token.address!.toLocaleLowerCase(),
          amount: amount.toString(),
        });
        uiOptions = {
          type: "SEND_TOKEN",
          assetId: token.id,
          to: {
            address: to.publicKey,
            username: to.username,
          },
          amount: amount.toString(),
          token,
        };
      }
    }

    const signer = this.getSigner(from.publicKey);
    const response = await signer.sendTransaction(
      transaction as any,
      uiOptions
    );
    return response.hash;
  }

  public async burnAsset(
    req: {
      assetId: BackpackAssetId;
      from: BackpackEntity;
      amount?: string;
    },
    uiOptions?: SecureEvent["uiOptions"]
  ): Promise<string> {
    console.log(req);
    return "";
  }

  public async confirmTransaction(tx: string): Promise<true> {
    // Wait for mining
    await this.provider.waitForTransaction(tx);
    // Grab the transaction
    const transaction = await this.provider.getTransaction(tx);

    if (!transaction) {
      throw new Error(`Unable to fetch Ethereum transaction`);
    }
    // We already waited, but calling .wait will throw if the transaction failed
    await transaction.wait();

    return true;
  }

  public getSigner(publicKey: string, uuid?: string): BackpackEthereumSigner {
    return new BackpackEthereumSigner(
      this.secureEvmClient,
      this.provider,
      publicKey,
      uuid
    );
  }

  public getProvider(): BackpackEthereumProvider {
    return this.provider;
  }

  async previewPublicKeys(
    derivationPaths: string[],
    mnemonic?: true | string
  ): Promise<
    {
      blockchain: Blockchain;
      publicKey: string;
      derivationPath: string;
    }[]
  > {
    const response = await safeClientResponse(
      this.secureEvmClient.previewPublicKeys({
        blockchain: Blockchain.ETHEREUM,
        derivationPaths,
        mnemonic,
      })
    );
    return response.walletDescriptors;
  }

  public async backpack_should_be_metamask(): Promise<boolean> {
    const response = await this.secureEvmClient.should_be_metamask();
    return !response.response?.doNotImpersonateMetaMask;
  }

  public async eth_getAccounts(): Promise<{
    chainId: string;
    accounts: string[];
  }> {
    const response = await this.secureEvmClient.evm_getAccounts();
    if (!response.response) {
      throw new Error(response.error?.message);
    }
    return response.response;
  }

  async eth_requestAccounts({
    impersonatingMetaMask,
    blockchain,
  }: {
    impersonatingMetaMask?: boolean;
    blockchain: Blockchain;
  }): Promise<{
    chainId: string;
    connectionUrl: string;
    accounts: string[];
  }> {
    const response = await this.secureEvmClient.evm_requestAccounts({
      blockchain,
      impersonatingMetaMask,
    });
    if (!response.response) {
      throw new Error(response.error?.message);
    }
    return response.response;
  }
}

class BackpackEthereumProvider extends JsonRpcApiProvider {
  constructor(
    private evmClient: EVMClient,
    network?: Networkish,
    options?: JsonRpcApiProviderOptions
  ) {
    super(network, options);
  }

  public _isProvider = true;

  async send(
    method: string,
    params: Array<any> | Record<string, any>
  ): Promise<any> {
    // All requests are over HTTP, so we can just start handling requests
    // We do this here rather than the constructor so that we don't send any
    // requests to the network (i.e. eth_chainId) until we absolutely have to.
    await this._start();

    return await super.send(method, params);
  }

  async _send(
    payload: JsonRpcPayload | Array<JsonRpcPayload>
  ): Promise<Array<JsonRpcResult>> {
    const result = await this.evmClient.provider_send({
      payload: Array.isArray(payload) ? payload : [payload],
    });
    if (!result.response) {
      throw result.error;
    }
    return result.response.result;
  }
}

class BackpackEthereumSigner extends AbstractSigner implements Signer {
  constructor(
    private secureEvmClient: EVMClient,
    provider: Provider,
    private publicKey: string,
    private uuid?: string
  ) {
    super(provider);
  }

  public _isSigner = true;

  async getAddress(): Promise<string> {
    return this.publicKey;
  }

  connect(_provider: Provider | null): Signer {
    throw new Error("Get connected Signer via EthereumClient.getSigner");
  }

  async sendTransaction(
    tx: TransactionRequest,
    uiOptions?: SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"]
  ): Promise<TransactionResponse> {
    if (!this.provider) {
      throw new Error("Provider Unavailable.");
    }
    const pop = await this.populateTransaction(tx);
    delete pop.from;
    const txObj = Transaction.from(pop);

    return await this.provider.broadcastTransaction(
      await this.signTransaction(txObj, uiOptions)
    );
  }

  async signTransaction(
    tx: TransactionLike<string>,
    uiOptions?: SecureEvent<"SECURE_EVM_SIGN_TX">["uiOptions"]
  ): Promise<string> {
    cleanupLegacyTransaction(tx);

    const signTransactionResponse = await safeClientResponse(
      this.secureEvmClient.evm_signTransaction(
        {
          txHex: Transaction.from(tx).unsignedSerialized,
          publicKey: this.publicKey,
          uuid: this.uuid,
        },
        { uiOptions }
      )
    );
    return signTransactionResponse.signedTxHex;
  }

  async signMessage(messageHex: string | Uint8Array): Promise<string> {
    const messageBytes =
      typeof messageHex === "string"
        ? toUtf8Bytes(toUtf8String(messageHex))
        : messageHex;
    const message58 = encodeBase58(messageBytes);

    const signedMessage = await safeClientResponse(
      this.secureEvmClient.evm_signMessage({
        message58,
        publicKey: this.publicKey,
        uuid: this.uuid,
      })
    );

    return signedMessage.signatureHex;
  }

  async signTypedData(
    _domain: TypedDataDomain,
    _types: Record<string, TypedDataField[]>,
    _value: Record<string, any>
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
}

function cleanupLegacyTransaction<
  T extends TransactionLike<string> | TransactionRequest
>(transaction: T): T {
  // Remove eth_sendTransaction gas & from key since it is incompatible with ethers
  // https://github.com/ethers-io/ethers.js/issues/299
  delete transaction.from;
  // @ts-ignore
  const gas = transaction.gas;
  // @ts-ignore
  delete transaction.gas;
  transaction.gasLimit = gas ? BigInt(gas) : transaction.gasLimit;

  // Set transaction type if fully formed EIP1559
  const type = transaction.type as number | string | null | undefined;
  if (
    (type === 2 || type === "0x2" || type == null) &&
    transaction.maxFeePerGas != null &&
    transaction.maxPriorityFeePerGas != null
  ) {
    transaction.type = 2;
  }

  return transaction;
}
