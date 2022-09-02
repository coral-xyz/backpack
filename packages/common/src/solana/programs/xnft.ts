import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import type { Provider } from "@project-serum/anchor";
import { metadata } from "@project-serum/token";

export const XNFT_PROGRAM_ID = new PublicKey(
  "BdbULx4sJSeLJzvR6h6QxL4fUPJAJw86qmwwXt6jBfXd"
);

export async function fetchXnfts(
  provider: Provider,
  wallet: PublicKey
): Promise<Array<{ publicKey: PublicKey; medtadata: any; metadataBlob: any }>> {
  const client = xnftClient(provider);

  //
  // Fetch all xnfts installed by this user.
  //
  const xnftInstalls = await client.account.install.all([
    {
      memcmp: {
        offset: 8, // Discriminator
        bytes: wallet.toString(),
      },
    },
  ]);

  //
  // Get the metadata accounts for all xnfts.
  //
  const metadataPubkeys = xnftInstalls.map(
    ({ account }) => account.masterMetadata
  );
  const xnftMetadata = (
    await anchor.utils.rpc.getMultipleAccounts(
      provider.connection,
      metadataPubkeys
    )
  ).map((t) => {
    if (!t) {
      return null;
    }
    return metadata.decodeMetadata(t.account.data);
  });

  //
  // Fetch the metadata uri blob.
  //
  const xnftMetadataBlob = await Promise.all(
    xnftMetadata.map((m) => {
      if (!m) {
        return null;
      }
      return fetch(m.data.uri).then((r) => r.json());
    })
  );

  //
  // Combine it all into a single list.
  //
  const xnfts = [] as any;
  metadataPubkeys.forEach((metadataPublicKey, idx) => {
    xnfts.push({
      metadataPublicKey,
      metadata: xnftMetadata[idx],
      metadataBlob: xnftMetadataBlob[idx],
      install: xnftInstalls[idx],
    });
  });

  return xnfts;
}

export async function fetchXnft(
  provider: Provider,
  xnft: PublicKey
): Promise<{ metadataPublicKey: any; metadata: any; metadataBlob: any }> {
  const client = xnftClient(provider);
  const xnftAccount = await client.account.xnft.fetch(xnft);

  const metadataPublicKey = xnftAccount.masterMetadata;
  const xnftMetadata = await (async () => {
    const info = await provider.connection.getAccountInfo(metadataPublicKey);
    if (!info) {
      throw new Error("account info not found");
    }
    return metadata.decodeMetadata(info.data);
  })();

  const xnftMetadataBlob = await fetch(xnftMetadata.data.uri).then((r) =>
    r.json()
  );
  return {
    metadataPublicKey,
    metadata: xnftMetadata,
    metadataBlob: xnftMetadataBlob,
  };
}

export function xnftClient(provider: Provider): Program<Xnft> {
  return new Program<Xnft>(IDL, XNFT_PROGRAM_ID, provider);
}

type Xnft = {
  version: "0.1.0";
  name: "xnft";
  instructions: [
    {
      name: "createXnft";
      docs: [
        "Creates all parts of an xNFT instance.",
        "",
        "* Master mint (supply 1).",
        "* Master token.",
        "* Master metadata PDA associated with the master mint.",
        "* Master edition PDA associated with the master mint.",
        "* xNFT PDA associated with the master edition.",
        "",
        'Once this is invoked, an xNFT exists and can be "installed" by users.'
      ];
      accounts: [
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
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
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "token";
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
          name: "masterMetadata";
          isMut: true;
          isSigner: false;
          docs: ["metadata program."];
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
          name: "masterEdition";
          isMut: true;
          isSigner: false;
          docs: ["metadata program."];
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
              },
              {
                kind: "const";
                type: "string";
                value: "edition";
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
                path: "master_edition";
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
          name: "rent";
          isMut: false;
          isSigner: false;
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
        }
      ];
      args: [
        {
          name: "name";
          type: "string";
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
          name: "kind";
          type: {
            defined: "Kind";
          };
        },
        {
          name: "uri";
          type: "string";
        },
        {
          name: "sellerFeeBasisPoints";
          type: "u16";
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
          name: "supply";
          type: {
            option: "u64";
          };
        }
      ];
    },
    {
      name: "updateXnft";
      docs: [
        "Updates the code of an xNFT.",
        "",
        "This is simply a token metadata update cpi."
      ];
      accounts: [
        {
          name: "xnft";
          isMut: true;
          isSigner: false;
        },
        {
          name: "masterMetadata";
          isMut: true;
          isSigner: false;
        },
        {
          name: "authority";
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
      name: "createInstall";
      docs: [
        'Creates an "installation" of an xNFT.',
        "",
        "Installation is just a synonym for minting an xNFT edition for a given",
        "user."
      ];
      accounts: [
        {
          name: "xnft";
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
          name: "installVault";
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
        }
      ];
      args: [];
    },
    {
      name: "createInstallWithAuthority";
      docs: [
        "Variant of `create_xnft_installation` where the install authority is",
        "required to sign."
      ];
      accounts: [
        {
          name: "xnft";
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
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "installAuthority";
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
      name: "deleteInstall";
      docs: ["Closes the install account."];
      accounts: [
        {
          name: "install";
          isMut: true;
          isSigner: false;
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
      name: "setSuspended";
      docs: ["Sets the install suspension flag on the xnft."];
      accounts: [
        {
          name: "xnft";
          isMut: true;
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
    }
  ];
  accounts: [
    {
      name: "xnft";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "publisher";
            type: "publicKey";
          },
          {
            name: "installVault";
            type: "publicKey";
          },
          {
            name: "masterEdition";
            type: "publicKey";
          },
          {
            name: "masterMetadata";
            type: "publicKey";
          },
          {
            name: "masterMint";
            type: "publicKey";
          },
          {
            name: "installAuthority";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "kind";
            type: {
              defined: "Kind";
            };
          },
          {
            name: "tag";
            type: {
              defined: "Tag";
            };
          },
          {
            name: "name";
            type: "string";
          },
          {
            name: "totalInstalls";
            type: "u64";
          },
          {
            name: "installPrice";
            type: "u64";
          },
          {
            name: "createdTs";
            type: "i64";
          },
          {
            name: "updatedTs";
            type: "i64";
          },
          {
            name: "suspended";
            type: "bool";
          },
          {
            name: "reserved";
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
            type: "publicKey";
          },
          {
            name: "xnft";
            type: "publicKey";
          },
          {
            name: "masterMetadata";
            type: "publicKey";
          },
          {
            name: "id";
            type: "u64";
          },
          {
            name: "reserved";
            type: {
              array: ["u8", 64];
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "UpdateParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "installVault";
            type: {
              option: "publicKey";
            };
          },
          {
            name: "price";
            type: {
              option: "u64";
            };
          },
          {
            name: "tag";
            type: {
              option: {
                defined: "Tag";
              };
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
      name: "Kind";
      type: {
        kind: "enum";
        variants: [
          {
            name: "App";
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
            name: "Nft";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "NameTooLong";
      msg: "The name provided for creating the xNFT exceeded the byte limit";
    },
    {
      code: 6001;
      name: "SuspendedInstallation";
      msg: "Attempting to install a currently suspended xNFT";
    }
  ];
};

const IDL: Xnft = {
  version: "0.1.0",
  name: "xnft",
  instructions: [
    {
      name: "createXnft",
      docs: [
        "Creates all parts of an xNFT instance.",
        "",
        "* Master mint (supply 1).",
        "* Master token.",
        "* Master metadata PDA associated with the master mint.",
        "* Master edition PDA associated with the master mint.",
        "* xNFT PDA associated with the master edition.",
        "",
        'Once this is invoked, an xNFT exists and can be "installed" by users.',
      ],
      accounts: [
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
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
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "token",
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
          name: "masterMetadata",
          isMut: true,
          isSigner: false,
          docs: ["metadata program."],
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
          name: "masterEdition",
          isMut: true,
          isSigner: false,
          docs: ["metadata program."],
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
              {
                kind: "const",
                type: "string",
                value: "edition",
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
                path: "master_edition",
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
          name: "rent",
          isMut: false,
          isSigner: false,
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
      ],
      args: [
        {
          name: "name",
          type: "string",
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
          name: "kind",
          type: {
            defined: "Kind",
          },
        },
        {
          name: "uri",
          type: "string",
        },
        {
          name: "sellerFeeBasisPoints",
          type: "u16",
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
          name: "supply",
          type: {
            option: "u64",
          },
        },
      ],
    },
    {
      name: "updateXnft",
      docs: [
        "Updates the code of an xNFT.",
        "",
        "This is simply a token metadata update cpi.",
      ],
      accounts: [
        {
          name: "xnft",
          isMut: true,
          isSigner: false,
        },
        {
          name: "masterMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authority",
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
      name: "createInstall",
      docs: [
        'Creates an "installation" of an xNFT.',
        "",
        "Installation is just a synonym for minting an xNFT edition for a given",
        "user.",
      ],
      accounts: [
        {
          name: "xnft",
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
          name: "installVault",
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
      ],
      args: [],
    },
    {
      name: "createInstallWithAuthority",
      docs: [
        "Variant of `create_xnft_installation` where the install authority is",
        "required to sign.",
      ],
      accounts: [
        {
          name: "xnft",
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
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "installAuthority",
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
      name: "deleteInstall",
      docs: ["Closes the install account."],
      accounts: [
        {
          name: "install",
          isMut: true,
          isSigner: false,
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
      name: "setSuspended",
      docs: ["Sets the install suspension flag on the xnft."],
      accounts: [
        {
          name: "xnft",
          isMut: true,
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
  ],
  accounts: [
    {
      name: "xnft",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "publisher",
            type: "publicKey",
          },
          {
            name: "installVault",
            type: "publicKey",
          },
          {
            name: "masterEdition",
            type: "publicKey",
          },
          {
            name: "masterMetadata",
            type: "publicKey",
          },
          {
            name: "masterMint",
            type: "publicKey",
          },
          {
            name: "installAuthority",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "kind",
            type: {
              defined: "Kind",
            },
          },
          {
            name: "tag",
            type: {
              defined: "Tag",
            },
          },
          {
            name: "name",
            type: "string",
          },
          {
            name: "totalInstalls",
            type: "u64",
          },
          {
            name: "installPrice",
            type: "u64",
          },
          {
            name: "createdTs",
            type: "i64",
          },
          {
            name: "updatedTs",
            type: "i64",
          },
          {
            name: "suspended",
            type: "bool",
          },
          {
            name: "reserved",
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
            type: "publicKey",
          },
          {
            name: "xnft",
            type: "publicKey",
          },
          {
            name: "masterMetadata",
            type: "publicKey",
          },
          {
            name: "id",
            type: "u64",
          },
          {
            name: "reserved",
            type: {
              array: ["u8", 64],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "UpdateParams",
      type: {
        kind: "struct",
        fields: [
          {
            name: "installVault",
            type: {
              option: "publicKey",
            },
          },
          {
            name: "price",
            type: {
              option: "u64",
            },
          },
          {
            name: "tag",
            type: {
              option: {
                defined: "Tag",
              },
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
      name: "Kind",
      type: {
        kind: "enum",
        variants: [
          {
            name: "App",
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
            name: "Nft",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "NameTooLong",
      msg: "The name provided for creating the xNFT exceeded the byte limit",
    },
    {
      code: 6001,
      name: "SuspendedInstallation",
      msg: "Attempting to install a currently suspended xNFT",
    },
  ],
};
