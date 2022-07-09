export type GemFarm = {
  version: "0.0.0";
  name: "gem_farm";
  instructions: [
    {
      name: "initFarm";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: true;
        },
        {
          name: "farmManager";
          isMut: false;
          isSigner: true;
        },
        {
          name: "farmAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmTreasury";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardAPot";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardAMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardBPot";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardBMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "bank";
          isMut: true;
          isSigner: true;
        },
        {
          name: "gemBank";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rent";
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
        }
      ];
      args: [
        {
          name: "bumpAuth";
          type: "u8";
        },
        {
          name: "bumpTreasury";
          type: "u8";
        },
        {
          name: "bumpPotA";
          type: "u8";
        },
        {
          name: "bumpPotB";
          type: "u8";
        },
        {
          name: "rewardTypeA";
          type: {
            defined: "RewardType";
          };
        },
        {
          name: "rewardTypeB";
          type: {
            defined: "RewardType";
          };
        },
        {
          name: "farmConfig";
          type: {
            defined: "FarmConfig";
          };
        }
      ];
    },
    {
      name: "updateFarm";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmManager";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "config";
          type: {
            option: {
              defined: "FarmConfig";
            };
          };
        },
        {
          name: "manager";
          type: {
            option: "publicKey";
          };
        }
      ];
    },
    {
      name: "payoutFromTreasury";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmManager";
          isMut: false;
          isSigner: true;
        },
        {
          name: "farmAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "farmTreasury";
          isMut: true;
          isSigner: false;
        },
        {
          name: "destination";
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
          name: "bumpAuth";
          type: "u8";
        },
        {
          name: "bumpTreasury";
          type: "u8";
        },
        {
          name: "lamports";
          type: "u64";
        }
      ];
    },
    {
      name: "addToBankWhitelist";
      accounts: [
        {
          name: "farm";
          isMut: false;
          isSigner: false;
        },
        {
          name: "farmManager";
          isMut: true;
          isSigner: true;
        },
        {
          name: "farmAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "bank";
          isMut: true;
          isSigner: false;
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
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "gemBank";
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
          name: "bumpWl";
          type: "u8";
        },
        {
          name: "whitelistType";
          type: "u8";
        }
      ];
    },
    {
      name: "removeFromBankWhitelist";
      accounts: [
        {
          name: "farm";
          isMut: false;
          isSigner: false;
        },
        {
          name: "farmManager";
          isMut: true;
          isSigner: true;
        },
        {
          name: "farmAuthority";
          isMut: true;
          isSigner: false;
        },
        {
          name: "bank";
          isMut: true;
          isSigner: false;
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
        },
        {
          name: "gemBank";
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
          name: "bumpWl";
          type: "u8";
        }
      ];
    },
    {
      name: "initFarmer";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "identity";
          isMut: false;
          isSigner: true;
        },
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
          name: "gemBank";
          isMut: false;
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
          name: "bumpFarmer";
          type: "u8";
        },
        {
          name: "bumpVault";
          type: "u8";
        }
      ];
    },
    {
      name: "stake";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "farmer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "identity";
          isMut: true;
          isSigner: true;
        },
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
          name: "gemBank";
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
          name: "bumpFarmer";
          type: "u8";
        }
      ];
    },
    {
      name: "unstake";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "farmTreasury";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "identity";
          isMut: true;
          isSigner: true;
        },
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
          name: "gemBank";
          isMut: false;
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
          name: "bumpAuth";
          type: "u8";
        },
        {
          name: "bumpTreasury";
          type: "u8";
        },
        {
          name: "bumpFarmer";
          type: "u8";
        }
      ];
    },
    {
      name: "claim";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "farmer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "identity";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rewardAPot";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardAMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardADestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardBPot";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardBMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardBDestination";
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
          name: "bumpFarmer";
          type: "u8";
        },
        {
          name: "bumpPotA";
          type: "u8";
        },
        {
          name: "bumpPotB";
          type: "u8";
        }
      ];
    },
    {
      name: "flashDeposit";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "farmer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "identity";
          isMut: true;
          isSigner: true;
        },
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
          name: "vaultAuthority";
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
        },
        {
          name: "gemBank";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "bumpFarmer";
          type: "u8";
        },
        {
          name: "bumpVaultAuth";
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
      name: "refreshFarmer";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "identity";
          isMut: false;
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
      name: "refreshFarmerSigned";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "identity";
          isMut: false;
          isSigner: true;
        }
      ];
      args: [
        {
          name: "bump";
          type: "u8";
        },
        {
          name: "reenroll";
          type: "bool";
        }
      ];
    },
    {
      name: "authorizeFunder";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmManager";
          isMut: true;
          isSigner: true;
        },
        {
          name: "funderToAuthorize";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authorizationProof";
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
          name: "bump";
          type: "u8";
        }
      ];
    },
    {
      name: "deauthorizeFunder";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmManager";
          isMut: true;
          isSigner: true;
        },
        {
          name: "funderToDeauthorize";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authorizationProof";
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
          name: "bump";
          type: "u8";
        }
      ];
    },
    {
      name: "fundReward";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "authorizationProof";
          isMut: false;
          isSigner: false;
        },
        {
          name: "authorizedFunder";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rewardPot";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardSource";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardMint";
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
        }
      ];
      args: [
        {
          name: "bumpProof";
          type: "u8";
        },
        {
          name: "bumpPot";
          type: "u8";
        },
        {
          name: "variableRateConfig";
          type: {
            option: {
              defined: "VariableRateConfig";
            };
          };
        },
        {
          name: "fixedRateConfig";
          type: {
            option: {
              defined: "FixedRateConfig";
            };
          };
        }
      ];
    },
    {
      name: "cancelReward";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmManager";
          isMut: true;
          isSigner: true;
        },
        {
          name: "farmAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardPot";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardDestination";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardMint";
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
          name: "bumpPot";
          type: "u8";
        }
      ];
    },
    {
      name: "lockReward";
      accounts: [
        {
          name: "farm";
          isMut: true;
          isSigner: false;
        },
        {
          name: "farmManager";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rewardMint";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "addRaritiesToBank";
      accounts: [
        {
          name: "farm";
          isMut: false;
          isSigner: false;
        },
        {
          name: "farmManager";
          isMut: true;
          isSigner: true;
        },
        {
          name: "farmAuthority";
          isMut: false;
          isSigner: false;
        },
        {
          name: "bank";
          isMut: false;
          isSigner: false;
        },
        {
          name: "gemBank";
          isMut: false;
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
          name: "bumpAuth";
          type: "u8";
        },
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
      name: "authorizationProof";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authorizedFunder";
            type: "publicKey";
          },
          {
            name: "farm";
            type: "publicKey";
          }
        ];
      };
    },
    {
      name: "farm";
      type: {
        kind: "struct";
        fields: [
          {
            name: "version";
            type: "u16";
          },
          {
            name: "farmManager";
            type: "publicKey";
          },
          {
            name: "farmTreasury";
            type: "publicKey";
          },
          {
            name: "farmAuthority";
            type: "publicKey";
          },
          {
            name: "farmAuthoritySeed";
            type: "publicKey";
          },
          {
            name: "farmAuthorityBumpSeed";
            type: {
              array: ["u8", 1];
            };
          },
          {
            name: "bank";
            type: "publicKey";
          },
          {
            name: "config";
            type: {
              defined: "FarmConfig";
            };
          },
          {
            name: "farmerCount";
            type: "u64";
          },
          {
            name: "stakedFarmerCount";
            type: "u64";
          },
          {
            name: "gemsStaked";
            type: "u64";
          },
          {
            name: "rarityPointsStaked";
            type: "u64";
          },
          {
            name: "authorizedFunderCount";
            type: "u64";
          },
          {
            name: "rewardA";
            type: {
              defined: "FarmReward";
            };
          },
          {
            name: "rewardB";
            type: {
              defined: "FarmReward";
            };
          }
        ];
      };
    },
    {
      name: "farmer";
      type: {
        kind: "struct";
        fields: [
          {
            name: "farm";
            type: "publicKey";
          },
          {
            name: "identity";
            type: "publicKey";
          },
          {
            name: "vault";
            type: "publicKey";
          },
          {
            name: "state";
            type: {
              defined: "FarmerState";
            };
          },
          {
            name: "gemsStaked";
            type: "u64";
          },
          {
            name: "minStakingEndsTs";
            type: "u64";
          },
          {
            name: "cooldownEndsTs";
            type: "u64";
          },
          {
            name: "rewardA";
            type: {
              defined: "FarmerReward";
            };
          },
          {
            name: "rewardB";
            type: {
              defined: "FarmerReward";
            };
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "FarmConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "minStakingPeriodSec";
            type: "u64";
          },
          {
            name: "cooldownPeriodSec";
            type: "u64";
          },
          {
            name: "unstakingFeeLamp";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "FundsTracker";
      type: {
        kind: "struct";
        fields: [
          {
            name: "totalFunded";
            type: "u64";
          },
          {
            name: "totalRefunded";
            type: "u64";
          },
          {
            name: "totalAccruedToStakers";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "TimeTracker";
      type: {
        kind: "struct";
        fields: [
          {
            name: "durationSec";
            type: "u64";
          },
          {
            name: "rewardEndTs";
            type: "u64";
          },
          {
            name: "lockEndTs";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "FarmReward";
      type: {
        kind: "struct";
        fields: [
          {
            name: "rewardMint";
            type: "publicKey";
          },
          {
            name: "rewardPot";
            type: "publicKey";
          },
          {
            name: "rewardType";
            type: {
              defined: "RewardType";
            };
          },
          {
            name: "fixedRate";
            type: {
              defined: "FixedRateReward";
            };
          },
          {
            name: "variableRate";
            type: {
              defined: "VariableRateReward";
            };
          },
          {
            name: "funds";
            type: {
              defined: "FundsTracker";
            };
          },
          {
            name: "times";
            type: {
              defined: "TimeTracker";
            };
          }
        ];
      };
    },
    {
      name: "FarmerReward";
      type: {
        kind: "struct";
        fields: [
          {
            name: "paidOutReward";
            type: "u64";
          },
          {
            name: "accruedReward";
            type: "u64";
          },
          {
            name: "variableRate";
            type: {
              defined: "FarmerVariableRateReward";
            };
          },
          {
            name: "fixedRate";
            type: {
              defined: "FarmerFixedRateReward";
            };
          }
        ];
      };
    },
    {
      name: "FarmerVariableRateReward";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lastRecordedAccruedRewardPerRarityPoint";
            type: {
              defined: "Number128";
            };
          }
        ];
      };
    },
    {
      name: "FarmerFixedRateReward";
      type: {
        kind: "struct";
        fields: [
          {
            name: "beginStakingTs";
            type: "u64";
          },
          {
            name: "beginScheduleTs";
            type: "u64";
          },
          {
            name: "lastUpdatedTs";
            type: "u64";
          },
          {
            name: "promisedSchedule";
            type: {
              defined: "FixedRateSchedule";
            };
          },
          {
            name: "promisedDuration";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "TierConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "rewardRate";
            type: "u64";
          },
          {
            name: "requiredTenure";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "FixedRateSchedule";
      type: {
        kind: "struct";
        fields: [
          {
            name: "baseRate";
            type: "u64";
          },
          {
            name: "tier1";
            type: {
              option: {
                defined: "TierConfig";
              };
            };
          },
          {
            name: "tier2";
            type: {
              option: {
                defined: "TierConfig";
              };
            };
          },
          {
            name: "tier3";
            type: {
              option: {
                defined: "TierConfig";
              };
            };
          },
          {
            name: "denominator";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "FixedRateConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "schedule";
            type: {
              defined: "FixedRateSchedule";
            };
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "durationSec";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "FixedRateReward";
      type: {
        kind: "struct";
        fields: [
          {
            name: "schedule";
            type: {
              defined: "FixedRateSchedule";
            };
          },
          {
            name: "reservedAmount";
            type: "u64";
          }
        ];
      };
    },
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
    },
    {
      name: "Number128";
      type: {
        kind: "struct";
        fields: [
          {
            name: "n";
            type: "u128";
          }
        ];
      };
    },
    {
      name: "VariableRateConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "durationSec";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "VariableRateReward";
      type: {
        kind: "struct";
        fields: [
          {
            name: "rewardRate";
            type: {
              defined: "Number128";
            };
          },
          {
            name: "rewardLastUpdatedTs";
            type: "u64";
          },
          {
            name: "accruedRewardPerRarityPoint";
            type: {
              defined: "Number128";
            };
          }
        ];
      };
    },
    {
      name: "RewardType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Variable";
          },
          {
            name: "Fixed";
          }
        ];
      };
    },
    {
      name: "FarmerState";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Unstaked";
          },
          {
            name: "Staked";
          },
          {
            name: "PendingCooldown";
          }
        ];
      };
    },
    {
      name: "FixedRateRewardTier";
      type: {
        kind: "enum";
        variants: [
          {
            name: "Base";
          },
          {
            name: "Tier1";
          },
          {
            name: "Tier2";
          },
          {
            name: "Tier3";
          }
        ];
      };
    }
  ];
};

export const IDL: GemFarm = {
  version: "0.0.0",
  name: "gem_farm",
  instructions: [
    {
      name: "initFarm",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: true,
        },
        {
          name: "farmManager",
          isMut: false,
          isSigner: true,
        },
        {
          name: "farmAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmTreasury",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardAPot",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardAMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardBPot",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardBMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bank",
          isMut: true,
          isSigner: true,
        },
        {
          name: "gemBank",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rent",
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
      ],
      args: [
        {
          name: "bumpAuth",
          type: "u8",
        },
        {
          name: "bumpTreasury",
          type: "u8",
        },
        {
          name: "bumpPotA",
          type: "u8",
        },
        {
          name: "bumpPotB",
          type: "u8",
        },
        {
          name: "rewardTypeA",
          type: {
            defined: "RewardType",
          },
        },
        {
          name: "rewardTypeB",
          type: {
            defined: "RewardType",
          },
        },
        {
          name: "farmConfig",
          type: {
            defined: "FarmConfig",
          },
        },
      ],
    },
    {
      name: "updateFarm",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmManager",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "config",
          type: {
            option: {
              defined: "FarmConfig",
            },
          },
        },
        {
          name: "manager",
          type: {
            option: "publicKey",
          },
        },
      ],
    },
    {
      name: "payoutFromTreasury",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmManager",
          isMut: false,
          isSigner: true,
        },
        {
          name: "farmAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "farmTreasury",
          isMut: true,
          isSigner: false,
        },
        {
          name: "destination",
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
          name: "bumpAuth",
          type: "u8",
        },
        {
          name: "bumpTreasury",
          type: "u8",
        },
        {
          name: "lamports",
          type: "u64",
        },
      ],
    },
    {
      name: "addToBankWhitelist",
      accounts: [
        {
          name: "farm",
          isMut: false,
          isSigner: false,
        },
        {
          name: "farmManager",
          isMut: true,
          isSigner: true,
        },
        {
          name: "farmAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bank",
          isMut: true,
          isSigner: false,
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
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "gemBank",
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
          name: "bumpWl",
          type: "u8",
        },
        {
          name: "whitelistType",
          type: "u8",
        },
      ],
    },
    {
      name: "removeFromBankWhitelist",
      accounts: [
        {
          name: "farm",
          isMut: false,
          isSigner: false,
        },
        {
          name: "farmManager",
          isMut: true,
          isSigner: true,
        },
        {
          name: "farmAuthority",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bank",
          isMut: true,
          isSigner: false,
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
        {
          name: "gemBank",
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
          name: "bumpWl",
          type: "u8",
        },
      ],
    },
    {
      name: "initFarmer",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "identity",
          isMut: false,
          isSigner: true,
        },
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
          name: "gemBank",
          isMut: false,
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
          name: "bumpFarmer",
          type: "u8",
        },
        {
          name: "bumpVault",
          type: "u8",
        },
      ],
    },
    {
      name: "stake",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "farmer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "identity",
          isMut: true,
          isSigner: true,
        },
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
          name: "gemBank",
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
          name: "bumpFarmer",
          type: "u8",
        },
      ],
    },
    {
      name: "unstake",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "farmTreasury",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "identity",
          isMut: true,
          isSigner: true,
        },
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
          name: "gemBank",
          isMut: false,
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
          name: "bumpAuth",
          type: "u8",
        },
        {
          name: "bumpTreasury",
          type: "u8",
        },
        {
          name: "bumpFarmer",
          type: "u8",
        },
      ],
    },
    {
      name: "claim",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "farmer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "identity",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rewardAPot",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardAMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardADestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardBPot",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardBMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardBDestination",
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
          name: "bumpFarmer",
          type: "u8",
        },
        {
          name: "bumpPotA",
          type: "u8",
        },
        {
          name: "bumpPotB",
          type: "u8",
        },
      ],
    },
    {
      name: "flashDeposit",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "farmer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "identity",
          isMut: true,
          isSigner: true,
        },
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
          name: "vaultAuthority",
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
        {
          name: "gemBank",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "bumpFarmer",
          type: "u8",
        },
        {
          name: "bumpVaultAuth",
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
      name: "refreshFarmer",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "identity",
          isMut: false,
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
      name: "refreshFarmerSigned",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "identity",
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: "bump",
          type: "u8",
        },
        {
          name: "reenroll",
          type: "bool",
        },
      ],
    },
    {
      name: "authorizeFunder",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmManager",
          isMut: true,
          isSigner: true,
        },
        {
          name: "funderToAuthorize",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authorizationProof",
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
          name: "bump",
          type: "u8",
        },
      ],
    },
    {
      name: "deauthorizeFunder",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmManager",
          isMut: true,
          isSigner: true,
        },
        {
          name: "funderToDeauthorize",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authorizationProof",
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
          name: "bump",
          type: "u8",
        },
      ],
    },
    {
      name: "fundReward",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "authorizationProof",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authorizedFunder",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rewardPot",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardSource",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardMint",
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
      ],
      args: [
        {
          name: "bumpProof",
          type: "u8",
        },
        {
          name: "bumpPot",
          type: "u8",
        },
        {
          name: "variableRateConfig",
          type: {
            option: {
              defined: "VariableRateConfig",
            },
          },
        },
        {
          name: "fixedRateConfig",
          type: {
            option: {
              defined: "FixedRateConfig",
            },
          },
        },
      ],
    },
    {
      name: "cancelReward",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmManager",
          isMut: true,
          isSigner: true,
        },
        {
          name: "farmAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardPot",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardMint",
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
          name: "bumpPot",
          type: "u8",
        },
      ],
    },
    {
      name: "lockReward",
      accounts: [
        {
          name: "farm",
          isMut: true,
          isSigner: false,
        },
        {
          name: "farmManager",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rewardMint",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "addRaritiesToBank",
      accounts: [
        {
          name: "farm",
          isMut: false,
          isSigner: false,
        },
        {
          name: "farmManager",
          isMut: true,
          isSigner: true,
        },
        {
          name: "farmAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bank",
          isMut: false,
          isSigner: false,
        },
        {
          name: "gemBank",
          isMut: false,
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
          name: "bumpAuth",
          type: "u8",
        },
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
      name: "authorizationProof",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authorizedFunder",
            type: "publicKey",
          },
          {
            name: "farm",
            type: "publicKey",
          },
        ],
      },
    },
    {
      name: "farm",
      type: {
        kind: "struct",
        fields: [
          {
            name: "version",
            type: "u16",
          },
          {
            name: "farmManager",
            type: "publicKey",
          },
          {
            name: "farmTreasury",
            type: "publicKey",
          },
          {
            name: "farmAuthority",
            type: "publicKey",
          },
          {
            name: "farmAuthoritySeed",
            type: "publicKey",
          },
          {
            name: "farmAuthorityBumpSeed",
            type: {
              array: ["u8", 1],
            },
          },
          {
            name: "bank",
            type: "publicKey",
          },
          {
            name: "config",
            type: {
              defined: "FarmConfig",
            },
          },
          {
            name: "farmerCount",
            type: "u64",
          },
          {
            name: "stakedFarmerCount",
            type: "u64",
          },
          {
            name: "gemsStaked",
            type: "u64",
          },
          {
            name: "rarityPointsStaked",
            type: "u64",
          },
          {
            name: "authorizedFunderCount",
            type: "u64",
          },
          {
            name: "rewardA",
            type: {
              defined: "FarmReward",
            },
          },
          {
            name: "rewardB",
            type: {
              defined: "FarmReward",
            },
          },
        ],
      },
    },
    {
      name: "farmer",
      type: {
        kind: "struct",
        fields: [
          {
            name: "farm",
            type: "publicKey",
          },
          {
            name: "identity",
            type: "publicKey",
          },
          {
            name: "vault",
            type: "publicKey",
          },
          {
            name: "state",
            type: {
              defined: "FarmerState",
            },
          },
          {
            name: "gemsStaked",
            type: "u64",
          },
          {
            name: "minStakingEndsTs",
            type: "u64",
          },
          {
            name: "cooldownEndsTs",
            type: "u64",
          },
          {
            name: "rewardA",
            type: {
              defined: "FarmerReward",
            },
          },
          {
            name: "rewardB",
            type: {
              defined: "FarmerReward",
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "FarmConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "minStakingPeriodSec",
            type: "u64",
          },
          {
            name: "cooldownPeriodSec",
            type: "u64",
          },
          {
            name: "unstakingFeeLamp",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "FundsTracker",
      type: {
        kind: "struct",
        fields: [
          {
            name: "totalFunded",
            type: "u64",
          },
          {
            name: "totalRefunded",
            type: "u64",
          },
          {
            name: "totalAccruedToStakers",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "TimeTracker",
      type: {
        kind: "struct",
        fields: [
          {
            name: "durationSec",
            type: "u64",
          },
          {
            name: "rewardEndTs",
            type: "u64",
          },
          {
            name: "lockEndTs",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "FarmReward",
      type: {
        kind: "struct",
        fields: [
          {
            name: "rewardMint",
            type: "publicKey",
          },
          {
            name: "rewardPot",
            type: "publicKey",
          },
          {
            name: "rewardType",
            type: {
              defined: "RewardType",
            },
          },
          {
            name: "fixedRate",
            type: {
              defined: "FixedRateReward",
            },
          },
          {
            name: "variableRate",
            type: {
              defined: "VariableRateReward",
            },
          },
          {
            name: "funds",
            type: {
              defined: "FundsTracker",
            },
          },
          {
            name: "times",
            type: {
              defined: "TimeTracker",
            },
          },
        ],
      },
    },
    {
      name: "FarmerReward",
      type: {
        kind: "struct",
        fields: [
          {
            name: "paidOutReward",
            type: "u64",
          },
          {
            name: "accruedReward",
            type: "u64",
          },
          {
            name: "variableRate",
            type: {
              defined: "FarmerVariableRateReward",
            },
          },
          {
            name: "fixedRate",
            type: {
              defined: "FarmerFixedRateReward",
            },
          },
        ],
      },
    },
    {
      name: "FarmerVariableRateReward",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lastRecordedAccruedRewardPerRarityPoint",
            type: {
              defined: "Number128",
            },
          },
        ],
      },
    },
    {
      name: "FarmerFixedRateReward",
      type: {
        kind: "struct",
        fields: [
          {
            name: "beginStakingTs",
            type: "u64",
          },
          {
            name: "beginScheduleTs",
            type: "u64",
          },
          {
            name: "lastUpdatedTs",
            type: "u64",
          },
          {
            name: "promisedSchedule",
            type: {
              defined: "FixedRateSchedule",
            },
          },
          {
            name: "promisedDuration",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "TierConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "rewardRate",
            type: "u64",
          },
          {
            name: "requiredTenure",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "FixedRateSchedule",
      type: {
        kind: "struct",
        fields: [
          {
            name: "baseRate",
            type: "u64",
          },
          {
            name: "tier1",
            type: {
              option: {
                defined: "TierConfig",
              },
            },
          },
          {
            name: "tier2",
            type: {
              option: {
                defined: "TierConfig",
              },
            },
          },
          {
            name: "tier3",
            type: {
              option: {
                defined: "TierConfig",
              },
            },
          },
          {
            name: "denominator",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "FixedRateConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "schedule",
            type: {
              defined: "FixedRateSchedule",
            },
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "durationSec",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "FixedRateReward",
      type: {
        kind: "struct",
        fields: [
          {
            name: "schedule",
            type: {
              defined: "FixedRateSchedule",
            },
          },
          {
            name: "reservedAmount",
            type: "u64",
          },
        ],
      },
    },
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
    {
      name: "Number128",
      type: {
        kind: "struct",
        fields: [
          {
            name: "n",
            type: "u128",
          },
        ],
      },
    },
    {
      name: "VariableRateConfig",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "durationSec",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "VariableRateReward",
      type: {
        kind: "struct",
        fields: [
          {
            name: "rewardRate",
            type: {
              defined: "Number128",
            },
          },
          {
            name: "rewardLastUpdatedTs",
            type: "u64",
          },
          {
            name: "accruedRewardPerRarityPoint",
            type: {
              defined: "Number128",
            },
          },
        ],
      },
    },
    {
      name: "RewardType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Variable",
          },
          {
            name: "Fixed",
          },
        ],
      },
    },
    {
      name: "FarmerState",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Unstaked",
          },
          {
            name: "Staked",
          },
          {
            name: "PendingCooldown",
          },
        ],
      },
    },
    {
      name: "FixedRateRewardTier",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Base",
          },
          {
            name: "Tier1",
          },
          {
            name: "Tier2",
          },
          {
            name: "Tier3",
          },
        ],
      },
    },
  ],
};
