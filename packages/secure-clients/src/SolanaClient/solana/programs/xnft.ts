import type { Provider } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { externalResourceUri } from "@coral-xyz/common";
import { PublicKey } from "@solana/web3.js";

export const XNFT_PROGRAM_ID = new PublicKey(
  "xnft5aaToUM4UFETUQfj7NUDUBdvYHTVhNFThEYTm55"
);

export const BAKED_IN_XNFTS = {
  one: {
    publicKey: "CkqWjTWzRMAtYN3CSs8Gp4K9H891htmaN1ysNXqcULc8",
    account: {
      authority: PublicKey.default,
      xnft: new PublicKey("CkqWjTWzRMAtYN3CSs8Gp4K9H891htmaN1ysNXqcULc8"),
      masterMetadata: new PublicKey(
        "ANRn3ypikUTDEsY6ShgeHskX8bmZGpbmXEDACGt8hQAR"
      ),
      edition: new anchor.BN("00"),
      reserved: Array(64).fill(0),
    },
  },
  explorer: {
    publicKey: "oRN37pXigdDzpSPTe9ma5UWz9pZ4srKgS8To3juBNRi",
    account: {
      authority: PublicKey.default,
      xnft: new PublicKey("oRN37pXigdDzpSPTe9ma5UWz9pZ4srKgS8To3juBNRi"),
      masterMetadata: new PublicKey(
        "6VJYeRDbQBUG87UisCtq5yrxwWVP5mfpv4GC4q1afJuG"
      ),
      edition: new anchor.BN("00"),
      reserved: Array(64).fill(0),
    },
  },
  prices: {
    publicKey: "4GWq6KwrSmi3boGVayz4LM2Mz12GHQ3bpB1W2i7F5GRR",
    account: {
      authority: PublicKey.default,
      xnft: new PublicKey("4GWq6KwrSmi3boGVayz4LM2Mz12GHQ3bpB1W2i7F5GRR"),
      masterMetadata: new PublicKey(
        "9tHKPiFsXy4kpXL4es9PUJ5w9bnzu8rHPdMNF5WyfJSD"
      ),
      edition: new anchor.BN("00"),
      reserved: Array(64).fill(0),
    },
  },
  mnemonics: {
    publicKey: "GUt1LFqrs5Wbp6b6jLK1rXUvQKEavmAvM2UjAYWwJsNh",
    account: {
      authority: PublicKey.default,
      xnft: new PublicKey("GUt1LFqrs5Wbp6b6jLK1rXUvQKEavmAvM2UjAYWwJsNh"),
      masterMetadata: new PublicKey(
        "4WatrHZmabx9jEEL18SEQEWAtbHCktEHBaLSWiZ2kDeK"
      ),
      edition: new anchor.BN("00"),
      reserved: Array(64).fill(0),
    },
  },
};

export async function fetchXnfts(
  provider: Provider,
  wallet: PublicKey
): Promise<
  Array<{
    xnftAccount: any;
    xnft: any;
    metadataPublicKey: any;
    metadataAccount: any;
    metadata: any;
    install: any;
  }>
> {
  const client = xnftClient(provider);

  // Fetch all xnfts installed by this user.
  const xnftInstalls = await client.account.install.all([
    {
      memcmp: {
        offset: 8, // Discriminator
        bytes: wallet.toString(),
      },
    },
  ]);

  // Hack to get baked in xNFTs for all instances by mocking installations
  // @ts-ignore
  xnftInstalls.push(...Object.values(BAKED_IN_XNFTS));

  if (xnftInstalls.length === 0) {
    return [];
  }

  //
  // Get the metadata accounts for all xnfts.
  //
  const xnftMetadata = await Promise.all(
    xnftInstalls.map(({ account }) => fetchXnft(account.xnft))
  );

  return xnftMetadata?.map((metadata, idx) => ({
    ...metadata,
    install: xnftInstalls[idx],
  })) as any;
}

export async function fetchXnftsFromPubkey(
  xnfts: string[]
): Promise<{ xnftId: string; image?: string; title?: string }[]> {
  const accounts = await Promise.all(
    xnfts.map(async (xnft) => ({
      xnftId: xnft,
      metadata: await fetchXnft(xnft),
    }))
  );

  return accounts.map(({ xnftId, metadata }) => {
    return {
      xnftId,
      image: externalResourceUri(metadata?.metadata?.image),
      title: metadata?.metadata?.name,
    };
  });
}

export async function fetchXnft(xnft: PublicKey | string): Promise<{
  xnftAccount: any;
  xnft: any;
  metadataPublicKey: any;
  metadataAccount: any;
  metadata: any;
} | null> {
  const xnftMetadata: any | null = await fetch(
    `https://swr.xnftdata.com/nft-data/xnft/${new PublicKey(xnft).toBase58()}`
  )
    .then((r) => r.json())
    .catch((e) => {
      console.error(e);
      return null;
    });

  if (!xnftMetadata) {
    return null;
  }

  return {
    metadataPublicKey: xnftMetadata.masterMetadata,
    metadataAccount: xnftMetadata.metadataAccount,
    metadata: xnftMetadata.metadata,
    xnftAccount: xnftMetadata.xnftAccount,
    xnft: xnftMetadata.xnft,
  };
}

export function xnftClient(provider: Provider): Program<Xnft> {
  return new Program<Xnft>(IDL, XNFT_PROGRAM_ID, provider);
}

export type Xnft = {
  version: "0.2.0";
  name: "xnft";
  constants: [
    {
      name: "MAX_RATING";
      type: "u8";
      value: "5";
    }
  ];
  instructions: [
    {
      name: "createAppXnft";
      docs: [
        "Creates all parts of an xNFT instance.",
        'Once this is invoked, an xNFT exists and can be "installed" by users.'
      ];
      accounts: [
        {
          name: "masterMint";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "mint";
              },
              {
                kind: "account";
                type: "publicKey";
                path: "publisher";
              },
              {
                kind: "arg";
                type: "string";
                path: "name";
              }
            ];
          };
        },
        {
          name: "masterToken";
          isMut: true;
          isSigner: false;
        },
        {
          name: "masterMetadata";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "metadata";
              },
              {
                kind: "account";
                type: "publicKey";
                path: "metadata_program";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Mint";
                path: "master_mint";
              }
            ];
            programId: {
              kind: "account";
              type: "publicKey";
              path: "metadata_program";
            };
          };
        },
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "xnft";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Mint";
                path: "master_mint";
              }
            ];
          };
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "publisher";
          isMut: false;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "name";
          type: "string";
        },
        {
          name: "params";
          type: {
            defined: "CreateXnftParams";
          };
        }
      ];
    },
    {
      name: "createCollectibleXnft";
      docs: [
        "Creates an xNFT instance on top of an existing digital collectible that is MPL compliant."
      ];
      accounts: [
        {
          name: "masterMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "masterToken";
          isMut: false;
          isSigner: false;
        },
        {
          name: "masterMetadata";
          isMut: false;
          isSigner: false;
        },
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "xnft";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Mint";
                path: "master_mint";
              }
            ];
          };
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "publisher";
          isMut: false;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "params";
          type: {
            defined: "CreateXnftParams";
          };
        }
      ];
    },
    {
      name: "createInstall";
      docs: [
        'Creates an "installation" of an xNFT.',
        "Installation is just a synonym for minting an xNFT edition for a given",
        "user."
      ];
      accounts: [
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
          relations: ["install_vault"];
        },
        {
          name: "installVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "install";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "install";
              },
              {
                kind: "account";
                type: "publicKey";
                path: "target";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Xnft";
                path: "xnft";
              }
            ];
          };
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "target";
          isMut: false;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "createPermissionedInstall";
      docs: [
        'Creates an "installation" of a private xNFT through prior access approval',
        "granted by the xNFT's installation authority."
      ];
      accounts: [
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
          relations: ["install_vault"];
        },
        {
          name: "installVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "install";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "install";
              },
              {
                kind: "account";
                type: "publicKey";
                path: "authority";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Xnft";
                path: "xnft";
              }
            ];
          };
        },
        {
          name: "access";
          isMut: false;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "access";
              },
              {
                kind: "account";
                type: "publicKey";
                path: "authority";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Xnft";
                path: "xnft";
              }
            ];
          };
          relations: ["xnft"];
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "createReview";
      docs: [
        'Creates a "review" of an xNFT containing a URI to a comment and a 0-5 rating.'
      ];
      accounts: [
        {
          name: "install";
          isMut: false;
          isSigner: false;
          relations: ["xnft"];
        },
        {
          name: "masterToken";
          isMut: false;
          isSigner: false;
        },
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
        },
        {
          name: "review";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "review";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Xnft";
                path: "xnft";
              },
              {
                kind: "account";
                type: "publicKey";
                path: "author";
              }
            ];
          };
        },
        {
          name: "author";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "uri";
          type: "string";
        },
        {
          name: "rating";
          type: "u8";
        }
      ];
    },
    {
      name: "deleteInstall";
      docs: ["Closes the install account."];
      accounts: [
        {
          name: "install";
          isMut: true;
          isSigner: false;
          relations: ["authority"];
        },
        {
          name: "receiver";
          isMut: true;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: "deleteReview";
      docs: [
        "Closes the review account and removes metrics from xNFT account."
      ];
      accounts: [
        {
          name: "review";
          isMut: true;
          isSigner: false;
          relations: ["author", "xnft"];
        },
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
        },
        {
          name: "receiver";
          isMut: true;
          isSigner: false;
        },
        {
          name: "author";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: "grantAccess";
      docs: [
        "Creates an access program account that indicates a wallet's",
        "access permission to install a private xNFT."
      ];
      accounts: [
        {
          name: "xnft";
          isMut: false;
          isSigner: false;
        },
        {
          name: "wallet";
          isMut: false;
          isSigner: false;
        },
        {
          name: "access";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "access";
              },
              {
                kind: "account";
                type: "publicKey";
                path: "wallet";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Xnft";
                path: "xnft";
              }
            ];
          };
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "revokeAccess";
      docs: [
        "Closes the access program account for a given wallet on a private xNFT,",
        "effectively revoking their permission to create installations of the xNFT."
      ];
      accounts: [
        {
          name: "xnft";
          isMut: false;
          isSigner: false;
        },
        {
          name: "wallet";
          isMut: false;
          isSigner: false;
        },
        {
          name: "access";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "access";
              },
              {
                kind: "account";
                type: "publicKey";
                path: "wallet";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Xnft";
                path: "xnft";
              }
            ];
          };
          relations: ["wallet", "xnft"];
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: "setCurator";
      docs: ["Assigns a curator public key to the provided xNFT."];
      accounts: [
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
        },
        {
          name: "masterToken";
          isMut: false;
          isSigner: false;
        },
        {
          name: "curator";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    },
    {
      name: "setSuspended";
      docs: ["Sets the install suspension flag on the xnft."];
      accounts: [
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
        },
        {
          name: "masterToken";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "flag";
          type: "bool";
        }
      ];
    },
    {
      name: "transfer";
      docs: ["Transfer the xNFT to the provided designation wallet."];
      accounts: [
        {
          name: "xnft";
          isMut: false;
          isSigner: false;
          relations: ["master_mint"];
        },
        {
          name: "source";
          isMut: true;
          isSigner: false;
        },
        {
          name: "destination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "masterMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "recipient";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "associatedTokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "updateXnft";
      docs: [
        "Updates the code of an xNFT.",
        "This is simply a token metadata update cpi."
      ];
      accounts: [
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
          relations: ["master_metadata"];
        },
        {
          name: "masterToken";
          isMut: false;
          isSigner: false;
        },
        {
          name: "masterMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "curationAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "updater";
          isMut: false;
          isSigner: true;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "updates";
          type: {
            defined: "UpdateParams";
          };
        }
      ];
    },
    {
      name: "verifyCurator";
      docs: [
        "Verifies the assignment of a curator to an xNFT, signed by the curator authority."
      ];
      accounts: [
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
        },
        {
          name: "curator";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "access";
      type: {
        kind: "struct";
        fields: [
          {
            name: "wallet";
            docs: ["The pubkey of the wallet being granted access (32)."];
            type: "publicKey";
          },
          {
            name: "xnft";
            docs: ["The pubkey of the xNFT account that is access gated (32)."];
            type: "publicKey";
          },
          {
            name: "bump";
            docs: ["Bump nonce of the PDA (1)."];
            type: "u8";
          },
          {
            name: "reserved";
            docs: ["Unused reserved byte space for additive future changes."];
            type: {
              array: ["u8", 32];
            };
          }
        ];
      };
    },
    {
      name: "install";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            docs: ["The authority who created the installation (32)."];
            type: "publicKey";
          },
          {
            name: "xnft";
            docs: ["The pubkey of the xNFT that was installed (32)."];
            type: "publicKey";
          },
          {
            name: "masterMetadata";
            docs: ["The pubkey of the MPL master metadata account (32)."];
            type: "publicKey";
          },
          {
            name: "edition";
            docs: ["The sequential installation number of the xNFT (8)."];
            type: "u64";
          },
          {
            name: "reserved";
            docs: ["Unused reserved byte space for additive future changes."];
            type: {
              array: ["u8", 64];
            };
          }
        ];
      };
    },
    {
      name: "review";
      type: {
        kind: "struct";
        fields: [
          {
            name: "author";
            docs: ["The pubkey of the account that created the review (32)."];
            type: "publicKey";
          },
          {
            name: "xnft";
            docs: ["The pubkey of the associated xNFT (32)."];
            type: "publicKey";
          },
          {
            name: "rating";
            docs: ["The numerical rating for the review, 0-5 (1)."];
            type: "u8";
          },
          {
            name: "uri";
            docs: [
              "The URI of the off-chain JSON data that holds the comment (4 + len)."
            ];
            type: "string";
          },
          {
            name: "reserved";
            docs: ["Unused reserved byte space for future additive changes."];
            type: {
              array: ["u8", 32];
            };
          }
        ];
      };
    },
    {
      name: "xnft";
      type: {
        kind: "struct";
        fields: [
          {
            name: "publisher";
            docs: ["The pubkey of the original xNFT creator (32)."];
            type: "publicKey";
          },
          {
            name: "installVault";
            docs: [
              "The pubkey of the account to receive install payments (32)."
            ];
            type: "publicKey";
          },
          {
            name: "masterMetadata";
            docs: ["The pubkey of the MPL master metadata account (32)."];
            type: "publicKey";
          },
          {
            name: "masterMint";
            docs: ["The pubkey of the master token mint (32)."];
            type: "publicKey";
          },
          {
            name: "installAuthority";
            docs: [
              "The optional pubkey of the xNFT installation authority (33)."
            ];
            type: {
              option: "publicKey";
            };
          },
          {
            name: "curator";
            docs: [
              "Optional pubkey of the global authority required for reviewing xNFT updates (34)."
            ];
            type: {
              option: {
                defined: "CuratorStatus";
              };
            };
          },
          {
            name: "uri";
            docs: [
              "The URI of the custom metadata blob for the xNFT (4 + mpl_token_metadata::state::MAX_URI_LENGTH)."
            ];
            type: "string";
          },
          {
            name: "mintSeedName";
            docs: [
              "The original name used to seed the master mint if it was a standalone (1 + 4 + mpl_token_metadata::state::MAX_NAME_LENGTH)."
            ];
            type: {
              option: "string";
            };
          },
          {
            name: "kind";
            docs: ["The `Kind` enum variant describing the type of xNFT (1)."];
            type: {
              defined: "Kind";
            };
          },
          {
            name: "tag";
            docs: [
              "The `Tag` enum variant to assign the category of xNFT (1)."
            ];
            type: {
              defined: "Tag";
            };
          },
          {
            name: "supply";
            docs: [
              "The optional finite supply of installations available for this xNFT (9)."
            ];
            type: {
              option: "u64";
            };
          },
          {
            name: "totalInstalls";
            docs: [
              "Total amount of install accounts that have been created for this xNFT (8)."
            ];
            type: "u64";
          },
          {
            name: "installPrice";
            docs: ["The price-per-install of this xNFT (8)."];
            type: "u64";
          },
          {
            name: "createdTs";
            docs: ["The unix timestamp of when the account was created (8)."];
            type: "i64";
          },
          {
            name: "updatedTs";
            docs: [
              "The unix timestamp of the last time the account was updated (8)."
            ];
            type: "i64";
          },
          {
            name: "totalRating";
            docs: ["The total cumulative rating value of all reviews (8)."];
            type: "u64";
          },
          {
            name: "numRatings";
            docs: [
              "The number of ratings created used to calculate the average (4)."
            ];
            type: "u32";
          },
          {
            name: "suspended";
            docs: [
              "Flag to determine whether new installations of the xNFT should be halted (1)."
            ];
            type: "bool";
          },
          {
            name: "bump";
            docs: ["The bump nonce for the xNFT's PDA (1)."];
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "reserved0";
            docs: ["Unused reserved byte space for additive future changes."];
            type: {
              array: ["u8", 64];
            };
          },
          {
            name: "reserved1";
            type: {
              array: ["u8", 24];
            };
          },
          {
            name: "reserved2";
            type: {
              array: ["u8", 9];
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "CreatorsParam";
      type: {
        kind: "struct";
        fields: [
          {
            name: "address";
            type: "publicKey";
          },
          {
            name: "share";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "CreateXnftParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "creators";
            type: {
              vec: {
                defined: "CreatorsParam";
              };
            };
          },
          {
            name: "curator";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "installAuthority";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "installPrice";
            type: "u64";
          },
          {
            name: "installVault";
            type: "publicKey";
          },
          {
            name: "sellerFeeBasisPoints";
            type: "u16";
          },
          {
            name: "supply";
            type: {
              option: "u64";
            };
          },
          {
            name: "symbol";
            type: "string";
          },
          {
            name: "tag";
            type: {
              defined: "Tag";
            };
          },
          {
            name: "uri";
            type: "string";
          }
        ];
      };
    },
    {
      name: "UpdateParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "installAuthority";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "installPrice";
            type: "u64";
          },
          {
            name: "installVault";
            type: "publicKey";
          },
          {
            name: "name";
            type: {
              option: "string";
            };
          },
          {
            name: "supply";
            type: {
              option: "u64";
            };
          },
          {
            name: "tag";
            type: {
              defined: "Tag";
            };
          },
          {
            name: "uri";
            type: {
              option: "string";
            };
          }
        ];
      };
    },
    {
      name: "CuratorStatus";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pubkey";
            docs: ["The pubkey of the `Curator` program account (32)."];
            type: "publicKey";
          },
          {
            name: "verified";
            docs: [
              "Whether the curator's authority has verified the assignment (1)."
            ];
            type: "bool";
          }
        ];
      };
    },
    {
      name: "Kind";
      type: {
        kind: "enum";
        variants: [
          {
            name: "App";
          },
          {
            name: "Collectible";
          }
        ];
      };
    },
    {
      name: "Tag";
      type: {
        kind: "enum";
        variants: [
          {
            name: "None";
          },
          {
            name: "Defi";
          },
          {
            name: "Game";
          },
          {
            name: "Nfts";
          }
        ];
      };
    }
  ];
  events: [
    {
      name: "AccessGranted";
      fields: [
        {
          name: "wallet";
          type: "publicKey";
          index: false;
        },
        {
          name: "xnft";
          type: "publicKey";
          index: false;
        }
      ];
    },
    {
      name: "InstallationCreated";
      fields: [
        {
          name: "installer";
          type: "publicKey";
          index: false;
        },
        {
          name: "xnft";
          type: "publicKey";
          index: false;
        }
      ];
    },
    {
      name: "ReviewCreated";
      fields: [
        {
          name: "author";
          type: "publicKey";
          index: false;
        },
        {
          name: "rating";
          type: "u8";
          index: false;
        },
        {
          name: "xnft";
          type: "publicKey";
          index: false;
        }
      ];
    },
    {
      name: "XnftUpdated";
      fields: [
        {
          name: "xnft";
          type: "publicKey";
          index: false;
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "CannotReviewOwned";
      msg: "You cannot create a review for an xNFT that you currently own or published";
    },
    {
      code: 6001;
      name: "CuratorAlreadySet";
      msg: "There is already a verified curator assigned";
    },
    {
      code: 6002;
      name: "CuratorAuthorityMismatch";
      msg: "The expected curator authority did not match expected";
    },
    {
      code: 6003;
      name: "CuratorMismatch";
      msg: "The provided curator account did not match the one assigned";
    },
    {
      code: 6004;
      name: "InstallAuthorityMismatch";
      msg: "The provided xNFT install authority did not match";
    },
    {
      code: 6005;
      name: "InstallExceedsSupply";
      msg: "The max supply has been reached for the xNFT";
    },
    {
      code: 6006;
      name: "InstallOwnerMismatch";
      msg: "The asserted authority/owner did not match that of the Install account";
    },
    {
      code: 6007;
      name: "MetadataIsImmutable";
      msg: "The metadata of the xNFT is marked as immutable";
    },
    {
      code: 6008;
      name: "MustBeApp";
      msg: "The xNFT must be of `Kind::App` for this operation";
    },
    {
      code: 6009;
      name: "RatingOutOfBounds";
      msg: "The rating for a review must be between 0 and 5";
    },
    {
      code: 6010;
      name: "ReviewInstallMismatch";
      msg: "The installation provided for the review does not match the xNFT";
    },
    {
      code: 6011;
      name: "SupplyReduction";
      msg: "Updated supply is less than the original supply set on creation";
    },
    {
      code: 6012;
      name: "SuspendedInstallation";
      msg: "Attempting to install a currently suspended xNFT";
    },
    {
      code: 6013;
      name: "UnauthorizedInstall";
      msg: "The access account provided is not associated with the wallet";
    },
    {
      code: 6014;
      name: "UpdateAuthorityMismatch";
      msg: "The signer did not match the update authority of the metadata account or the owner";
    },
    {
      code: 6015;
      name: "UpdateReviewAuthorityMismatch";
      msg: "The signing authority for the xNFT update did not match the review authority";
    },
    {
      code: 6016;
      name: "UriExceedsMaxLength";
      msg: "The metadata URI provided exceeds the maximum length";
    }
  ];
};

export const IDL: Xnft = {
  version: "0.2.0",
  name: "xnft",
  constants: [
    {
      name: "MAX_RATING",
      type: "u8",
      value: "5",
    },
  ],
  instructions: [
    {
      name: "createAppXnft",
      docs: [
        "Creates all parts of an xNFT instance.",
        'Once this is invoked, an xNFT exists and can be "installed" by users.',
      ],
      accounts: [
        {
          name: "masterMint",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "mint",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "publisher",
              },
              {
                kind: "arg",
                type: "string",
                path: "name",
              },
            ],
          },
        },
        {
          name: "masterToken",
          isMut: true,
          isSigner: false,
        },
        {
          name: "masterMetadata",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "metadata",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "metadata_program",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Mint",
                path: "master_mint",
              },
            ],
            programId: {
              kind: "account",
              type: "publicKey",
              path: "metadata_program",
            },
          },
        },
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "xnft",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Mint",
                path: "master_mint",
              },
            ],
          },
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "publisher",
          isMut: false,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "name",
          type: "string",
        },
        {
          name: "params",
          type: {
            defined: "CreateXnftParams",
          },
        },
      ],
    },
    {
      name: "createCollectibleXnft",
      docs: [
        "Creates an xNFT instance on top of an existing digital collectible that is MPL compliant.",
      ],
      accounts: [
        {
          name: "masterMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "masterToken",
          isMut: false,
          isSigner: false,
        },
        {
          name: "masterMetadata",
          isMut: false,
          isSigner: false,
        },
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "xnft",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Mint",
                path: "master_mint",
              },
            ],
          },
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "publisher",
          isMut: false,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "params",
          type: {
            defined: "CreateXnftParams",
          },
        },
      ],
    },
    {
      name: "createInstall",
      docs: [
        'Creates an "installation" of an xNFT.',
        "Installation is just a synonym for minting an xNFT edition for a given",
        "user.",
      ],
      accounts: [
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
          relations: ["install_vault"],
        },
        {
          name: "installVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "install",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "install",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "target",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Xnft",
                path: "xnft",
              },
            ],
          },
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "target",
          isMut: false,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createPermissionedInstall",
      docs: [
        'Creates an "installation" of a private xNFT through prior access approval',
        "granted by the xNFT's installation authority.",
      ],
      accounts: [
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
          relations: ["install_vault"],
        },
        {
          name: "installVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "install",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "install",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "authority",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Xnft",
                path: "xnft",
              },
            ],
          },
        },
        {
          name: "access",
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "access",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "authority",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Xnft",
                path: "xnft",
              },
            ],
          },
          relations: ["xnft"],
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createReview",
      docs: [
        'Creates a "review" of an xNFT containing a URI to a comment and a 0-5 rating.',
      ],
      accounts: [
        {
          name: "install",
          isMut: false,
          isSigner: false,
          relations: ["xnft"],
        },
        {
          name: "masterToken",
          isMut: false,
          isSigner: false,
        },
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
        },
        {
          name: "review",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "review",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Xnft",
                path: "xnft",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "author",
              },
            ],
          },
        },
        {
          name: "author",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "uri",
          type: "string",
        },
        {
          name: "rating",
          type: "u8",
        },
      ],
    },
    {
      name: "deleteInstall",
      docs: ["Closes the install account."],
      accounts: [
        {
          name: "install",
          isMut: true,
          isSigner: false,
          relations: ["authority"],
        },
        {
          name: "receiver",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "deleteReview",
      docs: [
        "Closes the review account and removes metrics from xNFT account.",
      ],
      accounts: [
        {
          name: "review",
          isMut: true,
          isSigner: false,
          relations: ["author", "xnft"],
        },
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
        },
        {
          name: "receiver",
          isMut: true,
          isSigner: false,
        },
        {
          name: "author",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "grantAccess",
      docs: [
        "Creates an access program account that indicates a wallet's",
        "access permission to install a private xNFT.",
      ],
      accounts: [
        {
          name: "xnft",
          isMut: false,
          isSigner: false,
        },
        {
          name: "wallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "access",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "access",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "wallet",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Xnft",
                path: "xnft",
              },
            ],
          },
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "revokeAccess",
      docs: [
        "Closes the access program account for a given wallet on a private xNFT,",
        "effectively revoking their permission to create installations of the xNFT.",
      ],
      accounts: [
        {
          name: "xnft",
          isMut: false,
          isSigner: false,
        },
        {
          name: "wallet",
          isMut: false,
          isSigner: false,
        },
        {
          name: "access",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "access",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "wallet",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Xnft",
                path: "xnft",
              },
            ],
          },
          relations: ["wallet", "xnft"],
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "setCurator",
      docs: ["Assigns a curator public key to the provided xNFT."],
      accounts: [
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
        },
        {
          name: "masterToken",
          isMut: false,
          isSigner: false,
        },
        {
          name: "curator",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "setSuspended",
      docs: ["Sets the install suspension flag on the xnft."],
      accounts: [
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
        },
        {
          name: "masterToken",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "flag",
          type: "bool",
        },
      ],
    },
    {
      name: "transfer",
      docs: ["Transfer the xNFT to the provided designation wallet."],
      accounts: [
        {
          name: "xnft",
          isMut: false,
          isSigner: false,
          relations: ["master_mint"],
        },
        {
          name: "source",
          isMut: true,
          isSigner: false,
        },
        {
          name: "destination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "masterMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "recipient",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "updateXnft",
      docs: [
        "Updates the code of an xNFT.",
        "This is simply a token metadata update cpi.",
      ],
      accounts: [
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
          relations: ["master_metadata"],
        },
        {
          name: "masterToken",
          isMut: false,
          isSigner: false,
        },
        {
          name: "masterMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "curationAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "updater",
          isMut: false,
          isSigner: true,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "updates",
          type: {
            defined: "UpdateParams",
          },
        },
      ],
    },
    {
      name: "verifyCurator",
      docs: [
        "Verifies the assignment of a curator to an xNFT, signed by the curator authority.",
      ],
      accounts: [
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
        },
        {
          name: "curator",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "access",
      type: {
        kind: "struct",
        fields: [
          {
            name: "wallet",
            docs: ["The pubkey of the wallet being granted access (32)."],
            type: "publicKey",
          },
          {
            name: "xnft",
            docs: ["The pubkey of the xNFT account that is access gated (32)."],
            type: "publicKey",
          },
          {
            name: "bump",
            docs: ["Bump nonce of the PDA (1)."],
            type: "u8",
          },
          {
            name: "reserved",
            docs: ["Unused reserved byte space for additive future changes."],
            type: {
              array: ["u8", 32],
            },
          },
        ],
      },
    },
    {
      name: "install",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            docs: ["The authority who created the installation (32)."],
            type: "publicKey",
          },
          {
            name: "xnft",
            docs: ["The pubkey of the xNFT that was installed (32)."],
            type: "publicKey",
          },
          {
            name: "masterMetadata",
            docs: ["The pubkey of the MPL master metadata account (32)."],
            type: "publicKey",
          },
          {
            name: "edition",
            docs: ["The sequential installation number of the xNFT (8)."],
            type: "u64",
          },
          {
            name: "reserved",
            docs: ["Unused reserved byte space for additive future changes."],
            type: {
              array: ["u8", 64],
            },
          },
        ],
      },
    },
    {
      name: "review",
      type: {
        kind: "struct",
        fields: [
          {
            name: "author",
            docs: ["The pubkey of the account that created the review (32)."],
            type: "publicKey",
          },
          {
            name: "xnft",
            docs: ["The pubkey of the associated xNFT (32)."],
            type: "publicKey",
          },
          {
            name: "rating",
            docs: ["The numerical rating for the review, 0-5 (1)."],
            type: "u8",
          },
          {
            name: "uri",
            docs: [
              "The URI of the off-chain JSON data that holds the comment (4 + len).",
            ],
            type: "string",
          },
          {
            name: "reserved",
            docs: ["Unused reserved byte space for future additive changes."],
            type: {
              array: ["u8", 32],
            },
          },
        ],
      },
    },
    {
      name: "xnft",
      type: {
        kind: "struct",
        fields: [
          {
            name: "publisher",
            docs: ["The pubkey of the original xNFT creator (32)."],
            type: "publicKey",
          },
          {
            name: "installVault",
            docs: [
              "The pubkey of the account to receive install payments (32).",
            ],
            type: "publicKey",
          },
          {
            name: "masterMetadata",
            docs: ["The pubkey of the MPL master metadata account (32)."],
            type: "publicKey",
          },
          {
            name: "masterMint",
            docs: ["The pubkey of the master token mint (32)."],
            type: "publicKey",
          },
          {
            name: "installAuthority",
            docs: [
              "The optional pubkey of the xNFT installation authority (33).",
            ],
            type: {
              option: "publicKey",
            },
          },
          {
            name: "curator",
            docs: [
              "Optional pubkey of the global authority required for reviewing xNFT updates (34).",
            ],
            type: {
              option: {
                defined: "CuratorStatus",
              },
            },
          },
          {
            name: "uri",
            docs: [
              "The URI of the custom metadata blob for the xNFT (4 + mpl_token_metadata::state::MAX_URI_LENGTH).",
            ],
            type: "string",
          },
          {
            name: "mintSeedName",
            docs: [
              "The original name used to seed the master mint if it was a standalone (1 + 4 + mpl_token_metadata::state::MAX_NAME_LENGTH).",
            ],
            type: {
              option: "string",
            },
          },
          {
            name: "kind",
            docs: ["The `Kind` enum variant describing the type of xNFT (1)."],
            type: {
              defined: "Kind",
            },
          },
          {
            name: "tag",
            docs: [
              "The `Tag` enum variant to assign the category of xNFT (1).",
            ],
            type: {
              defined: "Tag",
            },
          },
          {
            name: "supply",
            docs: [
              "The optional finite supply of installations available for this xNFT (9).",
            ],
            type: {
              option: "u64",
            },
          },
          {
            name: "totalInstalls",
            docs: [
              "Total amount of install accounts that have been created for this xNFT (8).",
            ],
            type: "u64",
          },
          {
            name: "installPrice",
            docs: ["The price-per-install of this xNFT (8)."],
            type: "u64",
          },
          {
            name: "createdTs",
            docs: ["The unix timestamp of when the account was created (8)."],
            type: "i64",
          },
          {
            name: "updatedTs",
            docs: [
              "The unix timestamp of the last time the account was updated (8).",
            ],
            type: "i64",
          },
          {
            name: "totalRating",
            docs: ["The total cumulative rating value of all reviews (8)."],
            type: "u64",
          },
          {
            name: "numRatings",
            docs: [
              "The number of ratings created used to calculate the average (4).",
            ],
            type: "u32",
          },
          {
            name: "suspended",
            docs: [
              "Flag to determine whether new installations of the xNFT should be halted (1).",
            ],
            type: "bool",
          },
          {
            name: "bump",
            docs: ["The bump nonce for the xNFT's PDA (1)."],
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "reserved0",
            docs: ["Unused reserved byte space for additive future changes."],
            type: {
              array: ["u8", 64],
            },
          },
          {
            name: "reserved1",
            type: {
              array: ["u8", 24],
            },
          },
          {
            name: "reserved2",
            type: {
              array: ["u8", 9],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "CreatorsParam",
      type: {
        kind: "struct",
        fields: [
          {
            name: "address",
            type: "publicKey",
          },
          {
            name: "share",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "CreateXnftParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "creators",
            type: {
              vec: {
                defined: "CreatorsParam",
              },
            },
          },
          {
            name: "curator",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "installAuthority",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "installPrice",
            type: "u64",
          },
          {
            name: "installVault",
            type: "publicKey",
          },
          {
            name: "sellerFeeBasisPoints",
            type: "u16",
          },
          {
            name: "supply",
            type: {
              option: "u64",
            },
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "tag",
            type: {
              defined: "Tag",
            },
          },
          {
            name: "uri",
            type: "string",
          },
        ],
      },
    },
    {
      name: "UpdateParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "installAuthority",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "installPrice",
            type: "u64",
          },
          {
            name: "installVault",
            type: "publicKey",
          },
          {
            name: "name",
            type: {
              option: "string",
            },
          },
          {
            name: "supply",
            type: {
              option: "u64",
            },
          },
          {
            name: "tag",
            type: {
              defined: "Tag",
            },
          },
          {
            name: "uri",
            type: {
              option: "string",
            },
          },
        ],
      },
    },
    {
      name: "CuratorStatus",
      type: {
        kind: "struct",
        fields: [
          {
            name: "pubkey",
            docs: ["The pubkey of the `Curator` program account (32)."],
            type: "publicKey",
          },
          {
            name: "verified",
            docs: [
              "Whether the curator's authority has verified the assignment (1).",
            ],
            type: "bool",
          },
        ],
      },
    },
    {
      name: "Kind",
      type: {
        kind: "enum",
        variants: [
          {
            name: "App",
          },
          {
            name: "Collectible",
          },
        ],
      },
    },
    {
      name: "Tag",
      type: {
        kind: "enum",
        variants: [
          {
            name: "None",
          },
          {
            name: "Defi",
          },
          {
            name: "Game",
          },
          {
            name: "Nfts",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "AccessGranted",
      fields: [
        {
          name: "wallet",
          type: "publicKey",
          index: false,
        },
        {
          name: "xnft",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "InstallationCreated",
      fields: [
        {
          name: "installer",
          type: "publicKey",
          index: false,
        },
        {
          name: "xnft",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "ReviewCreated",
      fields: [
        {
          name: "author",
          type: "publicKey",
          index: false,
        },
        {
          name: "rating",
          type: "u8",
          index: false,
        },
        {
          name: "xnft",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "XnftUpdated",
      fields: [
        {
          name: "xnft",
          type: "publicKey",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "CannotReviewOwned",
      msg: "You cannot create a review for an xNFT that you currently own or published",
    },
    {
      code: 6001,
      name: "CuratorAlreadySet",
      msg: "There is already a verified curator assigned",
    },
    {
      code: 6002,
      name: "CuratorAuthorityMismatch",
      msg: "The expected curator authority did not match expected",
    },
    {
      code: 6003,
      name: "CuratorMismatch",
      msg: "The provided curator account did not match the one assigned",
    },
    {
      code: 6004,
      name: "InstallAuthorityMismatch",
      msg: "The provided xNFT install authority did not match",
    },
    {
      code: 6005,
      name: "InstallExceedsSupply",
      msg: "The max supply has been reached for the xNFT",
    },
    {
      code: 6006,
      name: "InstallOwnerMismatch",
      msg: "The asserted authority/owner did not match that of the Install account",
    },
    {
      code: 6007,
      name: "MetadataIsImmutable",
      msg: "The metadata of the xNFT is marked as immutable",
    },
    {
      code: 6008,
      name: "MustBeApp",
      msg: "The xNFT must be of `Kind::App` for this operation",
    },
    {
      code: 6009,
      name: "RatingOutOfBounds",
      msg: "The rating for a review must be between 0 and 5",
    },
    {
      code: 6010,
      name: "ReviewInstallMismatch",
      msg: "The installation provided for the review does not match the xNFT",
    },
    {
      code: 6011,
      name: "SupplyReduction",
      msg: "Updated supply is less than the original supply set on creation",
    },
    {
      code: 6012,
      name: "SuspendedInstallation",
      msg: "Attempting to install a currently suspended xNFT",
    },
    {
      code: 6013,
      name: "UnauthorizedInstall",
      msg: "The access account provided is not associated with the wallet",
    },
    {
      code: 6014,
      name: "UpdateAuthorityMismatch",
      msg: "The signer did not match the update authority of the metadata account or the owner",
    },
    {
      code: 6015,
      name: "UpdateReviewAuthorityMismatch",
      msg: "The signing authority for the xNFT update did not match the review authority",
    },
    {
      code: 6016,
      name: "UriExceedsMaxLength",
      msg: "The metadata URI provided exceeds the maximum length",
    },
  ],
};
