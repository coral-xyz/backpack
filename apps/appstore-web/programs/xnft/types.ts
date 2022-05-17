export type Xnft = {
  version: '0.1.0';
  name: 'xnft';
  instructions: [
    {
      name: 'createXnft';
      accounts: [
        {
          name: 'metadataProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'masterMint';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'mint';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'publisher';
              },
              {
                kind: 'arg';
                type: 'string';
                path: 'name';
              }
            ];
          };
        },
        {
          name: 'masterToken';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'token';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'master_mint';
              }
            ];
          };
        },
        {
          name: 'masterMetadata';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'metadata';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'metadata_program';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'master_mint';
              }
            ];
            programId: {
              kind: 'account';
              type: 'publicKey';
              path: 'metadata_program';
            };
          };
        },
        {
          name: 'masterEdition';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'metadata';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'metadata_program';
              },
              {
                kind: 'account';
                type: 'publicKey';
                account: 'Mint';
                path: 'master_mint';
              },
              {
                kind: 'const';
                type: 'string';
                value: 'edition';
              }
            ];
            programId: {
              kind: 'account';
              type: 'publicKey';
              path: 'metadata_program';
            };
          };
        },
        {
          name: 'xnft';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'xnft';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'master_edition';
              }
            ];
          };
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'publisher';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'symbol';
          type: 'string';
        },
        {
          name: 'uri';
          type: 'string';
        },
        {
          name: 'sellerFeeBasisPoints';
          type: 'u16';
        },
        {
          name: 'installPrice';
          type: 'u64';
        },
        {
          name: 'installVault';
          type: 'publicKey';
        }
      ];
    },
    {
      name: 'updateXnft';
      accounts: [];
      args: [];
    },
    {
      name: 'createInstall';
      accounts: [
        {
          name: 'xnft';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'install';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'install';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'authority';
              }
            ];
          };
        },
        {
          name: 'installVault';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'createInstallWithAuthority';
      accounts: [
        {
          name: 'xnft';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'install';
          isMut: true;
          isSigner: false;
          pda: {
            seeds: [
              {
                kind: 'const';
                type: 'string';
                value: 'install';
              },
              {
                kind: 'account';
                type: 'publicKey';
                path: 'authority';
              }
            ];
          };
        },
        {
          name: 'authority';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'installAuthority';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: 'deleteInstall';
      accounts: [];
      args: [];
    }
  ];
  accounts: [
    {
      name: 'xnft';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'kind';
            type: {
              defined: 'Kind';
            };
          },
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'publisher';
            type: 'publicKey';
          },
          {
            name: 'totalInstalls';
            type: 'u64';
          },
          {
            name: 'installPrice';
            type: 'u64';
          },
          {
            name: 'installVault';
            type: 'publicKey';
          },
          {
            name: 'masterEdition';
            type: 'publicKey';
          },
          {
            name: 'masterMetadata';
            type: 'publicKey';
          },
          {
            name: 'masterMint';
            type: 'publicKey';
          },
          {
            name: 'installAuthority';
            type: {
              option: 'publicKey';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'createdTs';
            type: 'i64';
          },
          {
            name: 'updatedTs';
            type: 'i64';
          }
        ];
      };
    },
    {
      name: 'install';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'authority';
            type: 'publicKey';
          },
          {
            name: 'xnft';
            type: 'publicKey';
          },
          {
            name: 'id';
            type: 'u64';
          },
          {
            name: 'masterMetadata';
            type: 'publicKey';
          }
        ];
      };
    }
  ];
  types: [
    {
      name: 'Kind';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Table';
          },
          {
            name: 'Image';
          }
        ];
      };
    }
  ];
};

export const IDL: Xnft = {
  version: '0.1.0',
  name: 'xnft',
  instructions: [
    {
      name: 'createXnft',
      accounts: [
        {
          name: 'metadataProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'masterMint',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'mint'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'publisher'
              },
              {
                kind: 'arg',
                type: 'string',
                path: 'name'
              }
            ]
          }
        },
        {
          name: 'masterToken',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'token'
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'master_mint'
              }
            ]
          }
        },
        {
          name: 'masterMetadata',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'metadata'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'metadata_program'
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'master_mint'
              }
            ],
            programId: {
              kind: 'account',
              type: 'publicKey',
              path: 'metadata_program'
            }
          }
        },
        {
          name: 'masterEdition',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'metadata'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'metadata_program'
              },
              {
                kind: 'account',
                type: 'publicKey',
                account: 'Mint',
                path: 'master_mint'
              },
              {
                kind: 'const',
                type: 'string',
                value: 'edition'
              }
            ],
            programId: {
              kind: 'account',
              type: 'publicKey',
              path: 'metadata_program'
            }
          }
        },
        {
          name: 'xnft',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'xnft'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'master_edition'
              }
            ]
          }
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true
        },
        {
          name: 'publisher',
          isMut: false,
          isSigner: true
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'symbol',
          type: 'string'
        },
        {
          name: 'uri',
          type: 'string'
        },
        {
          name: 'sellerFeeBasisPoints',
          type: 'u16'
        },
        {
          name: 'installPrice',
          type: 'u64'
        },
        {
          name: 'installVault',
          type: 'publicKey'
        }
      ]
    },
    {
      name: 'updateXnft',
      accounts: [],
      args: []
    },
    {
      name: 'createInstall',
      accounts: [
        {
          name: 'xnft',
          isMut: true,
          isSigner: false
        },
        {
          name: 'install',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'install'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'authority'
              }
            ]
          }
        },
        {
          name: 'installVault',
          isMut: false,
          isSigner: false
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'createInstallWithAuthority',
      accounts: [
        {
          name: 'xnft',
          isMut: true,
          isSigner: false
        },
        {
          name: 'install',
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: 'const',
                type: 'string',
                value: 'install'
              },
              {
                kind: 'account',
                type: 'publicKey',
                path: 'authority'
              }
            ]
          }
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true
        },
        {
          name: 'installAuthority',
          isMut: false,
          isSigner: true
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: 'deleteInstall',
      accounts: [],
      args: []
    }
  ],
  accounts: [
    {
      name: 'xnft',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'kind',
            type: {
              defined: 'Kind'
            }
          },
          {
            name: 'name',
            type: 'string'
          },
          {
            name: 'authority',
            type: 'publicKey'
          },
          {
            name: 'publisher',
            type: 'publicKey'
          },
          {
            name: 'totalInstalls',
            type: 'u64'
          },
          {
            name: 'installPrice',
            type: 'u64'
          },
          {
            name: 'installVault',
            type: 'publicKey'
          },
          {
            name: 'masterEdition',
            type: 'publicKey'
          },
          {
            name: 'masterMetadata',
            type: 'publicKey'
          },
          {
            name: 'masterMint',
            type: 'publicKey'
          },
          {
            name: 'installAuthority',
            type: {
              option: 'publicKey'
            }
          },
          {
            name: 'bump',
            type: 'u8'
          },
          {
            name: 'createdTs',
            type: 'i64'
          },
          {
            name: 'updatedTs',
            type: 'i64'
          }
        ]
      }
    },
    {
      name: 'install',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey'
          },
          {
            name: 'xnft',
            type: 'publicKey'
          },
          {
            name: 'id',
            type: 'u64'
          },
          {
            name: 'masterMetadata',
            type: 'publicKey'
          }
        ]
      }
    }
  ],
  types: [
    {
      name: 'Kind',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Table'
          },
          {
            name: 'Image'
          }
        ]
      }
    }
  ]
};
