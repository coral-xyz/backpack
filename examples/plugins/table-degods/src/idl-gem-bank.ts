export type GemBank = {
  version: "0.0.0";
  name: "gem_bank";
  instructions: [
    {
      name: "initBank";
      accounts: [
        {
          name: "bank";
          isMut: true;
          isSigner: true;
        },
        {
          name: "bankManager";
          isMut: false;
          isSigner: true;
        },
        {
          name: "payer";
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
      name: "setBankFlags";
      accounts: [
        {
          name: "bank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bankManager";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "flags";
          type: "u32";
        }
      ];
    },
    {
      name: "initVault";
      accounts: [
        {
          name: "bank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "creator";
          isMut: false;
          isSigner: true;
        },
        {
          name: "payer";
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
          name: "bump";
          type: "u8";
        },
        {
          name: "owner";
          type: "publicKey";
        },
        {
          name: "name";
          type: "string";
        }
      ];
    },
    {
      name: "setVaultLock";
      accounts: [
        {
          name: "bank";
          isMut: false;
          isSigner: false;
        },
        {
          name: "bankManager";
          isMut: false;
          isSigner: true;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "vaultLock";
          type: "bool";
        }
      ];
    },
    {
      name: "updateVaultOwner";
      accounts: [
        {
          name: "bank";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "newOwner";
          type: "publicKey";
        }
      ];
    },
    {
      name: "depositGem";
      accounts: [
        {
          name: "bank";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "authority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "gemBox";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gemDepositReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gemSource";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gemMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "gemRarity";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
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
          name: "bumpAuth";
          type: "u8";
        },
        {
          name: "bumpGemBox";
          type: "u8";
        },
        {
          name: "bumpGdr";
          type: "u8";
        },
        {
          name: "bumpRarity";
          type: "u8";
        },
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "withdrawGem";
      accounts: [
        {
          name: "bank";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "owner";
          isMut: true;
          isSigner: true;
        },
        {
          name: "authority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "gemBox";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gemDepositReceipt";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gemDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gemMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "gemRarity";
          isMut: false;
          isSigner: false;
        },
        {
          name: "receiver";
          isMut: true;
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
          name: "bumpAuth";
          type: "u8";
        },
        {
          name: "bumpGemBox";
          type: "u8";
        },
        {
          name: "bumpGdr";
          type: "u8";
        },
        {
          name: "bumpRarity";
          type: "u8";
        },
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "addToWhitelist";
      accounts: [
        {
          name: "bank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bankManager";
          isMut: false;
          isSigner: true;
        },
        {
          name: "addressToWhitelist";
          isMut: false;
          isSigner: false;
        },
        {
          name: "whitelistProof";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
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
          name: "bump";
          type: "u8";
        },
        {
          name: "whitelistType";
          type: "u8";
        }
      ];
    },
    {
      name: "removeFromWhitelist";
      accounts: [
        {
          name: "bank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bankManager";
          isMut: true;
          isSigner: true;
        },
        {
          name: "addressToRemove";
          isMut: false;
          isSigner: false;
        },
        {
          name: "whitelistProof";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "bump";
          type: "u8";
        }
      ];
    },
    {
      name: "updateBankManager";
      accounts: [
        {
          name: "bank";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bankManager";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "newManager";
          type: "publicKey";
        }
      ];
    },
    {
      name: "recordRarityPoints";
      accounts: [
        {
          name: "bank";
          isMut: false;
          isSigner: false;
        },
        {
          name: "bankManager";
          isMut: false;
          isSigner: true;
        },
        {
          name: "payer";
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
          name: "rarityConfigs";
          type: {
            vec: {
              defined: "RarityConfig";
            };
          };
        }
      ];
    }
  ];
  accounts: [
    {
      name: "bank";
      type: {
        kind: "struct";
        fields: [
          {
            name: "version";
            type: "u16";
          },
          {
            name: "bankManager";
            type: "publicKey";
          },
          {
            name: "flags";
            type: "u32";
          },
          {
            name: "whitelistedCreators";
            type: "u32";
          },
          {
            name: "whitelistedMints";
            type: "u32";
          },
          {
            name: "vaultCount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "gemDepositReceipt";
      type: {
        kind: "struct";
        fields: [
          {
            name: "vault";
            type: "publicKey";
          },
          {
            name: "gemBoxAddress";
            type: "publicKey";
          },
          {
            name: "gemMint";
            type: "publicKey";
          },
          {
            name: "gemCount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "rarity";
      type: {
        kind: "struct";
        fields: [
          {
            name: "points";
            type: "u16";
          }
        ];
      };
    },
    {
      name: "vault";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bank";
            type: "publicKey";
          },
          {
            name: "owner";
            type: "publicKey";
          },
          {
            name: "creator";
            type: "publicKey";
          },
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "authoritySeed";
            type: "publicKey";
          },
          {
            name: "authorityBumpSeed";
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "locked";
            type: "bool";
          },
          {
            name: "name";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "gemBoxCount";
            type: "u64";
          },
          {
            name: "gemCount";
            type: "u64";
          },
          {
            name: "rarityPoints";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "whitelistProof";
      type: {
        kind: "struct";
        fields: [
          {
            name: "whitelistType";
            type: "u8";
          },
          {
            name: "whitelistedAddress";
            type: "publicKey";
          },
          {
            name: "bank";
            type: "publicKey";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "RarityConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "rarityPoints";
            type: "u16";
          }
        ];
      };
    }
  ];
};

export const IDL: GemBank = {
  version: "0.0.0",
  name: "gem_bank",
  instructions: [
    {
      name: "initBank",
      accounts: [
        {
          name: "bank",
          isMut: true,
          isSigner: true,
        },
        {
          name: "bankManager",
          isMut: false,
          isSigner: true,
        },
        {
          name: "payer",
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
      name: "setBankFlags",
      accounts: [
        {
          name: "bank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bankManager",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "flags",
          type: "u32",
        },
      ],
    },
    {
      name: "initVault",
      accounts: [
        {
          name: "bank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creator",
          isMut: false,
          isSigner: true,
        },
        {
          name: "payer",
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
          name: "bump",
          type: "u8",
        },
        {
          name: "owner",
          type: "publicKey",
        },
        {
          name: "name",
          type: "string",
        },
      ],
    },
    {
      name: "setVaultLock",
      accounts: [
        {
          name: "bank",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bankManager",
          isMut: false,
          isSigner: true,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "vaultLock",
          type: "bool",
        },
      ],
    },
    {
      name: "updateVaultOwner",
      accounts: [
        {
          name: "bank",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "newOwner",
          type: "publicKey",
        },
      ],
    },
    {
      name: "depositGem",
      accounts: [
        {
          name: "bank",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "gemBox",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gemDepositReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gemSource",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gemMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "gemRarity",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
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
          name: "bumpAuth",
          type: "u8",
        },
        {
          name: "bumpGemBox",
          type: "u8",
        },
        {
          name: "bumpGdr",
          type: "u8",
        },
        {
          name: "bumpRarity",
          type: "u8",
        },
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "withdrawGem",
      accounts: [
        {
          name: "bank",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "gemBox",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gemDepositReceipt",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gemDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gemMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "gemRarity",
          isMut: false,
          isSigner: false,
        },
        {
          name: "receiver",
          isMut: true,
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
          name: "bumpAuth",
          type: "u8",
        },
        {
          name: "bumpGemBox",
          type: "u8",
        },
        {
          name: "bumpGdr",
          type: "u8",
        },
        {
          name: "bumpRarity",
          type: "u8",
        },
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "addToWhitelist",
      accounts: [
        {
          name: "bank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bankManager",
          isMut: false,
          isSigner: true,
        },
        {
          name: "addressToWhitelist",
          isMut: false,
          isSigner: false,
        },
        {
          name: "whitelistProof",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
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
          name: "bump",
          type: "u8",
        },
        {
          name: "whitelistType",
          type: "u8",
        },
      ],
    },
    {
      name: "removeFromWhitelist",
      accounts: [
        {
          name: "bank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bankManager",
          isMut: true,
          isSigner: true,
        },
        {
          name: "addressToRemove",
          isMut: false,
          isSigner: false,
        },
        {
          name: "whitelistProof",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "bump",
          type: "u8",
        },
      ],
    },
    {
      name: "updateBankManager",
      accounts: [
        {
          name: "bank",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bankManager",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "newManager",
          type: "publicKey",
        },
      ],
    },
    {
      name: "recordRarityPoints",
      accounts: [
        {
          name: "bank",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bankManager",
          isMut: false,
          isSigner: true,
        },
        {
          name: "payer",
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
          name: "rarityConfigs",
          type: {
            vec: {
              defined: "RarityConfig",
            },
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: "bank",
      type: {
        kind: "struct",
        fields: [
          {
            name: "version",
            type: "u16",
          },
          {
            name: "bankManager",
            type: "publicKey",
          },
          {
            name: "flags",
            type: "u32",
          },
          {
            name: "whitelistedCreators",
            type: "u32",
          },
          {
            name: "whitelistedMints",
            type: "u32",
          },
          {
            name: "vaultCount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "gemDepositReceipt",
      type: {
        kind: "struct",
        fields: [
          {
            name: "vault",
            type: "publicKey",
          },
          {
            name: "gemBoxAddress",
            type: "publicKey",
          },
          {
            name: "gemMint",
            type: "publicKey",
          },
          {
            name: "gemCount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "rarity",
      type: {
        kind: "struct",
        fields: [
          {
            name: "points",
            type: "u16",
          },
        ],
      },
    },
    {
      name: "vault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bank",
            type: "publicKey",
          },
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "creator",
            type: "publicKey",
          },
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "authoritySeed",
            type: "publicKey",
          },
          {
            name: "authorityBumpSeed",
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "locked",
            type: "bool",
          },
          {
            name: "name",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "gemBoxCount",
            type: "u64",
          },
          {
            name: "gemCount",
            type: "u64",
          },
          {
            name: "rarityPoints",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "whitelistProof",
      type: {
        kind: "struct",
        fields: [
          {
            name: "whitelistType",
            type: "u8",
          },
          {
            name: "whitelistedAddress",
            type: "publicKey",
          },
          {
            name: "bank",
            type: "publicKey",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "RarityConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "rarityPoints",
            type: "u16",
          },
        ],
      },
    },
  ],
};
