export type SecureTransfer = {
  version: "0.1.0";
  name: "secure_transfer";
  instructions: [
    {
      name: "setupSecureTransfer";
      accounts: [
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
          name: "secureTransfer";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "send";
      accounts: [
        {
          name: "sender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "secureTransfer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "receiver";
          type: "publicKey";
        },
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "handshake";
          type: {
            defined: "Handshake";
          };
        }
      ];
    },
    {
      name: "redeem";
      accounts: [
        {
          name: "sender";
          isMut: true;
          isSigner: false;
        },
        {
          name: "receiver";
          isMut: true;
          isSigner: true;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "counter";
          type: "u64";
        }
      ];
    },
    {
      name: "accept";
      accounts: [
        {
          name: "receiver";
          isMut: true;
          isSigner: true;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "sender";
          type: "publicKey";
        },
        {
          name: "counter";
          type: "u64";
        }
      ];
    },
    {
      name: "confirm";
      accounts: [
        {
          name: "sender";
          isMut: true;
          isSigner: true;
        },
        {
          name: "receiver";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "counter";
          type: "u64";
        }
      ];
    },
    {
      name: "cancel";
      accounts: [
        {
          name: "authority";
          isMut: true;
          isSigner: true;
        },
        {
          name: "secureTransfer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrow";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "receiver";
          type: "publicKey";
        },
        {
          name: "counter";
          type: "u64";
        }
      ];
    }
  ];
  accounts: [
    {
      name: "secureTransfer";
      type: {
        kind: "struct";
        fields: [
          {
            name: "counter";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "escrow";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "sender";
            type: "publicKey";
          },
          {
            name: "receiver";
            type: "publicKey";
          },
          {
            name: "threeWayState";
            type: {
              option: {
                defined: "ThreeWayState";
              };
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "Handshake";
      type: {
        kind: "enum";
        variants: [
          {
            name: "TwoWay";
          },
          {
            name: "ThreeWay";
          }
        ];
      };
    },
    {
      name: "ErrorCode";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Overflow";
          },
          {
            name: "CantAcceptTwoWayHandshake";
          },
          {
            name: "CantAcceptAlreadyAcceptedHandshake";
          },
          {
            name: "CantRedeemThreeWayHandshake";
          },
          {
            name: "CantConfirmPendingThreeWayHandshake";
          },
          {
            name: "CantConfirmTwoWayHandshake";
          }
        ];
      };
    },
    {
      name: "ThreeWayState";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Pending";
          },
          {
            name: "Accepted";
          }
        ];
      };
    }
  ];
};

export const IDL: SecureTransfer = {
  version: "0.1.0",
  name: "secure_transfer",
  instructions: [
    {
      name: "setupSecureTransfer",
      accounts: [
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
          name: "secureTransfer",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "send",
      accounts: [
        {
          name: "sender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "secureTransfer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "receiver",
          type: "publicKey",
        },
        {
          name: "amount",
          type: "u64",
        },
        {
          name: "handshake",
          type: {
            defined: "Handshake",
          },
        },
      ],
    },
    {
      name: "redeem",
      accounts: [
        {
          name: "sender",
          isMut: true,
          isSigner: false,
        },
        {
          name: "receiver",
          isMut: true,
          isSigner: true,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "counter",
          type: "u64",
        },
      ],
    },
    {
      name: "accept",
      accounts: [
        {
          name: "receiver",
          isMut: true,
          isSigner: true,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "sender",
          type: "publicKey",
        },
        {
          name: "counter",
          type: "u64",
        },
      ],
    },
    {
      name: "confirm",
      accounts: [
        {
          name: "sender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "receiver",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "counter",
          type: "u64",
        },
      ],
    },
    {
      name: "cancel",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "secureTransfer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrow",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "receiver",
          type: "publicKey",
        },
        {
          name: "counter",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "secureTransfer",
      type: {
        kind: "struct",
        fields: [
          {
            name: "counter",
            type: "u64",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "escrow",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "sender",
            type: "publicKey",
          },
          {
            name: "receiver",
            type: "publicKey",
          },
          {
            name: "threeWayState",
            type: {
              option: {
                defined: "ThreeWayState",
              },
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "Handshake",
      type: {
        kind: "enum",
        variants: [
          {
            name: "TwoWay",
          },
          {
            name: "ThreeWay",
          },
        ],
      },
    },
    {
      name: "ErrorCode",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Overflow",
          },
          {
            name: "CantAcceptTwoWayHandshake",
          },
          {
            name: "CantAcceptAlreadyAcceptedHandshake",
          },
          {
            name: "CantRedeemThreeWayHandshake",
          },
          {
            name: "CantConfirmPendingThreeWayHandshake",
          },
          {
            name: "CantConfirmTwoWayHandshake",
          },
        ],
      },
    },
    {
      name: "ThreeWayState",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Pending",
          },
          {
            name: "Accepted",
          },
        ],
      },
    },
  ],
};
