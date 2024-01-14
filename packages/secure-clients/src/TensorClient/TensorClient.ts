import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import type { Transaction } from "@solana/web3.js";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";

export type TensorMintDataType = {
  slug: string;
  onchainId: string;
  sellRoyaltyFeeBPS: string;
  platformFeeBPS: string;
  floorPrice: string | null;
  topTrait: null | {
    trait: string;
    value: string;
    price: number;
  };
  traits: {
    [trait: string]: {
      [traitValue: string]: {
        n: number;
        p: number;
      };
    };
  };
  highestBid:
    | null
    | {
        type: "tswap";
        offerPrice: number;
        offerPriceStr: string;
        address: string;
        sellNowPrice: string;
        ownerAddress: string;
        feeInfos: Array<{
          bps: 150;
          kind: "platform" | "royalty" | string;
        }>;
      }
    | {
        type: "tcomp";
        offerPrice: number;
        offerPriceStr: string;
        address: string;
        amount: string;
      }
    | {
        type: "tbid";
        offerPrice: number;
        offerPriceStr: string;
        bidder: string;
        expiry: string;
        price: string;
        seller: string;
      };
  activeListing:
    | null
    | {
        type: "tlisting";
        listPrice: number;
        listPriceStr: string;
        mintOnchainID: string;
        source: "TSWAP" | "TCOMP" | string;
        sellerId: string;
        grossAmount: string;
        grossAmountUnit: string;
      }
    | {
        type: "tswap";
        listPrice: number;
        listPriceStr: string;
        address: string;
        ownerAddress: string;
        poolType: "TRADE" | "NFT" | "TOKEN";
        delta: string;
        curveType: "EXPONENTIAL" | "LINEAR" | "XYK";
        startingPrice: string;
        mmCompoundFees: boolean;
        mmFeeBps: number;
        whitelistAddress: string;
      };
};

type TensorMintApiResponseType = {
  data: {
    mintTraits: {
      traitActive: {
        [trait: string]: {
          [traitValue: string]: {
            n: number;
            p: number;
          };
        };
      };
      traitMeta: {
        [trait: string]: {
          [traitValue: string]: {
            n: number;
            img: string;
          };
        };
      };
      raritySystems: string[];
      numMints: number;
    };
    mpFees: {
      makerFeeBps: number;
      mp: string;
      takerFeeBps: number;
      takerRoyalties: boolean;
    }[];
    mint: {
      slug: string;
      hidden: boolean;
      onchainId: string;
      sellRoyaltyFeeBPS: string;
      collection: {
        statsV2: {
          buyNowPrice: string;
        };
      };
      tensorBids: Array<{
        bidder: string;
        expiry: string;
        price: string;
        mint: {
          owner: string;
        };
      }>;
      activeListings: Array<{
        mint: {
          onchainId: string;
        };
        tx: {
          source: "TSWAP" | "TCOMP" | string;
          sellerId: string;
          grossAmount: string;
          grossAmountUnit: string;
        };
      }>;
      attributes: {
        trait_type: string;
        value: string;
      };
      tcompBids: Array<{
        address: string;
        amount: string;
        attributes: null | Array<{
          trait_type: string;
          value: string;
        }>;
      }>;
      tswapOrders: Array<{
        poolType: "TRADE" | "NFT" | "TOKEN";
        delta: string;
        curveType: "EXPONENTIAL" | "LINEAR" | "XYK";
        startingPrice: string;
        mmCompoundFees: boolean;
        mmFeeBps: number;
        whitelistAddress: string;
        address: string;
        ownerAddress: string;
        buyNowPrice: string;
        sellNowPrice: string;
        sellNowPriceNetFees: string;
        feeInfos: Array<{
          bps: 150;
          kind: "platform" | "royalty" | string;
        }>;
        nftsForSale: Array<{
          onchainId: string;
        }>;
      }>;
    };
  };
};

export type TensorActions = "list" | "delist" | "edit" | "sell";

export class TensorClient {
  public async fetchTensorMintData(variables: { owner: string; mint: string }) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
            query MintTraits($mint: String!, $owner: String!) {
              mintTraits(mint: $mint) {
                traitActive
                traitMeta
                raritySystems
                numMints
              }
              mpFees(owner: $owner) {
                makerFeeBps
                mp
                takerFeeBps
                takerRoyalties
              }
              mint(mint: $mint) {
                hidden
                onchainId
                slug
                sellRoyaltyFeeBPS
                collection {
                  statsV2 {
                    buyNowPrice
                  }
                }
                tswapOrders(sortBy: SellNowPriceDesc) {
                  delta
                  curveType
                  startingPrice
                  mmCompoundFees
                  mmFeeBps
                  poolType
                  whitelistAddress
                  address
                  ownerAddress
                  buyNowPrice
                  sellNowPrice # Pass this to tswapSellNftTx!
                  sellNowPriceNetFees
                  feeInfos {
                    bps
                    kind
                  }
                  nftsForSale {
                    onchainId
                  }
                }
                tensorBids(bestSellNowOnly: true, filterFunded: true) {
                  bidder
                  expiry
                  price
                  mint {
                    owner
                  }
                }
                tcompBids {
                  address
                  amount
                  attributes {
                    trait_type
                    value
                  }
                  quantity
                  filledQuantity
                }
                activeListings {
                  mint {
                    onchainId
                  }
                  tx {
                    source
                    sellerId
                    grossAmount
                    grossAmountUnit
                  }
                }
              }
            }
          `,
        variables,
      }),
    };

    return fetch("https://tensor.xnfts.dev", options)
      .then((resp) => {
        if (resp.status !== 200) {
          console.error(resp);
        }
        return resp.json().catch((e) => {
          console.error(resp);
          throw e;
        });
      })
      .then((response) => this.normalizeTensorMintData(response));
  }

  public async createTensorTx({
    action,
    compressed,
    publicKey,
    mint,
    price,
    tensorMintData,
  }: {
    action: TensorActions;
    compressed: boolean;
    publicKey: string;
    mint: string;
    price?: string;
    tensorMintData: TensorMintDataType;
  }): Promise<Transaction | VersionedTransaction> {
    const owner = new PublicKey(publicKey);
    const nftMint = new PublicKey(mint);

    switch (action) {
      case "list": {
        if (!price) {
          throw new Error("Price required to create listing.");
        }
        if (!compressed) {
          return await this.getListNftTx({
            owner: publicKey,
            mint,
            price,
          });
        } else {
          return await this.getListCompressedNftTx({
            owner: publicKey,
            mint,
            price,
          });
        }
      }
      case "edit": {
        const activeListing = tensorMintData.activeListing;
        if (!activeListing) {
          throw new Error("No active listing found.");
        }
        if (!price) {
          throw new Error("Price requried to edit listing.");
        }
        if (activeListing?.type !== "tlisting") {
          throw new Error("Unable to edit this listing.");
        }
        switch (activeListing.source) {
          case "TSWAP": {
            return await this.getEditTswapListingTx({
              owner: publicKey,
              mint,
              price,
            });
          }
          case "TCOMP": {
            return await this.getEditTcompListingTx({
              owner: publicKey,
              mint,
              price,
            });
          }
          default: {
            throw new Error("Unable to edit listing.");
          }
        }
      }
      case "delist": {
        const activeListing = tensorMintData.activeListing;
        if (!activeListing) {
          throw new Error("No active listing found.");
        }
        switch (activeListing.type) {
          case "tlisting": {
            switch (activeListing.source) {
              case "TENSORSWAP": {
                return await this.getTswapDelistNftTx({
                  mint,
                  owner: publicKey,
                });
              }
              case "TCOMP": {
                return await this.getTcompDelistNftTx({
                  mint,
                  owner: publicKey,
                });
              }
              default: {
                throw new Error("Unable to delist NFT.");
              }
            }
          }
          case "tswap": {
            return await this.getTswapWithdrawNftTx({
              mint,
              owner: publicKey,
              pool: activeListing.address,
            });
          }
          default: {
            throw new Error("Unable to delist NFT.");
          }
        }
      }
      case "sell": {
        const highestBid = tensorMintData.highestBid;
        if (!highestBid) {
          throw new Error("No bid found.");
        }
        switch (highestBid.type) {
          case "tbid": {
            return await this.getTakeBidTx({
              bidder: highestBid.bidder,
              mint,
              price: highestBid.price,
              seller: publicKey,
            });
          }
          case "tcomp": {
            return await this.getTakeTcompBidTx({
              mint,
              minPrice: highestBid.amount,
              seller: publicKey,
              bidStateAddress: highestBid.address,
            });
          }
          case "tswap": {
            const associatedTokenAcc = getAssociatedTokenAddressSync(
              nftMint,
              owner
            );
            return await this.getTakeTswapBidTx({
              minPriceLamports: highestBid.sellNowPrice,
              mint,
              pool: highestBid.address,
              seller: publicKey,
              sellerTokenAccount: associatedTokenAcc.toBase58(),
            });
          }
          default: {
            throw new Error("Unable to accept bid.");
          }
        }
      }
      default: {
        throw new Error("Unknown Action.");
      }
    }
  }

  private normalizeTensorMintData(
    response: TensorMintApiResponseType
  ): TensorMintDataType | null {
    if (!response.data || response?.data?.mint?.hidden) {
      return null;
    }
    const platformFees = response?.data?.mpFees?.find((mp) =>
      ["TComp", "TensorSwap"].includes(mp.mp)
    );
    const highestBids: Array<NonNullable<TensorMintDataType["highestBid"]>> =
      [];

    const topTraits = Object.entries(
      response?.data?.mintTraits?.traitActive ?? {}
    ).sort((a, b) => {
      const priceA = Object.values(a?.[1] ?? {})[0]?.p ?? 0;
      const priceB = Object.values(b?.[1] ?? {})[0]?.p ?? 0;
      return priceB - priceA;
    });

    const topTrait = topTraits[0]
      ? {
          trait: topTraits[0][0],
          value: Object.keys(topTraits[0][1])[0],
          price: Object.values(topTraits[0][1])[0].p,
        }
      : null;

    const highestTcompBid = response.data?.mint?.tcompBids
      // filter attribute bids that dont apply to this nft
      .filter((bid) => {
        // if no attributes -> we good
        if (!bid.attributes || bid.attributes.length <= 0) {
          return true;
        }

        // group attribues by type (same type -> OR, different type -> AND)
        const groupedAttributes: {
          [type: string]: string[];
        } = {};
        bid.attributes?.forEach((attribute) => {
          groupedAttributes[attribute.trait_type] ??= [];
          groupedAttributes[attribute.trait_type].push(attribute.value);
        });
        // if none of the attribute-types in bid are missing in nft:
        if (
          !Object.entries(groupedAttributes).find(([type, values]) => {
            // find one of the values
            const foundValue = values.find(
              (value) => response.data?.mintTraits?.traitMeta?.[type]?.[value]
            );
            // if one was found -> continue (false)
            return !foundValue;
          })
        ) {
          return true;
        }
        return false;
      })
      // sort price descending
      .sort((a, b) => {
        return parseFloat(b.amount) - parseFloat(a.amount);
      })[0];
    if (highestTcompBid) {
      highestBids.push({
        type: "tcomp",
        offerPrice: parseFloat(highestTcompBid.amount),
        offerPriceStr: highestTcompBid.amount,
        ...highestTcompBid,
      });
    }
    const highestTBid = response.data?.mint?.tensorBids?.[0] ?? undefined;
    if (highestTBid) {
      highestBids.push({
        type: "tbid",
        offerPrice: parseFloat(highestTBid.price),
        offerPriceStr: highestTBid.price,
        seller: highestTBid.mint.owner,
        ...highestTBid,
      });
    }
    const highestTSwapBid = response.data?.mint?.tswapOrders.find((order) => {
      return ["TOKEN", "TRADE"].includes(order.poolType) && order.sellNowPrice;
    });
    if (highestTSwapBid) {
      highestBids.push({
        type: "tswap",
        offerPrice: parseFloat(highestTSwapBid.sellNowPrice),
        offerPriceStr: highestTSwapBid.sellNowPrice,
        ...highestTSwapBid,
      });
    }
    const highestBid =
      highestBids.sort((a, b) => {
        return b.offerPrice - a.offerPrice;
      })[0] ?? null;

    let activeListing: TensorMintDataType["activeListing"] = null;
    const activeTensorListing =
      (response.data?.mint?.activeListings.find((listing) => {
        return ["TSWAP", "TCOMP"].includes(listing.tx.source);
      }) ||
        response.data?.mint?.activeListings?.[0]) ??
      null;

    if (activeTensorListing) {
      activeListing = {
        type: "tlisting",
        listPrice: parseFloat(activeTensorListing.tx.grossAmount),
        listPriceStr: activeTensorListing.tx.grossAmount,
        mintOnchainID: activeTensorListing.mint.onchainId,
        ...activeTensorListing.tx,
      };
    } else {
      const listingTswapOrder = response.data?.mint?.tswapOrders.filter(
        (order) => {
          return (
            ["NFT", "TRADE"].includes(order.poolType) &&
            order.nftsForSale.find(
              (nft) => nft.onchainId === response.data.mint.onchainId
            )
          );
        }
      )[0];
      if (listingTswapOrder) {
        activeListing = {
          ...listingTswapOrder,
          type: "tswap",
          listPrice: parseFloat(listingTswapOrder.buyNowPrice),
          listPriceStr: listingTswapOrder.buyNowPrice,
        };
      }
    }

    return {
      slug: response.data?.mint?.slug,
      onchainId: response.data?.mint?.onchainId,
      topTrait,
      floorPrice: response.data?.mint?.collection?.statsV2?.buyNowPrice ?? null,
      sellRoyaltyFeeBPS: response.data?.mint?.sellRoyaltyFeeBPS,
      platformFeeBPS: (platformFees?.takerFeeBps ?? 0).toString(),
      traits: response.data?.mintTraits?.traitActive,
      highestBid: highestBid,
      activeListing: activeListing,
    };
  }

  private async getTakeBidTx(variables: {
    bidder: string;
    mint: string;
    price: string;
    seller: string;
  }): Promise<VersionedTransaction> {
    const resp = await fetch("https://tensor.xnfts.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query TakeBidTx(
        $bidder: String!
        $mint: String!
        $price: Decimal!
        $seller: String!
      ) {
        takeBidTx(bidder: $bidder, mint: $mint, price: $price, seller: $seller) {
          txs {
            lastValidBlockHeight
            tx
            txV0 # If this is present, use this!
          }
        }
      }
      `,
        variables,
        operationName: "TakeBidTx",
      }),
    });

    const json = await resp.json();
    const txs = json?.data?.takeBidTx?.txs?.[0];
    if (!txs) {
      throw new Error("Unable to create transaction");
    }
    return VersionedTransaction.deserialize(Buffer.from(txs.txV0 ?? txs.tx));
  }

  private async getTakeTcompBidTx(variables: {
    minPrice: string;
    mint: string;
    seller: string;
    bidStateAddress: string;
  }): Promise<VersionedTransaction> {
    const resp = await fetch("https://tensor.xnfts.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query TcompTakeBidTx($minPrice: Decimal!, $mint: String!, $seller: String!, $bidStateAddress: String!) {
        tcompTakeBidTx(minPrice: $minPrice, mint: $mint, seller: $seller, bidStateAddress: $bidStateAddress) {
          txs {
            lastValidBlockHeight
            tx
            txV0 # If this is present, use this!
          }
        }
      }
      `,
        variables,
        operationName: "TcompTakeBidTx",
      }),
    });

    const json = await resp.json();
    const txs = json?.data?.tcompTakeBidTx?.txs?.[0];
    if (!txs) {
      console.error(json);
      throw new Error("Unable to create transaction");
    }
    return VersionedTransaction.deserialize(Buffer.from(txs.txV0 ?? txs.tx));
  }

  private async getTakeTswapBidTx(variables: {
    minPriceLamports: string;
    mint: string;
    pool: string;
    seller: string;
    sellerTokenAccount: string;
  }): Promise<VersionedTransaction> {
    const resp = await fetch("https://tensor.xnfts.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query TswapSellNftTx(
        $minPriceLamports: Decimal!
        $mint: String!
        $pool: String!
        $seller: String!
        $sellerTokenAccount: String
      ) {
        tswapSellNftTx(
          minPriceLamports: $minPriceLamports
          mint: $mint
          pool: $pool
          seller: $seller
          sellerTokenAccount: $sellerTokenAccount
        ) {
          txs {
            lastValidBlockHeight
            tx
            txV0 # If this is present, use this!
          }
        }
      }
      `,
        variables,
        operationName: "TswapSellNftTx",
      }),
    });

    const json = await resp.json();
    const txs = json?.data?.tswapSellNftTx?.txs?.[0];
    if (!txs) {
      throw new Error("Unable to create transaction");
    }
    return VersionedTransaction.deserialize(Buffer.from(txs.txV0 ?? txs.tx));
  }

  private async getTcompDelistNftTx(variables: {
    owner: string;
    mint: string;
  }): Promise<VersionedTransaction> {
    const resp = await fetch("https://tensor.xnfts.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query TcompDelistTx($mint: String!, $owner: String!) {
        tcompDelistTx(mint: $mint, owner: $owner) {
          txs {
            lastValidBlockHeight
            tx
            txV0 # If this is present, use this!
          }
        }
      }
      `,
        variables,
        operationName: "TcompDelistTx",
      }),
    });

    const json = await resp.json();
    const txs = json?.data?.tcompDelistTx?.txs?.[0];
    if (!txs) {
      throw new Error("Unable to create transaction");
    }
    return VersionedTransaction.deserialize(Buffer.from(txs.txV0 ?? txs.tx));
  }

  private async getTswapDelistNftTx(variables: {
    owner: string;
    mint: string;
  }): Promise<VersionedTransaction> {
    const resp = await fetch("https://tensor.xnfts.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query TswapDelistNftTx($mint: String!, $owner: String!) {
        tswapDelistNftTx(mint: $mint, owner: $owner) {
          txs {
            lastValidBlockHeight
            tx
            txV0 # If this is present, use this!
          }
        }
      }
      `,
        variables,
        operationName: "TswapDelistNftTx",
      }),
    });

    const json = await resp.json();
    const txs = json?.data?.tswapDelistNftTx?.txs?.[0];
    if (!txs) {
      throw new Error("Unable to create transaction");
    }
    return VersionedTransaction.deserialize(Buffer.from(txs.txV0 ?? txs.tx));
  }

  private async getTswapWithdrawNftTx(variables: {
    owner: string;
    mint: string;
    pool: string;
  }): Promise<VersionedTransaction> {
    const resp = await fetch("https://tensor.xnfts.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query TswapDepositWithdrawNftTx($action: DepositWithdrawAction!, $mint: String!, $pool: String!) {
        tswapDepositWithdrawNftTx(action: $action, mint: $mint, pool: $pool) {
          txs {
            lastValidBlockHeight
            tx
            txV0 # If this is present, use this!
          }
        }
      }
      `,
        variables: {
          ...variables,
          action: "WITHDRAW",
        },
        operationName: "TswapDepositWithdrawNftTx",
      }),
    });

    const json = await resp.json();
    const txs = json?.data?.tswapDepositWithdrawNftTx?.txs?.[0];
    if (!txs) {
      console.error(resp);
      throw new Error("Unable to create transaction");
    }
    return VersionedTransaction.deserialize(Buffer.from(txs.txV0 ?? txs.tx));
  }

  private async getListNftTx(variables: {
    owner: string;
    mint: string;
    price: string;
  }): Promise<VersionedTransaction> {
    const resp = await fetch("https://tensor.xnfts.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query TswapListNftTx($mint: String!, $owner: String!, $price: Decimal!) {
        tswapListNftTx(mint: $mint, owner: $owner, price: $price) {
          txs {
            lastValidBlockHeight
            tx
            txV0 # If this is present, use this!
          }
        }
      }
      `,
        variables,
        operationName: "TswapListNftTx",
      }),
    });

    const json = await resp.json();
    const txs = json?.data?.tswapListNftTx?.txs?.[0];
    if (!txs) {
      throw new Error("Unable to create transaction");
    }
    return VersionedTransaction.deserialize(Buffer.from(txs.txV0 ?? txs.tx));
  }

  private async getListCompressedNftTx(variables: {
    owner: string;
    mint: string;
    price: string;
  }): Promise<VersionedTransaction> {
    const resp = await fetch("https://tensor.xnfts.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query TcompListTx($mint: String!, $owner: String!, $price: Decimal!) {
        tcompListTx(mint: $mint, owner: $owner, price: $price) {
          txs {
            lastValidBlockHeight
            tx
            txV0 # If this is present, use this!
          }
        }
      }
      `,
        variables,
        operationName: "TcompListTx",
      }),
    });

    const json = await resp.json();
    const txs = json?.data?.tcompListTx?.txs?.[0];
    if (!txs) {
      throw new Error("Unable to create transaction");
    }
    return VersionedTransaction.deserialize(Buffer.from(txs.txV0 ?? txs.tx));
  }

  private async getEditTcompListingTx(variables: {
    owner: string;
    mint: string;
    price: string;
  }): Promise<VersionedTransaction> {
    const resp = await fetch("https://tensor.xnfts.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query TcompEditTx($mint: String!, $owner: String!, $price: Decimal!) {
        tcompEditTx(mint: $mint, owner: $owner, price: $price) {
          txs {
            lastValidBlockHeight
            tx
            txV0 # If this is present, use this!
          }
        }
      }
      `,
        variables,
        operationName: "TcompEditTx",
      }),
    });

    const json = await resp.json();
    const txs = json?.data?.tcompEditTx?.txs?.[0];
    if (!txs) {
      throw new Error("Unable to create transaction");
    }
    return VersionedTransaction.deserialize(Buffer.from(txs.txV0 ?? txs.tx));
  }

  private async getEditTswapListingTx(variables: {
    owner: string;
    mint: string;
    price: string;
  }): Promise<VersionedTransaction> {
    const resp = await fetch("https://tensor.xnfts.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
      query TswapEditSingleListingTx($mint: String!, $owner: String!, $price: Decimal!) {
        tswapEditSingleListingTx(mint: $mint, owner: $owner, price: $price) {
          txs {
            lastValidBlockHeight
            tx
            txV0 # If this is present, use this!
          }
        }
      }
      `,
        variables,
        operationName: "TswapEditSingleListingTx",
      }),
    });

    const json = await resp.json();
    const txs = json?.data?.tswapEditSingleListingTx?.txs?.[0];
    if (!txs) {
      throw new Error("Unable to create transaction");
    }
    return VersionedTransaction.deserialize(Buffer.from(txs.txV0 ?? txs.tx));
  }
}
