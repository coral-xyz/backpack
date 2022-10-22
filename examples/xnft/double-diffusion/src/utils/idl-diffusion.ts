export type StableDiffusionMint = {
  "version": "0.1.0",
  "name": "stable_diffusion_mint",
  "instructions": [
    {
      "name": "initializeDiffusion",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stableDiffusion",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "mintDiffusion",
      "accounts": [
        {
          "name": "stableDiffusion",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Authority Wallet"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeUser",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stableDiffusion",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "stableDiffusion",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority"
            ],
            "type": "publicKey"
          },
          {
            "name": "creator",
            "docs": [
              "Creator"
            ],
            "type": "publicKey"
          },
          {
            "name": "counter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "stableDiffusionPda",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "minted",
            "type": "bool"
          },
          {
            "name": "stableDiffusion",
            "type": "publicKey"
          },
          {
            "name": "masterMint",
            "type": "publicKey"
          },
          {
            "name": "masterMetadata",
            "type": "publicKey"
          },
          {
            "name": "masterEdition",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stableDiffusion",
            "docs": [
              "Stable Diffusion"
            ],
            "type": "publicKey"
          },
          {
            "name": "nftsMinted",
            "docs": [
              "Number of assets the user can redeem from the mixer"
            ],
            "type": "u64"
          },
          {
            "name": "costToMint",
            "docs": [
              "Cost To Mint"
            ],
            "type": "u64"
          },
          {
            "name": "nonce",
            "docs": [
              "Nonce"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSigner",
      "msg": "Invalid Signer"
    },
    {
      "code": 6001,
      "name": "AlreadyMinted",
      "msg": "Already minted"
    },
    {
      "code": 6002,
      "name": "NotEnoughSOL",
      "msg": "Not enough SOL"
    }
  ]
};

export const IDL: StableDiffusionMint = {
  "version": "0.1.0",
  "name": "stable_diffusion_mint",
  "instructions": [
    {
      "name": "initializeDiffusion",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stableDiffusion",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "mintDiffusion",
      "accounts": [
        {
          "name": "stableDiffusion",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nft",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true,
          "docs": [
            "Authority Wallet"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeUser",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stableDiffusion",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "stableDiffusion",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority"
            ],
            "type": "publicKey"
          },
          {
            "name": "creator",
            "docs": [
              "Creator"
            ],
            "type": "publicKey"
          },
          {
            "name": "counter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "stableDiffusionPda",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "minted",
            "type": "bool"
          },
          {
            "name": "stableDiffusion",
            "type": "publicKey"
          },
          {
            "name": "masterMint",
            "type": "publicKey"
          },
          {
            "name": "masterMetadata",
            "type": "publicKey"
          },
          {
            "name": "masterEdition",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stableDiffusion",
            "docs": [
              "Stable Diffusion"
            ],
            "type": "publicKey"
          },
          {
            "name": "nftsMinted",
            "docs": [
              "Number of assets the user can redeem from the mixer"
            ],
            "type": "u64"
          },
          {
            "name": "costToMint",
            "docs": [
              "Cost To Mint"
            ],
            "type": "u64"
          },
          {
            "name": "nonce",
            "docs": [
              "Nonce"
            ],
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidSigner",
      "msg": "Invalid Signer"
    },
    {
      "code": 6001,
      "name": "AlreadyMinted",
      "msg": "Already minted"
    },
    {
      "code": 6002,
      "name": "NotEnoughSOL",
      "msg": "Not enough SOL"
    }
  ]
};