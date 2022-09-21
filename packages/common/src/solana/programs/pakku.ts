import {
  Program,
  ProgramAccount,
  type IdlAccounts,
  type Provider,
} from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export type PakkuAccount = IdlAccounts<Pakku>["pakku"];
export type TransformAccount = IdlAccounts<Pakku>["transform"];

export const PAKKU_PROGRAM_ID = new PublicKey(
  "Ddgp3LqTon8pZYBVKGiFretGABDbcrsWE3Aou7oNUTPd"
);

export async function fetchPakkus(
  provider: Provider,
  mints: Array<PublicKey>
): Promise<Array<ProgramAccount<PakkuAccount>>> {
  const client = pakkuClient(provider);
  const pakkus: Array<ProgramAccount<PakkuAccount>> = [];

  for await (const m of mints) {
    const accs = await client.account.pakku.all([
      {
        memcmp: {
          offset: 8 + 5,
          bytes: m.toString(),
        },
      },
    ]);

    if (accs.length > 0) {
      pakkus.push(...accs);
    }
  }

  return pakkus;
}

export async function fetchPakku(
  provider: Provider,
  pakku: PublicKey
): Promise<PakkuAccount> {
  const client = pakkuClient(provider);
  return await client.account.pakku.fetch(pakku);
}

export function pakkuClient(provider: Provider): Program<Pakku> {
  return new Program<Pakku>(IDL, PAKKU_PROGRAM_ID, provider);
}

type Pakku = {
  version: "0.1.0";
  name: "pakku";
  instructions: [
    {
      name: "createPakku";
      docs: [
        "Creates a pakku by",
        "",
        "* Copying the NFT into a new one.",
        "* Creating the Pakku account, controlled by the owner of the original,",
        "non-copied NFT.",
        ""
      ];
      accounts: [
        {
          name: "masterToken";
          isMut: false;
          isSigner: false;
        },
        {
          name: "masterMint";
          isMut: false;
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
          name: "pakku";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "pakku";
              },
              {
                kind: "arg";
                type: {
                  array: ["u8", 5];
                };
                path: "id";
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
          name: "transformsList";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "transforms";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Pakku";
                path: "pakku";
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
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
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
          name: "id";
          type: {
            array: ["u8", 5];
          };
        }
      ];
    },
    {
      name: "createTransform";
      docs: ["Creates an empty transform account with a verified creator."];
      accounts: [
        {
          name: "transform";
          isMut: true;
          isSigner: true;
        },
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "creator";
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
          name: "label";
          type: "string";
        }
      ];
    },
    {
      name: "transferTransform";
      docs: ["Transfers the authority of the transform to a new owner."];
      accounts: [
        {
          name: "transform";
          isMut: true;
          isSigner: false;
        },
        {
          name: "newAuthority";
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
      name: "transformForgeRequest";
      docs: ["Asks the transform creator to forge a new pakku update."];
      accounts: [
        {
          name: "transform";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pakku";
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
      name: "forgeTransform";
      docs: [
        "Forges a previously created transform by setting a URI associated with",
        "a mutation ID."
      ];
      accounts: [
        {
          name: "transform";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pakku";
          isMut: false;
          isSigner: false;
        },
        {
          name: "creator";
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
        }
      ];
    },
    {
      name: "applyTransform";
      docs: [
        "Applies the previously forged transform to update a given Pakku."
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
          name: "transform";
          isMut: true;
          isSigner: false;
        },
        {
          name: "pakku";
          isMut: true;
          isSigner: false;
        },
        {
          name: "transformsList";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "transforms";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Pakku";
                path: "pakku";
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
      name: "resetPakku";
      docs: [
        "Rollsback the latest transform, reverting the NFT to the previous state."
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
          name: "pakku";
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
          name: "transformsList";
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: "const";
                type: "string";
                value: "transforms";
              },
              {
                kind: "account";
                type: "publicKey";
                account: "Pakku";
                path: "pakku";
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
          name: "metadataProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "pakku";
      type: {
        kind: "struct";
        fields: [
          {
            name: "id";
            type: {
              array: ["u8", 5];
            };
          },
          {
            name: "masterMint";
            type: "publicKey";
          },
          {
            name: "masterMetadata";
            type: "publicKey";
          },
          {
            name: "transformsList";
            type: "publicKey";
          },
          {
            name: "mutationId";
            type: "u64";
          },
          {
            name: "uri";
            type: "string";
          },
          {
            name: "createdAt";
            type: "i64";
          },
          {
            name: "updatedAt";
            type: "i64";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "reserved";
            type: {
              array: ["u8", 64];
            };
          }
        ];
      };
    },
    {
      name: "transform";
      type: {
        kind: "struct";
        fields: [
          {
            name: "pakku";
            type: "publicKey";
          },
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "creator";
            type: "publicKey";
          },
          {
            name: "label";
            type: "string";
          },
          {
            name: "uri";
            type: "string";
          },
          {
            name: "createdAt";
            type: "i64";
          },
          {
            name: "updatedAt";
            type: "i64";
          },
          {
            name: "mutationId";
            type: "u64";
          },
          {
            name: "used";
            type: "bool";
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
  events: [
    {
      name: "PakkuReset";
      fields: [
        {
          name: "pakku";
          type: "publicKey";
          index: false;
        },
        {
          name: "timestamp";
          type: "i64";
          index: false;
        }
      ];
    },
    {
      name: "TransformApplied";
      fields: [
        {
          name: "pakku";
          type: "publicKey";
          index: false;
        },
        {
          name: "transform";
          type: "publicKey";
          index: false;
        }
      ];
    },
    {
      name: "TransformRequestForged";
      fields: [
        {
          name: "pakku";
          type: "publicKey";
          index: false;
        },
        {
          name: "requester";
          type: "publicKey";
          index: false;
        },
        {
          name: "transform";
          type: "publicKey";
          index: false;
        }
      ];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "NoFreeTransformSlots";
      msg: "Pakku has no free transformation slots remaining";
    },
    {
      code: 6001;
      name: "TransformMutationAlreadySet";
      msg: "The mutation id has already been set on the transform";
    },
    {
      code: 6002;
      name: "TransformPakkuAlreadySet";
      msg: "The pakku public key has already been set on the transform";
    }
  ];
};

const IDL: Pakku = {
  version: "0.1.0",
  name: "pakku",
  instructions: [
    {
      name: "createPakku",
      docs: [
        "Creates a pakku by",
        "",
        "* Copying the NFT into a new one.",
        "* Creating the Pakku account, controlled by the owner of the original,",
        "non-copied NFT.",
        "",
      ],
      accounts: [
        {
          name: "masterToken",
          isMut: false,
          isSigner: false,
        },
        {
          name: "masterMint",
          isMut: false,
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
          name: "pakku",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "pakku",
              },
              {
                kind: "arg",
                type: {
                  array: ["u8", 5],
                },
                path: "id",
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
          name: "transformsList",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "transforms",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Pakku",
                path: "pakku",
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
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
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
          name: "id",
          type: {
            array: ["u8", 5],
          },
        },
      ],
    },
    {
      name: "createTransform",
      docs: ["Creates an empty transform account with a verified creator."],
      accounts: [
        {
          name: "transform",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "creator",
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
          name: "label",
          type: "string",
        },
      ],
    },
    {
      name: "transferTransform",
      docs: ["Transfers the authority of the transform to a new owner."],
      accounts: [
        {
          name: "transform",
          isMut: true,
          isSigner: false,
        },
        {
          name: "newAuthority",
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
      name: "transformForgeRequest",
      docs: ["Asks the transform creator to forge a new pakku update."],
      accounts: [
        {
          name: "transform",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pakku",
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
      name: "forgeTransform",
      docs: [
        "Forges a previously created transform by setting a URI associated with",
        "a mutation ID.",
      ],
      accounts: [
        {
          name: "transform",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pakku",
          isMut: false,
          isSigner: false,
        },
        {
          name: "creator",
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
      ],
    },
    {
      name: "applyTransform",
      docs: [
        "Applies the previously forged transform to update a given Pakku.",
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
          name: "transform",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pakku",
          isMut: true,
          isSigner: false,
        },
        {
          name: "transformsList",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "transforms",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Pakku",
                path: "pakku",
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
      name: "resetPakku",
      docs: [
        "Rollsback the latest transform, reverting the NFT to the previous state.",
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
          name: "pakku",
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
          name: "transformsList",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "transforms",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "Pakku",
                path: "pakku",
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
          name: "metadataProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "pakku",
      type: {
        kind: "struct",
        fields: [
          {
            name: "id",
            type: {
              array: ["u8", 5],
            },
          },
          {
            name: "masterMint",
            type: "publicKey",
          },
          {
            name: "masterMetadata",
            type: "publicKey",
          },
          {
            name: "transformsList",
            type: "publicKey",
          },
          {
            name: "mutationId",
            type: "u64",
          },
          {
            name: "uri",
            type: "string",
          },
          {
            name: "createdAt",
            type: "i64",
          },
          {
            name: "updatedAt",
            type: "i64",
          },
          {
            name: "bump",
            type: "u8",
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
    {
      name: "transform",
      type: {
        kind: "struct",
        fields: [
          {
            name: "pakku",
            type: "publicKey",
          },
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "creator",
            type: "publicKey",
          },
          {
            name: "label",
            type: "string",
          },
          {
            name: "uri",
            type: "string",
          },
          {
            name: "createdAt",
            type: "i64",
          },
          {
            name: "updatedAt",
            type: "i64",
          },
          {
            name: "mutationId",
            type: "u64",
          },
          {
            name: "used",
            type: "bool",
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
  events: [
    {
      name: "PakkuReset",
      fields: [
        {
          name: "pakku",
          type: "publicKey",
          index: false,
        },
        {
          name: "timestamp",
          type: "i64",
          index: false,
        },
      ],
    },
    {
      name: "TransformApplied",
      fields: [
        {
          name: "pakku",
          type: "publicKey",
          index: false,
        },
        {
          name: "transform",
          type: "publicKey",
          index: false,
        },
      ],
    },
    {
      name: "TransformRequestForged",
      fields: [
        {
          name: "pakku",
          type: "publicKey",
          index: false,
        },
        {
          name: "requester",
          type: "publicKey",
          index: false,
        },
        {
          name: "transform",
          type: "publicKey",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "NoFreeTransformSlots",
      msg: "Pakku has no free transformation slots remaining",
    },
    {
      code: 6001,
      name: "TransformMutationAlreadySet",
      msg: "The mutation id has already been set on the transform",
    },
    {
      code: 6002,
      name: "TransformPakkuAlreadySet",
      msg: "The pakku public key has already been set on the transform",
    },
  ],
};
