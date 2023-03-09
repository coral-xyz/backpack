import type { Commitment, ConnectionConfig, PublicKey } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";

type JsonRpcParams<ReadApiMethodParams> = {
  method: string;
  id?: string;
  params: ReadApiMethodParams;
};

type JsonRpcOutput<ReadApiJsonOutput> = {
  result: ReadApiJsonOutput;
};

export type GetAssetRpcInput = {
  id: string;
};

export type GetAssetRpcResponse = {
  id: string;
  interface: "V1_NFT";
  content: {
    json_uri: string;
    // TODO(jon): Figure this out
    metadata: any;
  };
  authorities: Array<{ address: string; scopes: ["full"] }>;
  mutable: boolean;
  royalty: {
    primary_sale_happened: boolean;
    basis_points: number;
  };
  supply: {
    edition_nonce: number;
    print_current_supply: number;
    print_max_supply: number;
  };
  // TODO(jon): Figure this out
  creators: any[];
  grouping: Array<{ group_key: "collection"; group_value: string }>;
  compression: {
    tree: string;
    leaf_id: number;
  };
};

type GetAssetProofRpcInput = {
  id: string;
};

export type GetAssetProofRpcResponse = {
  root: string;
  proof: string[];
  node_index: number;
  leaf: string;
  tree_id: string;
};

type GetAssetsByOwnerRpcInput = {
  ownerAddress: string;
  sortBy: {
    sortBy: string;
    sortDirection: string;
  };
  // TODO(jon): Add pagination input
  limit: number;
  page: number;
};

// TODO(jon): figure this out
type GetAssetsByOwnerRpcResponse = { items: any[] };

export class ReadApiConnection extends Connection {
  constructor(
    endpoint: string,
    commitmentOrConfig?: Commitment | ConnectionConfig
  ) {
    super(endpoint, commitmentOrConfig);
  }

  private callReadApi = async <ReadApiMethodParams, ReadApiJsonOutput>(
    jsonRpcParams: JsonRpcParams<ReadApiMethodParams>
  ): Promise<JsonRpcOutput<ReadApiJsonOutput>> => {
    const response = await fetch(this.rpcEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: jsonRpcParams.method,
        id: jsonRpcParams.id ?? "rpd-op-123",
        params: jsonRpcParams.params,
      }),
    });

    return await response.json();
  };

  // Asset id can be calculated via Bubblegum#getLeafAssetId
  // It is a PDA with the following seeds: ["asset", tree, leafIndex]
  async getAsset(assetId: PublicKey): Promise<GetAssetRpcResponse> {
    const { result: asset } = await this.callReadApi<
      GetAssetRpcInput,
      GetAssetRpcResponse
    >({
      method: "getAsset",
      params: {
        id: assetId.toBase58(),
      },
    });

    return asset;
  }

  // Asset id can be calculated via Bubblegum#getLeafAssetId
  // It is a PDA with the following seeds: ["asset", tree, leafIndex]
  async getAssetProof(assetId: PublicKey): Promise<GetAssetProofRpcResponse> {
    const { result: proof } = await this.callReadApi<
      GetAssetProofRpcInput,
      GetAssetProofRpcResponse
    >({
      method: "getAssetProof",
      params: {
        id: assetId.toBase58(),
      },
    });

    return proof;
  }

  async getAssetsByOwner(
    publicKey: PublicKey
  ): Promise<GetAssetsByOwnerRpcResponse> {
    const { result } = await this.callReadApi<
      GetAssetsByOwnerRpcInput,
      GetAssetsByOwnerRpcResponse
    >({
      method: "getAssetsByOwner",
      params: {
        ownerAddress: publicKey.toBase58(),
        sortBy: { sortBy: "updated", sortDirection: "desc" },
        // TODO(jon): Figure out pagination
        limit: 5,
        page: 0,
      },
    });

    return result;
  }
}
