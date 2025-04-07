// src/dlmm/index.ts
import { AnchorProvider as AnchorProvider2, BN as BN13, Program as Program3 } from "@coral-xyz/anchor";
import {
  AccountLayout,
  NATIVE_MINT as NATIVE_MINT2,
  TOKEN_PROGRAM_ID as TOKEN_PROGRAM_ID4,
  createAssociatedTokenAccountIdempotentInstruction as createAssociatedTokenAccountIdempotentInstruction2,
  createTransferCheckedInstruction as createTransferCheckedInstruction2,
  getAssociatedTokenAddressSync as getAssociatedTokenAddressSync2,
  unpackAccount,
  unpackMint as unpackMint2
} from "@solana/spl-token";
import {
  ComputeBudgetProgram as ComputeBudgetProgram3,
  PublicKey as PublicKey9,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SystemProgram as SystemProgram2,
  Transaction
} from "@solana/web3.js";
import Decimal5 from "decimal.js";

// src/dlmm/constants/index.ts
import { PublicKey } from "@solana/web3.js";

// src/dlmm/idl.ts
var IDL = {
  "version": "0.9.0",
  "name": "lb_clmm",
  "constants": [
    {
      "name": "BASIS_POINT_MAX",
      "type": "i32",
      "value": "10000"
    },
    {
      "name": "MAX_BIN_PER_ARRAY",
      "type": {
        "defined": "usize"
      },
      "value": "70"
    },
    {
      "name": "MAX_BIN_PER_POSITION",
      "type": {
        "defined": "usize"
      },
      "value": "70"
    },
    {
      "name": "MAX_RESIZE_LENGTH",
      "type": {
        "defined": "usize"
      },
      "value": "70"
    },
    {
      "name": "POSITION_MAX_LENGTH",
      "type": {
        "defined": "usize"
      },
      "value": "1400"
    },
    {
      "name": "MIN_BIN_ID",
      "type": "i32",
      "value": "- 443636"
    },
    {
      "name": "MAX_BIN_ID",
      "type": "i32",
      "value": "443636"
    },
    {
      "name": "MAX_FEE_RATE",
      "type": "u64",
      "value": "100_000_000"
    },
    {
      "name": "FEE_PRECISION",
      "type": "u64",
      "value": "1_000_000_000"
    },
    {
      "name": "MAX_PROTOCOL_SHARE",
      "type": "u16",
      "value": "2_500"
    },
    {
      "name": "HOST_FEE_BPS",
      "type": "u16",
      "value": "2_000"
    },
    {
      "name": "NUM_REWARDS",
      "type": {
        "defined": "usize"
      },
      "value": "2"
    },
    {
      "name": "MIN_REWARD_DURATION",
      "type": "u64",
      "value": "1"
    },
    {
      "name": "MAX_REWARD_DURATION",
      "type": "u64",
      "value": "31536000"
    },
    {
      "name": "EXTENSION_BINARRAY_BITMAP_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "12"
    },
    {
      "name": "BIN_ARRAY_BITMAP_SIZE",
      "type": "i32",
      "value": "512"
    },
    {
      "name": "MAX_REWARD_BIN_SPLIT",
      "type": {
        "defined": "usize"
      },
      "value": "15"
    },
    {
      "name": "ILM_PROTOCOL_SHARE",
      "type": "u16",
      "value": "2000"
    },
    {
      "name": "PROTOCOL_SHARE",
      "type": "u16",
      "value": "500"
    },
    {
      "name": "MAX_BIN_STEP",
      "type": "u16",
      "value": "400"
    },
    {
      "name": "MAX_BASE_FEE",
      "type": "u128",
      "value": "100_000_000"
    },
    {
      "name": "MIN_BASE_FEE",
      "type": "u128",
      "value": "100_000"
    },
    {
      "name": "MINIMUM_LIQUIDITY",
      "type": "u128",
      "value": "1_000_000"
    },
    {
      "name": "BIN_ARRAY",
      "type": "bytes",
      "value": "[98, 105, 110, 95, 97, 114, 114, 97, 121]"
    },
    {
      "name": "ORACLE",
      "type": "bytes",
      "value": "[111, 114, 97, 99, 108, 101]"
    },
    {
      "name": "BIN_ARRAY_BITMAP_SEED",
      "type": "bytes",
      "value": "[98, 105, 116, 109, 97, 112]"
    },
    {
      "name": "PRESET_PARAMETER",
      "type": "bytes",
      "value": "[112, 114, 101, 115, 101, 116, 95, 112, 97, 114, 97, 109, 101, 116, 101, 114]"
    },
    {
      "name": "PRESET_PARAMETER2",
      "type": "bytes",
      "value": "[112, 114, 101, 115, 101, 116, 95, 112, 97, 114, 97, 109, 101, 116, 101, 114, 50]"
    },
    {
      "name": "POSITION",
      "type": "bytes",
      "value": "[112, 111, 115, 105, 116, 105, 111, 110]"
    },
    {
      "name": "CLAIM_PROTOCOL_FEE_OPERATOR",
      "type": "bytes",
      "value": "[99, 102, 95, 111, 112, 101, 114, 97, 116, 111, 114]"
    }
  ],
  "instructions": [
    {
      "name": "initializeLbPair",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenMintX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "presetParameter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "activeId",
          "type": "i32"
        },
        {
          "name": "binStep",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializePermissionLbPair",
      "accounts": [
        {
          "name": "base",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenMintX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenBadgeX",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenBadgeY",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenProgramX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ixData",
          "type": {
            "defined": "InitPermissionPairIx"
          }
        }
      ]
    },
    {
      "name": "initializeCustomizablePermissionlessLbPair",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenMintX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CustomizableParams"
          }
        }
      ]
    },
    {
      "name": "initializeBinArrayBitmapExtension",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "Initialize an account to store if a bin array is initialized."
          ]
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeBinArray",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArray",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "i64"
        }
      ]
    },
    {
      "name": "addLiquidity",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "liquidityParameter",
          "type": {
            "defined": "LiquidityParameter"
          }
        }
      ]
    },
    {
      "name": "addLiquidityByWeight",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "liquidityParameter",
          "type": {
            "defined": "LiquidityParameterByWeight"
          }
        }
      ]
    },
    {
      "name": "addLiquidityByStrategy",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "liquidityParameter",
          "type": {
            "defined": "LiquidityParameterByStrategy"
          }
        }
      ]
    },
    {
      "name": "addLiquidityByStrategyOneSide",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "liquidityParameter",
          "type": {
            "defined": "LiquidityParameterByStrategyOneSide"
          }
        }
      ]
    },
    {
      "name": "addLiquidityOneSide",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "liquidityParameter",
          "type": {
            "defined": "LiquidityOneSideParameter"
          }
        }
      ]
    },
    {
      "name": "removeLiquidity",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "binLiquidityRemoval",
          "type": {
            "vec": {
              "defined": "BinLiquidityReduction"
            }
          }
        }
      ]
    },
    {
      "name": "initializePosition",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "lbPair",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lowerBinId",
          "type": "i32"
        },
        {
          "name": "width",
          "type": "i32"
        }
      ]
    },
    {
      "name": "initializePositionPda",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "base",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "owner"
          ]
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lowerBinId",
          "type": "i32"
        },
        {
          "name": "width",
          "type": "i32"
        }
      ]
    },
    {
      "name": "initializePositionByOperator",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "base",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "operator"
          ]
        },
        {
          "name": "operatorTokenX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ownerTokenX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lowerBinId",
          "type": "i32"
        },
        {
          "name": "width",
          "type": "i32"
        },
        {
          "name": "feeOwner",
          "type": "publicKey"
        },
        {
          "name": "lockReleasePoint",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updatePositionOperator",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "operator",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "swap",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenIn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenOut",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "hostFeeIn",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minAmountOut",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapExactOut",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenIn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenOut",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "hostFeeIn",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxInAmount",
          "type": "u64"
        },
        {
          "name": "outAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "swapWithPriceImpact",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenIn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenOut",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "hostFeeIn",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "activeId",
          "type": {
            "option": "i32"
          }
        },
        {
          "name": "maxPriceImpactBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "withdrawProtocolFee",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiverTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiverTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimFeeOperator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": false,
          "isSigner": true,
          "docs": [
            "operator"
          ]
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountX",
          "type": "u64"
        },
        {
          "name": "amountY",
          "type": "u64"
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "initializeReward",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenBadge",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rewardIndex",
          "type": "u64"
        },
        {
          "name": "rewardDuration",
          "type": "u64"
        },
        {
          "name": "funder",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "fundReward",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funderTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "binArray",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rewardIndex",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "carryForward",
          "type": "bool"
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "updateRewardFunder",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rewardIndex",
          "type": "u64"
        },
        {
          "name": "newFunder",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "updateRewardDuration",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "binArray",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rewardIndex",
          "type": "u64"
        },
        {
          "name": "newDuration",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimReward",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rewardIndex",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimFee",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closePosition",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "rentReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateBaseFeeParameters",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "feeParameter",
          "type": {
            "defined": "BaseFeeParameter"
          }
        }
      ]
    },
    {
      "name": "updateDynamicFeeParameters",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "feeParameter",
          "type": {
            "defined": "DynamicFeeParameter"
          }
        }
      ]
    },
    {
      "name": "increaseOracleLength",
      "accounts": [
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "lengthToAdd",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializePresetParameter",
      "accounts": [
        {
          "name": "presetParameter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
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
          "name": "ix",
          "type": {
            "defined": "InitPresetParametersIx"
          }
        }
      ]
    },
    {
      "name": "closePresetParameter",
      "accounts": [
        {
          "name": "presetParameter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rentReceiver",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "closePresetParameter2",
      "accounts": [
        {
          "name": "presetParameter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rentReceiver",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "removeAllLiquidity",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "setPairStatus",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "status",
          "type": "u8"
        }
      ]
    },
    {
      "name": "migratePosition",
      "accounts": [
        {
          "name": "positionV2",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "positionV1",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rentReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "migrateBinArray",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateFeesAndRewards",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "withdrawIneligibleReward",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funderTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "binArray",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rewardIndex",
          "type": "u64"
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "setActivationPoint",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "activationPoint",
          "type": "u64"
        }
      ]
    },
    {
      "name": "removeLiquidityByRange",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fromBinId",
          "type": "i32"
        },
        {
          "name": "toBinId",
          "type": "i32"
        },
        {
          "name": "bpsToRemove",
          "type": "u16"
        }
      ]
    },
    {
      "name": "addLiquidityOneSidePrecise",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "binArrayLower",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayUpper",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "parameter",
          "type": {
            "defined": "AddLiquiditySingleSidePreciseParameter"
          }
        }
      ]
    },
    {
      "name": "goToABin",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "fromBinArray",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "toBinArray",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "binId",
          "type": "i32"
        }
      ]
    },
    {
      "name": "setPreActivationDuration",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "preActivationDuration",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setPreActivationSwapAddress",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "preActivationSwapAddress",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setPairStatusPermissionless",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "status",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeTokenBadge",
      "accounts": [
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenBadge",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
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
      "name": "createClaimProtocolFeeOperator",
      "accounts": [
        {
          "name": "claimFeeOperator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "operator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
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
      "name": "closeClaimProtocolFeeOperator",
      "accounts": [
        {
          "name": "claimFeeOperator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rentReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initializePresetParameter2",
      "accounts": [
        {
          "name": "presetParameter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "InitPresetParameters2Ix"
          }
        }
      ]
    },
    {
      "name": "initializeLbPair2",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenMintX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "presetParameter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenBadgeX",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenBadgeY",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenProgramX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "InitializeLbPair2Params"
          }
        }
      ]
    },
    {
      "name": "initializeCustomizablePermissionlessLbPair2",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenMintX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMintY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "funder",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenBadgeX",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenBadgeY",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "tokenProgramX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": "CustomizableParams"
          }
        }
      ]
    },
    {
      "name": "claimFee2",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramX",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgramY",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "minBinId",
          "type": "i32"
        },
        {
          "name": "maxBinId",
          "type": "i32"
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "claimReward2",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "userTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rewardIndex",
          "type": "u64"
        },
        {
          "name": "minBinId",
          "type": "i32"
        },
        {
          "name": "maxBinId",
          "type": "i32"
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "addLiquidity2",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "liquidityParameter",
          "type": {
            "defined": "LiquidityParameter"
          }
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "addLiquidityByStrategy2",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "liquidityParameter",
          "type": {
            "defined": "LiquidityParameterByStrategy"
          }
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "addLiquidityOneSidePrecise2",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserve",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "liquidityParameter",
          "type": {
            "defined": "AddLiquiditySingleSidePreciseParameter2"
          }
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "removeLiquidity2",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "binLiquidityRemoval",
          "type": {
            "vec": {
              "defined": "BinLiquidityReduction"
            }
          }
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "removeLiquidityByRange2",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "userTokenX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "fromBinId",
          "type": "i32"
        },
        {
          "name": "toBinId",
          "type": "i32"
        },
        {
          "name": "bpsToRemove",
          "type": "u16"
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "swap2",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenIn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenOut",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "hostFeeIn",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "minAmountOut",
          "type": "u64"
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "swapExactOut2",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenIn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenOut",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "hostFeeIn",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxInAmount",
          "type": "u64"
        },
        {
          "name": "outAmount",
          "type": "u64"
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "swapWithPriceImpact2",
      "accounts": [
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "binArrayBitmapExtension",
          "isMut": false,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "reserveX",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserveY",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenIn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userTokenOut",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenXMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "oracle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "hostFeeIn",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenXProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenYProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "memoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amountIn",
          "type": "u64"
        },
        {
          "name": "activeId",
          "type": {
            "option": "i32"
          }
        },
        {
          "name": "maxPriceImpactBps",
          "type": "u16"
        },
        {
          "name": "remainingAccountsInfo",
          "type": {
            "defined": "RemainingAccountsInfo"
          }
        }
      ]
    },
    {
      "name": "closePosition2",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "rentReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateFeesAndReward2",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "lbPair",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "minBinId",
          "type": "i32"
        },
        {
          "name": "maxBinId",
          "type": "i32"
        }
      ]
    },
    {
      "name": "closePositionIfEmpty",
      "accounts": [
        {
          "name": "position",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sender",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "rentReceiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "binArrayBitmapExtension",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lbPair",
            "type": "publicKey"
          },
          {
            "name": "positiveBinArrayBitmap",
            "docs": [
              "Packed initialized bin array state for start_bin_index is positive"
            ],
            "type": {
              "array": [
                {
                  "array": [
                    "u64",
                    8
                  ]
                },
                12
              ]
            }
          },
          {
            "name": "negativeBinArrayBitmap",
            "docs": [
              "Packed initialized bin array state for start_bin_index is negative"
            ],
            "type": {
              "array": [
                {
                  "array": [
                    "u64",
                    8
                  ]
                },
                12
              ]
            }
          }
        ]
      }
    },
    {
      "name": "binArray",
      "docs": [
        "An account to contain a range of bin. For example: Bin 100 <-> 200.",
        "For example:",
        "BinArray index: 0 contains bin 0 <-> 599",
        "index: 2 contains bin 600 <-> 1199, ..."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "i64"
          },
          {
            "name": "version",
            "docs": [
              "Version of binArray"
            ],
            "type": "u8"
          },
          {
            "name": "padding",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "lbPair",
            "type": "publicKey"
          },
          {
            "name": "bins",
            "type": {
              "array": [
                {
                  "defined": "Bin"
                },
                70
              ]
            }
          }
        ]
      }
    },
    {
      "name": "claimFeeOperator",
      "docs": [
        "Parameter that set by the protocol"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "operator",
            "docs": [
              "operator"
            ],
            "type": "publicKey"
          },
          {
            "name": "padding",
            "docs": [
              "Reserve"
            ],
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "lbPair",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "parameters",
            "type": {
              "defined": "StaticParameters"
            }
          },
          {
            "name": "vParameters",
            "type": {
              "defined": "VariableParameters"
            }
          },
          {
            "name": "bumpSeed",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "binStepSeed",
            "docs": [
              "Bin step signer seed"
            ],
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "pairType",
            "docs": [
              "Type of the pair"
            ],
            "type": "u8"
          },
          {
            "name": "activeId",
            "docs": [
              "Active bin id"
            ],
            "type": "i32"
          },
          {
            "name": "binStep",
            "docs": [
              "Bin step. Represent the price increment / decrement."
            ],
            "type": "u16"
          },
          {
            "name": "status",
            "docs": [
              "Status of the pair. Check PairStatus enum."
            ],
            "type": "u8"
          },
          {
            "name": "requireBaseFactorSeed",
            "docs": [
              "Require base factor seed"
            ],
            "type": "u8"
          },
          {
            "name": "baseFactorSeed",
            "docs": [
              "Base factor seed"
            ],
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "activationType",
            "docs": [
              "Activation type"
            ],
            "type": "u8"
          },
          {
            "name": "creatorPoolOnOffControl",
            "docs": [
              "Allow pool creator to enable/disable pool with restricted validation. Only applicable for customizable permissionless pair type."
            ],
            "type": "u8"
          },
          {
            "name": "tokenXMint",
            "docs": [
              "Token X mint"
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenYMint",
            "docs": [
              "Token Y mint"
            ],
            "type": "publicKey"
          },
          {
            "name": "reserveX",
            "docs": [
              "LB token X vault"
            ],
            "type": "publicKey"
          },
          {
            "name": "reserveY",
            "docs": [
              "LB token Y vault"
            ],
            "type": "publicKey"
          },
          {
            "name": "protocolFee",
            "docs": [
              "Uncollected protocol fee"
            ],
            "type": {
              "defined": "ProtocolFee"
            }
          },
          {
            "name": "padding1",
            "docs": [
              "_padding_1, previous Fee owner, BE CAREFUL FOR TOMBSTONE WHEN REUSE !!"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "rewardInfos",
            "docs": [
              "Farming reward information"
            ],
            "type": {
              "array": [
                {
                  "defined": "RewardInfo"
                },
                2
              ]
            }
          },
          {
            "name": "oracle",
            "docs": [
              "Oracle pubkey"
            ],
            "type": "publicKey"
          },
          {
            "name": "binArrayBitmap",
            "docs": [
              "Packed initialized bin array state"
            ],
            "type": {
              "array": [
                "u64",
                16
              ]
            }
          },
          {
            "name": "lastUpdatedAt",
            "docs": [
              "Last time the pool fee parameter was updated"
            ],
            "type": "i64"
          },
          {
            "name": "padding2",
            "docs": [
              "_padding_2, previous whitelisted_wallet, BE CAREFUL FOR TOMBSTONE WHEN REUSE !!"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "preActivationSwapAddress",
            "docs": [
              "Address allowed to swap when the current point is greater than or equal to the pre-activation point. The pre-activation point is calculated as `activation_point - pre_activation_duration`."
            ],
            "type": "publicKey"
          },
          {
            "name": "baseKey",
            "docs": [
              "Base keypair. Only required for permission pair"
            ],
            "type": "publicKey"
          },
          {
            "name": "activationPoint",
            "docs": [
              "Time point to enable the pair. Only applicable for permission pair."
            ],
            "type": "u64"
          },
          {
            "name": "preActivationDuration",
            "docs": [
              "Duration before activation activation_point. Used to calculate pre-activation time point for pre_activation_swap_address"
            ],
            "type": "u64"
          },
          {
            "name": "padding3",
            "docs": [
              "_padding 3 is reclaimed free space from swap_cap_deactivate_point and swap_cap_amount before, BE CAREFUL FOR TOMBSTONE WHEN REUSE !!"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "padding4",
            "docs": [
              "_padding_4, previous lock_duration, BE CAREFUL FOR TOMBSTONE WHEN REUSE !!"
            ],
            "type": "u64"
          },
          {
            "name": "creator",
            "docs": [
              "Pool creator"
            ],
            "type": "publicKey"
          },
          {
            "name": "tokenMintXProgramFlag",
            "docs": [
              "token_mint_x_program_flag"
            ],
            "type": "u8"
          },
          {
            "name": "tokenMintYProgramFlag",
            "docs": [
              "token_mint_y_program_flag"
            ],
            "type": "u8"
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved space for future use"
            ],
            "type": {
              "array": [
                "u8",
                22
              ]
            }
          }
        ]
      }
    },
    {
      "name": "oracle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "idx",
            "docs": [
              "Index of latest observation"
            ],
            "type": "u64"
          },
          {
            "name": "activeSize",
            "docs": [
              "Size of active sample. Active sample is initialized observation."
            ],
            "type": "u64"
          },
          {
            "name": "length",
            "docs": [
              "Number of observations"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lbPair",
            "docs": [
              "The LB pair of this position"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "docs": [
              "Owner of the position. Client rely on this to to fetch their positions."
            ],
            "type": "publicKey"
          },
          {
            "name": "liquidityShares",
            "docs": [
              "Liquidity shares of this position in bins (lower_bin_id <-> upper_bin_id). This is the same as LP concept."
            ],
            "type": {
              "array": [
                "u64",
                70
              ]
            }
          },
          {
            "name": "rewardInfos",
            "docs": [
              "Farming reward information"
            ],
            "type": {
              "array": [
                {
                  "defined": "UserRewardInfo"
                },
                70
              ]
            }
          },
          {
            "name": "feeInfos",
            "docs": [
              "Swap fee to claim information"
            ],
            "type": {
              "array": [
                {
                  "defined": "FeeInfo"
                },
                70
              ]
            }
          },
          {
            "name": "lowerBinId",
            "docs": [
              "Lower bin ID"
            ],
            "type": "i32"
          },
          {
            "name": "upperBinId",
            "docs": [
              "Upper bin ID"
            ],
            "type": "i32"
          },
          {
            "name": "lastUpdatedAt",
            "docs": [
              "Last updated timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "totalClaimedFeeXAmount",
            "docs": [
              "Total claimed token fee X"
            ],
            "type": "u64"
          },
          {
            "name": "totalClaimedFeeYAmount",
            "docs": [
              "Total claimed token fee Y"
            ],
            "type": "u64"
          },
          {
            "name": "totalClaimedRewards",
            "docs": [
              "Total claimed rewards"
            ],
            "type": {
              "array": [
                "u64",
                2
              ]
            }
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved space for future use"
            ],
            "type": {
              "array": [
                "u8",
                160
              ]
            }
          }
        ]
      }
    },
    {
      "name": "positionV2",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "lbPair",
            "docs": [
              "The LB pair of this position"
            ],
            "type": "publicKey"
          },
          {
            "name": "owner",
            "docs": [
              "Owner of the position. Client rely on this to to fetch their positions."
            ],
            "type": "publicKey"
          },
          {
            "name": "liquidityShares",
            "docs": [
              "Liquidity shares of this position in bins (lower_bin_id <-> upper_bin_id). This is the same as LP concept."
            ],
            "type": {
              "array": [
                "u128",
                70
              ]
            }
          },
          {
            "name": "rewardInfos",
            "docs": [
              "Farming reward information"
            ],
            "type": {
              "array": [
                {
                  "defined": "UserRewardInfo"
                },
                70
              ]
            }
          },
          {
            "name": "feeInfos",
            "docs": [
              "Swap fee to claim information"
            ],
            "type": {
              "array": [
                {
                  "defined": "FeeInfo"
                },
                70
              ]
            }
          },
          {
            "name": "lowerBinId",
            "docs": [
              "Lower bin ID"
            ],
            "type": "i32"
          },
          {
            "name": "upperBinId",
            "docs": [
              "Upper bin ID"
            ],
            "type": "i32"
          },
          {
            "name": "lastUpdatedAt",
            "docs": [
              "Last updated timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "totalClaimedFeeXAmount",
            "docs": [
              "Total claimed token fee X"
            ],
            "type": "u64"
          },
          {
            "name": "totalClaimedFeeYAmount",
            "docs": [
              "Total claimed token fee Y"
            ],
            "type": "u64"
          },
          {
            "name": "totalClaimedRewards",
            "docs": [
              "Total claimed rewards"
            ],
            "type": {
              "array": [
                "u64",
                2
              ]
            }
          },
          {
            "name": "operator",
            "docs": [
              "Operator of position"
            ],
            "type": "publicKey"
          },
          {
            "name": "lockReleasePoint",
            "docs": [
              "Time point which the locked liquidity can be withdraw"
            ],
            "type": "u64"
          },
          {
            "name": "padding0",
            "docs": [
              "_padding_0, previous subjected_to_bootstrap_liquidity_locking, BE CAREFUL FOR TOMBSTONE WHEN REUSE !!"
            ],
            "type": "u8"
          },
          {
            "name": "feeOwner",
            "docs": [
              "Address is able to claim fee in this position, only valid for bootstrap_liquidity_position"
            ],
            "type": "publicKey"
          },
          {
            "name": "reserved",
            "docs": [
              "Reserved space for future use"
            ],
            "type": {
              "array": [
                "u8",
                87
              ]
            }
          }
        ]
      }
    },
    {
      "name": "presetParameter2",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "binStep",
            "docs": [
              "Bin step. Represent the price increment / decrement."
            ],
            "type": "u16"
          },
          {
            "name": "baseFactor",
            "docs": [
              "Used for base fee calculation. base_fee_rate = base_factor * bin_step * 10 * 10^base_fee_power_factor"
            ],
            "type": "u16"
          },
          {
            "name": "filterPeriod",
            "docs": [
              "Filter period determine high frequency trading time window."
            ],
            "type": "u16"
          },
          {
            "name": "decayPeriod",
            "docs": [
              "Decay period determine when the volatile fee start decay / decrease."
            ],
            "type": "u16"
          },
          {
            "name": "variableFeeControl",
            "docs": [
              "Used to scale the variable fee component depending on the dynamic of the market"
            ],
            "type": "u32"
          },
          {
            "name": "maxVolatilityAccumulator",
            "docs": [
              "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
            ],
            "type": "u32"
          },
          {
            "name": "reductionFactor",
            "docs": [
              "Reduction factor controls the volatile fee rate decrement rate."
            ],
            "type": "u16"
          },
          {
            "name": "protocolShare",
            "docs": [
              "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
            ],
            "type": "u16"
          },
          {
            "name": "index",
            "docs": [
              "index"
            ],
            "type": "u16"
          },
          {
            "name": "baseFeePowerFactor",
            "docs": [
              "Base fee power factor"
            ],
            "type": "u8"
          },
          {
            "name": "padding0",
            "docs": [
              "Padding 0 for future use"
            ],
            "type": "u8"
          },
          {
            "name": "padding1",
            "docs": [
              "Padding 1 for future use"
            ],
            "type": {
              "array": [
                "u64",
                20
              ]
            }
          }
        ]
      }
    },
    {
      "name": "presetParameter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "binStep",
            "docs": [
              "Bin step. Represent the price increment / decrement."
            ],
            "type": "u16"
          },
          {
            "name": "baseFactor",
            "docs": [
              "Used for base fee calculation. base_fee_rate = base_factor * bin_step * 10 * 10^base_fee_power_factor"
            ],
            "type": "u16"
          },
          {
            "name": "filterPeriod",
            "docs": [
              "Filter period determine high frequency trading time window."
            ],
            "type": "u16"
          },
          {
            "name": "decayPeriod",
            "docs": [
              "Decay period determine when the volatile fee start decay / decrease."
            ],
            "type": "u16"
          },
          {
            "name": "reductionFactor",
            "docs": [
              "Reduction factor controls the volatile fee rate decrement rate."
            ],
            "type": "u16"
          },
          {
            "name": "variableFeeControl",
            "docs": [
              "Used to scale the variable fee component depending on the dynamic of the market"
            ],
            "type": "u32"
          },
          {
            "name": "maxVolatilityAccumulator",
            "docs": [
              "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
            ],
            "type": "u32"
          },
          {
            "name": "minBinId",
            "docs": [
              "Min bin id supported by the pool based on the configured bin step."
            ],
            "type": "i32"
          },
          {
            "name": "maxBinId",
            "docs": [
              "Max bin id supported by the pool based on the configured bin step."
            ],
            "type": "i32"
          },
          {
            "name": "protocolShare",
            "docs": [
              "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
            ],
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "tokenBadge",
      "docs": [
        "Parameter that set by the protocol"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenMint",
            "docs": [
              "token mint"
            ],
            "type": "publicKey"
          },
          {
            "name": "padding",
            "docs": [
              "Reserve"
            ],
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitPresetParameters2Ix",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u16"
          },
          {
            "name": "binStep",
            "docs": [
              "Bin step. Represent the price increment / decrement."
            ],
            "type": "u16"
          },
          {
            "name": "baseFactor",
            "docs": [
              "Used for base fee calculation. base_fee_rate = base_factor * bin_step * 10 * 10^base_fee_power_factor"
            ],
            "type": "u16"
          },
          {
            "name": "filterPeriod",
            "docs": [
              "Filter period determine high frequency trading time window."
            ],
            "type": "u16"
          },
          {
            "name": "decayPeriod",
            "docs": [
              "Decay period determine when the volatile fee start decay / decrease."
            ],
            "type": "u16"
          },
          {
            "name": "reductionFactor",
            "docs": [
              "Reduction factor controls the volatile fee rate decrement rate."
            ],
            "type": "u16"
          },
          {
            "name": "variableFeeControl",
            "docs": [
              "Used to scale the variable fee component depending on the dynamic of the market"
            ],
            "type": "u32"
          },
          {
            "name": "maxVolatilityAccumulator",
            "docs": [
              "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
            ],
            "type": "u32"
          },
          {
            "name": "protocolShare",
            "docs": [
              "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
            ],
            "type": "u16"
          },
          {
            "name": "baseFeePowerFactor",
            "docs": [
              "Base fee power factor"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "InitPresetParametersIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "binStep",
            "docs": [
              "Bin step. Represent the price increment / decrement."
            ],
            "type": "u16"
          },
          {
            "name": "baseFactor",
            "docs": [
              "Used for base fee calculation. base_fee_rate = base_factor * bin_step * 10 * 10^base_fee_power_factor"
            ],
            "type": "u16"
          },
          {
            "name": "filterPeriod",
            "docs": [
              "Filter period determine high frequency trading time window."
            ],
            "type": "u16"
          },
          {
            "name": "decayPeriod",
            "docs": [
              "Decay period determine when the volatile fee start decay / decrease."
            ],
            "type": "u16"
          },
          {
            "name": "reductionFactor",
            "docs": [
              "Reduction factor controls the volatile fee rate decrement rate."
            ],
            "type": "u16"
          },
          {
            "name": "variableFeeControl",
            "docs": [
              "Used to scale the variable fee component depending on the dynamic of the market"
            ],
            "type": "u32"
          },
          {
            "name": "maxVolatilityAccumulator",
            "docs": [
              "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
            ],
            "type": "u32"
          },
          {
            "name": "protocolShare",
            "docs": [
              "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
            ],
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "BaseFeeParameter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "protocolShare",
            "docs": [
              "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
            ],
            "type": "u16"
          },
          {
            "name": "baseFactor",
            "docs": [
              "Base factor for base fee rate"
            ],
            "type": "u16"
          },
          {
            "name": "baseFeePowerFactor",
            "docs": [
              "Base fee power factor"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "DynamicFeeParameter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "filterPeriod",
            "docs": [
              "Filter period determine high frequency trading time window."
            ],
            "type": "u16"
          },
          {
            "name": "decayPeriod",
            "docs": [
              "Decay period determine when the volatile fee start decay / decrease."
            ],
            "type": "u16"
          },
          {
            "name": "reductionFactor",
            "docs": [
              "Reduction factor controls the volatile fee rate decrement rate."
            ],
            "type": "u16"
          },
          {
            "name": "variableFeeControl",
            "docs": [
              "Used to scale the variable fee component depending on the dynamic of the market"
            ],
            "type": "u32"
          },
          {
            "name": "maxVolatilityAccumulator",
            "docs": [
              "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
            ],
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "LiquidityParameterByStrategyOneSide",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "docs": [
              "Amount of X token or Y token to deposit"
            ],
            "type": "u64"
          },
          {
            "name": "activeId",
            "docs": [
              "Active bin that integrator observe off-chain"
            ],
            "type": "i32"
          },
          {
            "name": "maxActiveBinSlippage",
            "docs": [
              "max active bin slippage allowed"
            ],
            "type": "i32"
          },
          {
            "name": "strategyParameters",
            "docs": [
              "strategy parameters"
            ],
            "type": {
              "defined": "StrategyParameters"
            }
          }
        ]
      }
    },
    {
      "name": "LiquidityParameterByStrategy",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amountX",
            "docs": [
              "Amount of X token to deposit"
            ],
            "type": "u64"
          },
          {
            "name": "amountY",
            "docs": [
              "Amount of Y token to deposit"
            ],
            "type": "u64"
          },
          {
            "name": "activeId",
            "docs": [
              "Active bin that integrator observe off-chain"
            ],
            "type": "i32"
          },
          {
            "name": "maxActiveBinSlippage",
            "docs": [
              "max active bin slippage allowed"
            ],
            "type": "i32"
          },
          {
            "name": "strategyParameters",
            "docs": [
              "strategy parameters"
            ],
            "type": {
              "defined": "StrategyParameters"
            }
          }
        ]
      }
    },
    {
      "name": "StrategyParameters",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "minBinId",
            "docs": [
              "min bin id"
            ],
            "type": "i32"
          },
          {
            "name": "maxBinId",
            "docs": [
              "max bin id"
            ],
            "type": "i32"
          },
          {
            "name": "strategyType",
            "docs": [
              "strategy type"
            ],
            "type": {
              "defined": "StrategyType"
            }
          },
          {
            "name": "parameteres",
            "docs": [
              "parameters"
            ],
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "LiquidityOneSideParameter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "docs": [
              "Amount of X token or Y token to deposit"
            ],
            "type": "u64"
          },
          {
            "name": "activeId",
            "docs": [
              "Active bin that integrator observe off-chain"
            ],
            "type": "i32"
          },
          {
            "name": "maxActiveBinSlippage",
            "docs": [
              "max active bin slippage allowed"
            ],
            "type": "i32"
          },
          {
            "name": "binLiquidityDist",
            "docs": [
              "Liquidity distribution to each bins"
            ],
            "type": {
              "vec": {
                "defined": "BinLiquidityDistributionByWeight"
              }
            }
          }
        ]
      }
    },
    {
      "name": "BinLiquidityDistributionByWeight",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "binId",
            "docs": [
              "Define the bin ID wish to deposit to."
            ],
            "type": "i32"
          },
          {
            "name": "weight",
            "docs": [
              "weight of liquidity distributed for this bin id"
            ],
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "LiquidityParameterByWeight",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amountX",
            "docs": [
              "Amount of X token to deposit"
            ],
            "type": "u64"
          },
          {
            "name": "amountY",
            "docs": [
              "Amount of Y token to deposit"
            ],
            "type": "u64"
          },
          {
            "name": "activeId",
            "docs": [
              "Active bin that integrator observe off-chain"
            ],
            "type": "i32"
          },
          {
            "name": "maxActiveBinSlippage",
            "docs": [
              "max active bin slippage allowed"
            ],
            "type": "i32"
          },
          {
            "name": "binLiquidityDist",
            "docs": [
              "Liquidity distribution to each bins"
            ],
            "type": {
              "vec": {
                "defined": "BinLiquidityDistributionByWeight"
              }
            }
          }
        ]
      }
    },
    {
      "name": "AddLiquiditySingleSidePreciseParameter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bins",
            "type": {
              "vec": {
                "defined": "CompressedBinDepositAmount"
              }
            }
          },
          {
            "name": "decompressMultiplier",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "CompressedBinDepositAmount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "binId",
            "type": "i32"
          },
          {
            "name": "amount",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "BinLiquidityDistribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "binId",
            "docs": [
              "Define the bin ID wish to deposit to."
            ],
            "type": "i32"
          },
          {
            "name": "distributionX",
            "docs": [
              "DistributionX (or distributionY) is the percentages of amountX (or amountY) you want to add to each bin."
            ],
            "type": "u16"
          },
          {
            "name": "distributionY",
            "docs": [
              "DistributionX (or distributionY) is the percentages of amountX (or amountY) you want to add to each bin."
            ],
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "LiquidityParameter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amountX",
            "docs": [
              "Amount of X token to deposit"
            ],
            "type": "u64"
          },
          {
            "name": "amountY",
            "docs": [
              "Amount of Y token to deposit"
            ],
            "type": "u64"
          },
          {
            "name": "binLiquidityDist",
            "docs": [
              "Liquidity distribution to each bins"
            ],
            "type": {
              "vec": {
                "defined": "BinLiquidityDistribution"
              }
            }
          }
        ]
      }
    },
    {
      "name": "CustomizableParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "activeId",
            "docs": [
              "Pool price"
            ],
            "type": "i32"
          },
          {
            "name": "binStep",
            "docs": [
              "Bin step"
            ],
            "type": "u16"
          },
          {
            "name": "baseFactor",
            "docs": [
              "Base factor"
            ],
            "type": "u16"
          },
          {
            "name": "activationType",
            "docs": [
              "Activation type. 0 = Slot, 1 = Time. Check ActivationType enum"
            ],
            "type": "u8"
          },
          {
            "name": "hasAlphaVault",
            "docs": [
              "Whether the pool has an alpha vault"
            ],
            "type": "bool"
          },
          {
            "name": "activationPoint",
            "docs": [
              "Decide when does the pool start trade. None = Now"
            ],
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "creatorPoolOnOffControl",
            "docs": [
              "Pool creator have permission to enable/disable pool with restricted program validation. Only applicable for customizable permissionless pool."
            ],
            "type": "bool"
          },
          {
            "name": "baseFeePowerFactor",
            "docs": [
              "Base fee power factor"
            ],
            "type": "u8"
          },
          {
            "name": "padding",
            "docs": [
              "Padding, for future use"
            ],
            "type": {
              "array": [
                "u8",
                62
              ]
            }
          }
        ]
      }
    },
    {
      "name": "InitPermissionPairIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "activeId",
            "type": "i32"
          },
          {
            "name": "binStep",
            "type": "u16"
          },
          {
            "name": "baseFactor",
            "type": "u16"
          },
          {
            "name": "baseFeePowerFactor",
            "type": "u8"
          },
          {
            "name": "activationType",
            "type": "u8"
          },
          {
            "name": "protocolShare",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "AddLiquiditySingleSidePreciseParameter2",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bins",
            "type": {
              "vec": {
                "defined": "CompressedBinDepositAmount"
              }
            }
          },
          {
            "name": "decompressMultiplier",
            "type": "u64"
          },
          {
            "name": "maxAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "CompressedBinDepositAmount2",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "binId",
            "type": "i32"
          },
          {
            "name": "amount",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "InitializeLbPair2Params",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "activeId",
            "docs": [
              "Pool price"
            ],
            "type": "i32"
          },
          {
            "name": "padding",
            "docs": [
              "Padding, for future use"
            ],
            "type": {
              "array": [
                "u8",
                96
              ]
            }
          }
        ]
      }
    },
    {
      "name": "BinLiquidityReduction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "binId",
            "type": "i32"
          },
          {
            "name": "bpsToRemove",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "Bin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amountX",
            "docs": [
              "Amount of token X in the bin. This already excluded protocol fees."
            ],
            "type": "u64"
          },
          {
            "name": "amountY",
            "docs": [
              "Amount of token Y in the bin. This already excluded protocol fees."
            ],
            "type": "u64"
          },
          {
            "name": "price",
            "docs": [
              "Bin price"
            ],
            "type": "u128"
          },
          {
            "name": "liquiditySupply",
            "docs": [
              "Liquidities of the bin. This is the same as LP mint supply. q-number"
            ],
            "type": "u128"
          },
          {
            "name": "rewardPerTokenStored",
            "docs": [
              "reward_a_per_token_stored"
            ],
            "type": {
              "array": [
                "u128",
                2
              ]
            }
          },
          {
            "name": "feeAmountXPerTokenStored",
            "docs": [
              "Swap fee amount of token X per liquidity deposited."
            ],
            "type": "u128"
          },
          {
            "name": "feeAmountYPerTokenStored",
            "docs": [
              "Swap fee amount of token Y per liquidity deposited."
            ],
            "type": "u128"
          },
          {
            "name": "amountXIn",
            "docs": [
              "Total token X swap into the bin. Only used for tracking purpose."
            ],
            "type": "u128"
          },
          {
            "name": "amountYIn",
            "docs": [
              "Total token Y swap into he bin. Only used for tracking purpose."
            ],
            "type": "u128"
          }
        ]
      }
    },
    {
      "name": "ProtocolFee",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amountX",
            "type": "u64"
          },
          {
            "name": "amountY",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "RewardInfo",
      "docs": [
        "Stores the state relevant for tracking liquidity mining rewards"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "docs": [
              "Reward token mint."
            ],
            "type": "publicKey"
          },
          {
            "name": "vault",
            "docs": [
              "Reward vault token account."
            ],
            "type": "publicKey"
          },
          {
            "name": "funder",
            "docs": [
              "Authority account that allows to fund rewards"
            ],
            "type": "publicKey"
          },
          {
            "name": "rewardDuration",
            "docs": [
              "TODO check whether we need to store it in pool"
            ],
            "type": "u64"
          },
          {
            "name": "rewardDurationEnd",
            "docs": [
              "TODO check whether we need to store it in pool"
            ],
            "type": "u64"
          },
          {
            "name": "rewardRate",
            "docs": [
              "TODO check whether we need to store it in pool"
            ],
            "type": "u128"
          },
          {
            "name": "lastUpdateTime",
            "docs": [
              "The last time reward states were updated."
            ],
            "type": "u64"
          },
          {
            "name": "cumulativeSecondsWithEmptyLiquidityReward",
            "docs": [
              "Accumulated seconds where when farm distribute rewards, but the bin is empty. The reward will be accumulated for next reward time window."
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Observation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cumulativeActiveBinId",
            "docs": [
              "Cumulative active bin ID"
            ],
            "type": "i128"
          },
          {
            "name": "createdAt",
            "docs": [
              "Observation sample created timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "lastUpdatedAt",
            "docs": [
              "Observation sample last updated timestamp"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "StaticParameters",
      "docs": [
        "Parameter that set by the protocol"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "baseFactor",
            "docs": [
              "Used for base fee calculation. base_fee_rate = base_factor * bin_step * 10 * 10^base_fee_power_factor"
            ],
            "type": "u16"
          },
          {
            "name": "filterPeriod",
            "docs": [
              "Filter period determine high frequency trading time window."
            ],
            "type": "u16"
          },
          {
            "name": "decayPeriod",
            "docs": [
              "Decay period determine when the volatile fee start decay / decrease."
            ],
            "type": "u16"
          },
          {
            "name": "reductionFactor",
            "docs": [
              "Reduction factor controls the volatile fee rate decrement rate."
            ],
            "type": "u16"
          },
          {
            "name": "variableFeeControl",
            "docs": [
              "Used to scale the variable fee component depending on the dynamic of the market"
            ],
            "type": "u32"
          },
          {
            "name": "maxVolatilityAccumulator",
            "docs": [
              "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
            ],
            "type": "u32"
          },
          {
            "name": "minBinId",
            "docs": [
              "Min bin id supported by the pool based on the configured bin step."
            ],
            "type": "i32"
          },
          {
            "name": "maxBinId",
            "docs": [
              "Max bin id supported by the pool based on the configured bin step."
            ],
            "type": "i32"
          },
          {
            "name": "protocolShare",
            "docs": [
              "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
            ],
            "type": "u16"
          },
          {
            "name": "baseFeePowerFactor",
            "docs": [
              "Base fee power factor"
            ],
            "type": "u8"
          },
          {
            "name": "padding",
            "docs": [
              "Padding for bytemuck safe alignment"
            ],
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          }
        ]
      }
    },
    {
      "name": "VariableParameters",
      "docs": [
        "Parameters that changes based on dynamic of the market"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "volatilityAccumulator",
            "docs": [
              "Volatility accumulator measure the number of bin crossed since reference bin ID. Normally (without filter period taken into consideration), reference bin ID is the active bin of last swap.",
              "It affects the variable fee rate"
            ],
            "type": "u32"
          },
          {
            "name": "volatilityReference",
            "docs": [
              "Volatility reference is decayed volatility accumulator. It is always <= volatility_accumulator"
            ],
            "type": "u32"
          },
          {
            "name": "indexReference",
            "docs": [
              "Active bin id of last swap."
            ],
            "type": "i32"
          },
          {
            "name": "padding",
            "docs": [
              "Padding for bytemuck safe alignment"
            ],
            "type": {
              "array": [
                "u8",
                4
              ]
            }
          },
          {
            "name": "lastUpdateTimestamp",
            "docs": [
              "Last timestamp the variable parameters was updated"
            ],
            "type": "i64"
          },
          {
            "name": "padding1",
            "docs": [
              "Padding for bytemuck safe alignment"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          }
        ]
      }
    },
    {
      "name": "FeeInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeXPerTokenComplete",
            "type": "u128"
          },
          {
            "name": "feeYPerTokenComplete",
            "type": "u128"
          },
          {
            "name": "feeXPending",
            "type": "u64"
          },
          {
            "name": "feeYPending",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UserRewardInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewardPerTokenCompletes",
            "type": {
              "array": [
                "u128",
                2
              ]
            }
          },
          {
            "name": "rewardPendings",
            "type": {
              "array": [
                "u64",
                2
              ]
            }
          }
        ]
      }
    },
    {
      "name": "RemainingAccountsSlice",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "accountsType",
            "type": {
              "defined": "AccountsType"
            }
          },
          {
            "name": "length",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "RemainingAccountsInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "slices",
            "type": {
              "vec": {
                "defined": "RemainingAccountsSlice"
              }
            }
          }
        ]
      }
    },
    {
      "name": "StrategyType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "SpotOneSide"
          },
          {
            "name": "CurveOneSide"
          },
          {
            "name": "BidAskOneSide"
          },
          {
            "name": "SpotBalanced"
          },
          {
            "name": "CurveBalanced"
          },
          {
            "name": "BidAskBalanced"
          },
          {
            "name": "SpotImBalanced"
          },
          {
            "name": "CurveImBalanced"
          },
          {
            "name": "BidAskImBalanced"
          }
        ]
      }
    },
    {
      "name": "Rounding",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Up"
          },
          {
            "name": "Down"
          }
        ]
      }
    },
    {
      "name": "ActivationType",
      "docs": [
        "Type of the activation"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Slot"
          },
          {
            "name": "Timestamp"
          }
        ]
      }
    },
    {
      "name": "LayoutVersion",
      "docs": [
        "Layout version"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "V0"
          },
          {
            "name": "V1"
          }
        ]
      }
    },
    {
      "name": "PairType",
      "docs": [
        "Type of the Pair. 0 = Permissionless, 1 = Permission, 2 = CustomizablePermissionless. Putting 0 as permissionless for backward compatibility."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Permissionless"
          },
          {
            "name": "Permission"
          },
          {
            "name": "CustomizablePermissionless"
          },
          {
            "name": "PermissionlessV2"
          }
        ]
      }
    },
    {
      "name": "PairStatus",
      "docs": [
        "Pair status. 0 = Enabled, 1 = Disabled. Putting 0 as enabled for backward compatibility."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Enabled"
          },
          {
            "name": "Disabled"
          }
        ]
      }
    },
    {
      "name": "TokenProgramFlags",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TokenProgram"
          },
          {
            "name": "TokenProgram2022"
          }
        ]
      }
    },
    {
      "name": "AccountsType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TransferHookX"
          },
          {
            "name": "TransferHookY"
          },
          {
            "name": "TransferHookReward"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CompositionFee",
      "fields": [
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "binId",
          "type": "i16",
          "index": false
        },
        {
          "name": "tokenXFeeAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenYFeeAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "protocolTokenXFeeAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "protocolTokenYFeeAmount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "AddLiquidity",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "position",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amounts",
          "type": {
            "array": [
              "u64",
              2
            ]
          },
          "index": false
        },
        {
          "name": "activeBinId",
          "type": "i32",
          "index": false
        }
      ]
    },
    {
      "name": "RemoveLiquidity",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "position",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amounts",
          "type": {
            "array": [
              "u64",
              2
            ]
          },
          "index": false
        },
        {
          "name": "activeBinId",
          "type": "i32",
          "index": false
        }
      ]
    },
    {
      "name": "Swap",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "from",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "startBinId",
          "type": "i32",
          "index": false
        },
        {
          "name": "endBinId",
          "type": "i32",
          "index": false
        },
        {
          "name": "amountIn",
          "type": "u64",
          "index": false
        },
        {
          "name": "amountOut",
          "type": "u64",
          "index": false
        },
        {
          "name": "swapForY",
          "type": "bool",
          "index": false
        },
        {
          "name": "fee",
          "type": "u64",
          "index": false
        },
        {
          "name": "protocolFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "feeBps",
          "type": "u128",
          "index": false
        },
        {
          "name": "hostFee",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ClaimReward",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "position",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "rewardIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "totalReward",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "FundReward",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "funder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "rewardIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "InitializeReward",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "rewardMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "funder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "rewardIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "rewardDuration",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateRewardDuration",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "rewardIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldRewardDuration",
          "type": "u64",
          "index": false
        },
        {
          "name": "newRewardDuration",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateRewardFunder",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "rewardIndex",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldFunder",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newFunder",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "PositionClose",
      "fields": [
        {
          "name": "position",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "ClaimFee",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "position",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "feeX",
          "type": "u64",
          "index": false
        },
        {
          "name": "feeY",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "LbPairCreate",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "binStep",
          "type": "u16",
          "index": false
        },
        {
          "name": "tokenX",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "tokenY",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "PositionCreate",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "position",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "IncreasePositionLength",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "position",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "lengthToAdd",
          "type": "u16",
          "index": false
        },
        {
          "name": "side",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "DecreasePositionLength",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "position",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "lengthToRemove",
          "type": "u16",
          "index": false
        },
        {
          "name": "side",
          "type": "u8",
          "index": false
        }
      ]
    },
    {
      "name": "FeeParameterUpdate",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "protocolShare",
          "type": "u16",
          "index": false
        },
        {
          "name": "baseFactor",
          "type": "u16",
          "index": false
        }
      ]
    },
    {
      "name": "DynamicFeeParameterUpdate",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "filterPeriod",
          "type": "u16",
          "index": false
        },
        {
          "name": "decayPeriod",
          "type": "u16",
          "index": false
        },
        {
          "name": "reductionFactor",
          "type": "u16",
          "index": false
        },
        {
          "name": "variableFeeControl",
          "type": "u32",
          "index": false
        },
        {
          "name": "maxVolatilityAccumulator",
          "type": "u32",
          "index": false
        }
      ]
    },
    {
      "name": "IncreaseObservation",
      "fields": [
        {
          "name": "oracle",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newObservationLength",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawIneligibleReward",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "rewardMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "UpdatePositionOperator",
      "fields": [
        {
          "name": "position",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldOperator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newOperator",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "UpdatePositionLockReleasePoint",
      "fields": [
        {
          "name": "position",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "currentPoint",
          "type": "u64",
          "index": false
        },
        {
          "name": "newLockReleasePoint",
          "type": "u64",
          "index": false
        },
        {
          "name": "oldLockReleasePoint",
          "type": "u64",
          "index": false
        },
        {
          "name": "sender",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "GoToABin",
      "fields": [
        {
          "name": "lbPair",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "fromBinId",
          "type": "i32",
          "index": false
        },
        {
          "name": "toBinId",
          "type": "i32",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6e3,
      "name": "InvalidStartBinIndex",
      "msg": "Invalid start bin index"
    },
    {
      "code": 6001,
      "name": "InvalidBinId",
      "msg": "Invalid bin id"
    },
    {
      "code": 6002,
      "name": "InvalidInput",
      "msg": "Invalid input data"
    },
    {
      "code": 6003,
      "name": "ExceededAmountSlippageTolerance",
      "msg": "Exceeded amount slippage tolerance"
    },
    {
      "code": 6004,
      "name": "ExceededBinSlippageTolerance",
      "msg": "Exceeded bin slippage tolerance"
    },
    {
      "code": 6005,
      "name": "CompositionFactorFlawed",
      "msg": "Composition factor flawed"
    },
    {
      "code": 6006,
      "name": "NonPresetBinStep",
      "msg": "Non preset bin step"
    },
    {
      "code": 6007,
      "name": "ZeroLiquidity",
      "msg": "Zero liquidity"
    },
    {
      "code": 6008,
      "name": "InvalidPosition",
      "msg": "Invalid position"
    },
    {
      "code": 6009,
      "name": "BinArrayNotFound",
      "msg": "Bin array not found"
    },
    {
      "code": 6010,
      "name": "InvalidTokenMint",
      "msg": "Invalid token mint"
    },
    {
      "code": 6011,
      "name": "InvalidAccountForSingleDeposit",
      "msg": "Invalid account for single deposit"
    },
    {
      "code": 6012,
      "name": "PairInsufficientLiquidity",
      "msg": "Pair insufficient liquidity"
    },
    {
      "code": 6013,
      "name": "InvalidFeeOwner",
      "msg": "Invalid fee owner"
    },
    {
      "code": 6014,
      "name": "InvalidFeeWithdrawAmount",
      "msg": "Invalid fee withdraw amount"
    },
    {
      "code": 6015,
      "name": "InvalidAdmin",
      "msg": "Invalid admin"
    },
    {
      "code": 6016,
      "name": "IdenticalFeeOwner",
      "msg": "Identical fee owner"
    },
    {
      "code": 6017,
      "name": "InvalidBps",
      "msg": "Invalid basis point"
    },
    {
      "code": 6018,
      "name": "MathOverflow",
      "msg": "Math operation overflow"
    },
    {
      "code": 6019,
      "name": "TypeCastFailed",
      "msg": "Type cast error"
    },
    {
      "code": 6020,
      "name": "InvalidRewardIndex",
      "msg": "Invalid reward index"
    },
    {
      "code": 6021,
      "name": "InvalidRewardDuration",
      "msg": "Invalid reward duration"
    },
    {
      "code": 6022,
      "name": "RewardInitialized",
      "msg": "Reward already initialized"
    },
    {
      "code": 6023,
      "name": "RewardUninitialized",
      "msg": "Reward not initialized"
    },
    {
      "code": 6024,
      "name": "IdenticalFunder",
      "msg": "Identical funder"
    },
    {
      "code": 6025,
      "name": "RewardCampaignInProgress",
      "msg": "Reward campaign in progress"
    },
    {
      "code": 6026,
      "name": "IdenticalRewardDuration",
      "msg": "Reward duration is the same"
    },
    {
      "code": 6027,
      "name": "InvalidBinArray",
      "msg": "Invalid bin array"
    },
    {
      "code": 6028,
      "name": "NonContinuousBinArrays",
      "msg": "Bin arrays must be continuous"
    },
    {
      "code": 6029,
      "name": "InvalidRewardVault",
      "msg": "Invalid reward vault"
    },
    {
      "code": 6030,
      "name": "NonEmptyPosition",
      "msg": "Position is not empty"
    },
    {
      "code": 6031,
      "name": "UnauthorizedAccess",
      "msg": "Unauthorized access"
    },
    {
      "code": 6032,
      "name": "InvalidFeeParameter",
      "msg": "Invalid fee parameter"
    },
    {
      "code": 6033,
      "name": "MissingOracle",
      "msg": "Missing oracle account"
    },
    {
      "code": 6034,
      "name": "InsufficientSample",
      "msg": "Insufficient observation sample"
    },
    {
      "code": 6035,
      "name": "InvalidLookupTimestamp",
      "msg": "Invalid lookup timestamp"
    },
    {
      "code": 6036,
      "name": "BitmapExtensionAccountIsNotProvided",
      "msg": "Bitmap extension account is not provided"
    },
    {
      "code": 6037,
      "name": "CannotFindNonZeroLiquidityBinArrayId",
      "msg": "Cannot find non-zero liquidity binArrayId"
    },
    {
      "code": 6038,
      "name": "BinIdOutOfBound",
      "msg": "Bin id out of bound"
    },
    {
      "code": 6039,
      "name": "InsufficientOutAmount",
      "msg": "Insufficient amount in for minimum out"
    },
    {
      "code": 6040,
      "name": "InvalidPositionWidth",
      "msg": "Invalid position width"
    },
    {
      "code": 6041,
      "name": "ExcessiveFeeUpdate",
      "msg": "Excessive fee update"
    },
    {
      "code": 6042,
      "name": "PoolDisabled",
      "msg": "Pool disabled"
    },
    {
      "code": 6043,
      "name": "InvalidPoolType",
      "msg": "Invalid pool type"
    },
    {
      "code": 6044,
      "name": "ExceedMaxWhitelist",
      "msg": "Whitelist for wallet is full"
    },
    {
      "code": 6045,
      "name": "InvalidIndex",
      "msg": "Invalid index"
    },
    {
      "code": 6046,
      "name": "RewardNotEnded",
      "msg": "Reward not ended"
    },
    {
      "code": 6047,
      "name": "MustWithdrawnIneligibleReward",
      "msg": "Must withdraw ineligible reward"
    },
    {
      "code": 6048,
      "name": "UnauthorizedAddress",
      "msg": "Unauthorized address"
    },
    {
      "code": 6049,
      "name": "OperatorsAreTheSame",
      "msg": "Cannot update because operators are the same"
    },
    {
      "code": 6050,
      "name": "WithdrawToWrongTokenAccount",
      "msg": "Withdraw to wrong token account"
    },
    {
      "code": 6051,
      "name": "WrongRentReceiver",
      "msg": "Wrong rent receiver"
    },
    {
      "code": 6052,
      "name": "AlreadyPassActivationPoint",
      "msg": "Already activated"
    },
    {
      "code": 6053,
      "name": "ExceedMaxSwappedAmount",
      "msg": "Swapped amount is exceeded max swapped amount"
    },
    {
      "code": 6054,
      "name": "InvalidStrategyParameters",
      "msg": "Invalid strategy parameters"
    },
    {
      "code": 6055,
      "name": "LiquidityLocked",
      "msg": "Liquidity locked"
    },
    {
      "code": 6056,
      "name": "BinRangeIsNotEmpty",
      "msg": "Bin range is not empty"
    },
    {
      "code": 6057,
      "name": "NotExactAmountOut",
      "msg": "Amount out is not matched with exact amount out"
    },
    {
      "code": 6058,
      "name": "InvalidActivationType",
      "msg": "Invalid activation type"
    },
    {
      "code": 6059,
      "name": "InvalidActivationDuration",
      "msg": "Invalid activation duration"
    },
    {
      "code": 6060,
      "name": "MissingTokenAmountAsTokenLaunchProof",
      "msg": "Missing token amount as token launch owner proof"
    },
    {
      "code": 6061,
      "name": "InvalidQuoteToken",
      "msg": "Quote token must be SOL or USDC"
    },
    {
      "code": 6062,
      "name": "InvalidBinStep",
      "msg": "Invalid bin step"
    },
    {
      "code": 6063,
      "name": "InvalidBaseFee",
      "msg": "Invalid base fee"
    },
    {
      "code": 6064,
      "name": "InvalidPreActivationDuration",
      "msg": "Invalid pre-activation duration"
    },
    {
      "code": 6065,
      "name": "AlreadyPassPreActivationSwapPoint",
      "msg": "Already pass pre-activation swap point"
    },
    {
      "code": 6066,
      "name": "InvalidStatus",
      "msg": "Invalid status"
    },
    {
      "code": 6067,
      "name": "ExceededMaxOracleLength",
      "msg": "Exceed max oracle length"
    },
    {
      "code": 6068,
      "name": "InvalidMinimumLiquidity",
      "msg": "Invalid minimum liquidity"
    },
    {
      "code": 6069,
      "name": "NotSupportMint",
      "msg": "Not support token_2022 mint extension"
    },
    {
      "code": 6070,
      "name": "UnsupportedMintExtension",
      "msg": "Unsupported mint extension"
    },
    {
      "code": 6071,
      "name": "UnsupportNativeMintToken2022",
      "msg": "Unsupported native mint token2022"
    },
    {
      "code": 6072,
      "name": "UnmatchTokenMint",
      "msg": "Unmatch token mint"
    },
    {
      "code": 6073,
      "name": "UnsupportedTokenMint",
      "msg": "Unsupported token mint"
    },
    {
      "code": 6074,
      "name": "InsufficientRemainingAccounts",
      "msg": "Insufficient remaining accounts"
    },
    {
      "code": 6075,
      "name": "InvalidRemainingAccountSlice",
      "msg": "Invalid remaining account slice"
    },
    {
      "code": 6076,
      "name": "DuplicatedRemainingAccountTypes",
      "msg": "Duplicated remaining account types"
    },
    {
      "code": 6077,
      "name": "MissingRemainingAccountForTransferHook",
      "msg": "Missing remaining account for transfer hook"
    },
    {
      "code": 6078,
      "name": "NoTransferHookProgram",
      "msg": "Remaining account was passed for transfer hook but there's no hook program"
    },
    {
      "code": 6079,
      "name": "ZeroFundedAmount",
      "msg": "Zero funded amount"
    },
    {
      "code": 6080,
      "name": "InvalidSide",
      "msg": "Invalid side"
    },
    {
      "code": 6081,
      "name": "InvalidResizeLength",
      "msg": "Invalid resize length"
    },
    {
      "code": 6082,
      "name": "NotSupportAtTheMoment",
      "msg": "Not support at the moment"
    }
  ]
};

// src/dlmm/constants/index.ts
import { BN } from "@coral-xyz/anchor";
var LBCLMM_PROGRAM_IDS = {
  devnet: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
  localhost: "LbVRzDTvBDEcrthxfZ4RL6yiq3uZw8bS6MwtdY6UhFQ",
  "mainnet-beta": "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo"
};
var ADMIN = {
  devnet: "6WaLrrRfReGKBYUSkmx2K6AuT21ida4j8at2SUiZdXu8",
  localhost: "bossj3JvwiNK7pvjr149DqdtJxf2gdygbcmEPTkb2F1"
};
var Network = /* @__PURE__ */ ((Network2) => {
  Network2["MAINNET"] = "mainnet-beta";
  Network2["TESTNET"] = "testnet";
  Network2["DEVNET"] = "devnet";
  Network2["LOCAL"] = "localhost";
  return Network2;
})(Network || {});
var BASIS_POINT_MAX = 1e4;
var SCALE_OFFSET = 64;
var SCALE = new BN(1).shln(SCALE_OFFSET);
var FEE_PRECISION = new BN(1e9);
var MAX_FEE_RATE = new BN(1e8);
var BIN_ARRAY_FEE = 0.07054656;
var POSITION_FEE = 0.0565152;
var CONSTANTS = Object.entries(IDL.constants);
var MAX_BIN_ARRAY_SIZE = new BN(
  CONSTANTS.find(([k, v]) => v.name == "MAX_BIN_PER_ARRAY")?.[1].value ?? 0
);
var MAX_BIN_PER_POSITION = new BN(
  CONSTANTS.find(([k, v]) => v.name == "MAX_BIN_PER_POSITION")?.[1].value ?? 0
);
var BIN_ARRAY_BITMAP_SIZE = new BN(
  CONSTANTS.find(([k, v]) => v.name == "BIN_ARRAY_BITMAP_SIZE")?.[1].value ?? 0
);
var EXTENSION_BINARRAY_BITMAP_SIZE = new BN(
  CONSTANTS.find(([k, v]) => v.name == "EXTENSION_BINARRAY_BITMAP_SIZE")?.[1].value ?? 0
);
var SIMULATION_USER = new PublicKey(
  "HrY9qR5TiB2xPzzvbBu5KrBorMfYGQXh9osXydz4jy9s"
);
var PRECISION = 18446744073709552e3;
var MAX_CLAIM_ALL_ALLOWED = 3;
var MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX = 26;
var MAX_BIN_PER_TX = 69;
var MAX_ACTIVE_BIN_SLIPPAGE = 3;
var ILM_BASE = new PublicKey(
  "MFGQxwAmB91SwuYX36okv2Qmdc9aMuHTwWGUrp4AtB1"
);
var MAX_EXTRA_BIN_ARRAYS = 3;
var U64_MAX = new BN("18446744073709551615");

// src/dlmm/error.ts
import { AnchorError } from "@coral-xyz/anchor";
var DLMMError = class extends Error {
  errorCode;
  errorName;
  errorMessage;
  constructor(error) {
    let _errorCode = 0;
    let _errorName = "Something went wrong";
    let _errorMessage = "Something went wrong";
    if (error instanceof Error) {
      const anchorError = AnchorError.parse(
        JSON.parse(JSON.stringify(error)).logs
      );
      if (anchorError?.program.toBase58() === LBCLMM_PROGRAM_IDS["mainnet-beta"]) {
        _errorCode = anchorError.error.errorCode.number;
        _errorName = anchorError.error.errorCode.code;
        _errorMessage = anchorError.error.errorMessage;
      }
    } else {
      const idlError = IDL.errors.find((err) => err.code === error);
      if (idlError) {
        _errorCode = idlError.code;
        _errorName = idlError.name;
        _errorMessage = idlError.msg;
      }
    }
    super(_errorMessage);
    this.errorCode = _errorCode;
    this.errorName = _errorName;
    this.errorMessage = _errorMessage;
  }
};
var DlmmSdkError = class extends Error {
  name;
  message;
  constructor(name, message) {
    super();
    this.name = name;
    this.message = message;
  }
};

// src/dlmm/helpers/index.ts
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID as TOKEN_PROGRAM_ID3,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createAssociatedTokenAccountIdempotentInstruction,
  createCloseAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint
} from "@solana/spl-token";
import {
  ComputeBudgetProgram as ComputeBudgetProgram2,
  SystemProgram,
  TransactionInstruction as TransactionInstruction3
} from "@solana/web3.js";

// src/dlmm/helpers/math.ts
import { BN as BN6 } from "@coral-xyz/anchor";
import Decimal3 from "decimal.js";

// src/dlmm/helpers/u64xu64_math.ts
import BN2 from "bn.js";
var MAX_EXPONENTIAL = new BN2(524288);
var ONE = new BN2(1).shln(SCALE_OFFSET);
var MAX = new BN2(2).pow(new BN2(128)).sub(new BN2(1));

// src/dlmm/helpers/weight.ts
import { BN as BN5 } from "@coral-xyz/anchor";
import gaussian from "gaussian";
import Decimal2 from "decimal.js";

// src/dlmm/helpers/weightToAmounts.ts
import { BN as BN4 } from "@coral-xyz/anchor";
import Decimal from "decimal.js";

// src/dlmm/helpers/token_2022.ts
import {
  addExtraAccountMetasForExecute,
  calculateFee,
  createTransferCheckedInstruction,
  getEpochFee,
  getTransferFeeConfig,
  getTransferHook,
  MAX_FEE_BASIS_POINTS,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  unpackMint
} from "@solana/spl-token";
import {
  PublicKey as PublicKey2
} from "@solana/web3.js";
import BN3 from "bn.js";
async function getMultipleMintsExtraAccountMetasForTransferHook(connection, mintAddressesWithAccountInfo) {
  const extraAccountMetas = await Promise.all(
    mintAddressesWithAccountInfo.map(
      ({ mintAddress, mintAccountInfo }) => getExtraAccountMetasForTransferHook(
        connection,
        mintAddress,
        mintAccountInfo
      )
    )
  );
  const mintsWithHookAccountMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < extraAccountMetas.length; i++) {
    const { mintAddress } = mintAddressesWithAccountInfo[i];
    const transferHooks = extraAccountMetas[i];
    mintsWithHookAccountMap.set(mintAddress.toBase58(), transferHooks);
  }
  return mintsWithHookAccountMap;
}
async function getExtraAccountMetasForTransferHook(connection, mintAddress, mintAccountInfo) {
  if (![TOKEN_PROGRAM_ID.toBase58(), TOKEN_2022_PROGRAM_ID.toBase58()].includes(
    mintAccountInfo.owner.toBase58()
  )) {
    return [];
  }
  const mintState = unpackMint(
    mintAddress,
    mintAccountInfo,
    mintAccountInfo.owner
  );
  if (mintAccountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
    return [];
  }
  const transferHook = getTransferHook(mintState);
  if (!transferHook || transferHook.programId.equals(PublicKey2.default)) {
    return [];
  } else {
    const instruction = createTransferCheckedInstruction(
      PublicKey2.default,
      mintAddress,
      PublicKey2.default,
      PublicKey2.default,
      BigInt(0),
      mintState.decimals,
      [],
      mintAccountInfo.owner
    );
    await addExtraAccountMetasForExecute(
      connection,
      instruction,
      transferHook.programId,
      PublicKey2.default,
      mintAddress,
      PublicKey2.default,
      PublicKey2.default,
      BigInt(0)
    );
    const transferHookAccounts = instruction.keys.slice(4);
    if (transferHookAccounts.length == 0) {
      transferHookAccounts.push({
        pubkey: transferHook.programId,
        isSigner: false,
        isWritable: false
      });
    }
    return transferHookAccounts;
  }
}
function calculatePreFeeAmount(transferFee, postFeeAmount) {
  if (postFeeAmount.isZero()) {
    return new BN3(0);
  }
  if (transferFee.transferFeeBasisPoints === 0) {
    return postFeeAmount;
  }
  const maximumFee = new BN3(transferFee.maximumFee.toString());
  if (transferFee.transferFeeBasisPoints === MAX_FEE_BASIS_POINTS) {
    return postFeeAmount.add(maximumFee);
  }
  const ONE_IN_BASIS_POINTS = new BN3(MAX_FEE_BASIS_POINTS);
  const numerator = postFeeAmount.mul(ONE_IN_BASIS_POINTS);
  const denominator = ONE_IN_BASIS_POINTS.sub(
    new BN3(transferFee.transferFeeBasisPoints)
  );
  const rawPreFeeAmount = numerator.add(denominator).sub(new BN3(1)).div(denominator);
  if (rawPreFeeAmount.sub(postFeeAmount).gte(maximumFee)) {
    return postFeeAmount.add(maximumFee);
  }
  return rawPreFeeAmount;
}
function calculateInverseFee(transferFee, postFeeAmount) {
  const preFeeAmount = calculatePreFeeAmount(transferFee, postFeeAmount);
  return new BN3(
    calculateFee(transferFee, BigInt(preFeeAmount.toString())).toString()
  );
}
function calculateTransferFeeIncludedAmount(transferFeeExcludedAmount, mint, currentEpoch) {
  if (transferFeeExcludedAmount.isZero()) {
    return {
      amount: new BN3(0),
      transferFee: new BN3(0)
    };
  }
  const transferFeeConfig = getTransferFeeConfig(mint);
  if (transferFeeConfig === null) {
    return {
      amount: transferFeeExcludedAmount,
      transferFee: new BN3(0)
    };
  }
  const epochFee = getEpochFee(transferFeeConfig, BigInt(currentEpoch));
  const transferFee = epochFee.transferFeeBasisPoints == MAX_FEE_BASIS_POINTS ? new BN3(epochFee.maximumFee.toString()) : calculateInverseFee(epochFee, transferFeeExcludedAmount);
  const transferFeeIncludedAmount = transferFeeExcludedAmount.add(transferFee);
  return {
    amount: transferFeeIncludedAmount,
    transferFee
  };
}
function calculateTransferFeeExcludedAmount(transferFeeIncludedAmount, mint, currentEpoch) {
  const transferFeeConfig = getTransferFeeConfig(mint);
  if (transferFeeConfig === null) {
    return {
      amount: transferFeeIncludedAmount,
      transferFee: new BN3(0)
    };
  }
  const transferFeeIncludedAmountN = BigInt(
    transferFeeIncludedAmount.toString()
  );
  const transferFee = calculateFee(
    getEpochFee(transferFeeConfig, BigInt(currentEpoch)),
    transferFeeIncludedAmountN
  );
  const transferFeeExcludedAmount = new BN3(
    (transferFeeIncludedAmountN - transferFee).toString()
  );
  return {
    amount: transferFeeExcludedAmount,
    transferFee: new BN3(transferFee.toString())
  };
}

// src/dlmm/helpers/weightToAmounts.ts
function toAmountBidSide(activeId, totalAmount, distributions, mintY, clock) {
  totalAmount = calculateTransferFeeExcludedAmount(
    totalAmount,
    mintY,
    clock.epoch.toNumber()
  ).amount;
  const totalWeight = distributions.reduce(function(sum, el) {
    return el.binId > activeId ? sum : sum.add(el.weight);
  }, new Decimal(0));
  if (totalWeight.cmp(new Decimal(0)) != 1) {
    throw Error("Invalid parameteres");
  }
  return distributions.map((bin) => {
    if (bin.binId > activeId) {
      return {
        binId: bin.binId,
        amount: new BN4(0)
      };
    } else {
      return {
        binId: bin.binId,
        amount: new BN4(
          new Decimal(totalAmount.toString()).mul(new Decimal(bin.weight).div(totalWeight)).floor().toString()
        )
      };
    }
  });
}
function toAmountAskSide(activeId, binStep, totalAmount, distributions, mintX, clock) {
  totalAmount = calculateTransferFeeExcludedAmount(
    totalAmount,
    mintX,
    clock.epoch.toNumber()
  ).amount;
  const totalWeight = distributions.reduce(function(sum, el) {
    if (el.binId < activeId) {
      return sum;
    } else {
      const price = getPriceOfBinByBinId(el.binId, binStep);
      const weightPerPrice = new Decimal(el.weight).div(price);
      return sum.add(weightPerPrice);
    }
  }, new Decimal(0));
  if (totalWeight.cmp(new Decimal(0)) != 1) {
    throw Error("Invalid parameteres");
  }
  return distributions.map((bin) => {
    if (bin.binId < activeId) {
      return {
        binId: bin.binId,
        amount: new BN4(0)
      };
    } else {
      const price = getPriceOfBinByBinId(bin.binId, binStep);
      const weightPerPrice = new Decimal(bin.weight).div(price);
      return {
        binId: bin.binId,
        amount: new BN4(
          new Decimal(totalAmount.toString()).mul(weightPerPrice).div(totalWeight).floor().toString()
        )
      };
    }
  });
}
function toAmountBothSide(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, distributions, mintX, mintY, clock) {
  if (activeId > distributions[distributions.length - 1].binId) {
    let amounts = toAmountBidSide(
      activeId,
      amountY,
      distributions,
      mintY,
      clock
    );
    return amounts.map((bin) => {
      return {
        binId: bin.binId,
        amountX: new BN4(0),
        amountY: bin.amount
      };
    });
  }
  if (activeId < distributions[0].binId) {
    let amounts = toAmountAskSide(
      activeId,
      binStep,
      amountX,
      distributions,
      mintX,
      clock
    );
    return amounts.map((bin) => {
      return {
        binId: bin.binId,
        amountX: bin.amount,
        amountY: new BN4(0)
      };
    });
  }
  amountX = calculateTransferFeeIncludedAmount(
    amountX,
    mintX,
    clock.epoch.toNumber()
  ).amount;
  amountY = calculateTransferFeeIncludedAmount(
    amountY,
    mintY,
    clock.epoch.toNumber()
  ).amount;
  const activeBins = distributions.filter((element) => {
    return element.binId === activeId;
  });
  if (activeBins.length === 1) {
    const p0 = getPriceOfBinByBinId(activeId, binStep);
    let wx0 = new Decimal(0);
    let wy0 = new Decimal(0);
    const activeBin = activeBins[0];
    if (amountXInActiveBin.isZero() && amountYInActiveBin.isZero()) {
      wx0 = new Decimal(activeBin.weight).div(p0.mul(new Decimal(2)));
      wy0 = new Decimal(activeBin.weight).div(new Decimal(2));
    } else {
      let amountXInActiveBinDec = new Decimal(amountXInActiveBin.toString());
      let amountYInActiveBinDec = new Decimal(amountYInActiveBin.toString());
      if (!amountXInActiveBin.isZero()) {
        wx0 = new Decimal(activeBin.weight).div(
          p0.add(amountYInActiveBinDec.div(amountXInActiveBinDec))
        );
      }
      if (!amountYInActiveBin.isZero()) {
        wy0 = new Decimal(activeBin.weight).div(
          new Decimal(1).add(
            p0.mul(amountXInActiveBinDec).div(amountYInActiveBinDec)
          )
        );
      }
    }
    let totalWeightX = wx0;
    let totalWeightY = wy0;
    distributions.forEach((element) => {
      if (element.binId < activeId) {
        totalWeightY = totalWeightY.add(new Decimal(element.weight));
      }
      if (element.binId > activeId) {
        let price = getPriceOfBinByBinId(element.binId, binStep);
        let weighPerPrice = new Decimal(element.weight).div(price);
        totalWeightX = totalWeightX.add(weighPerPrice);
      }
    });
    const kx = new Decimal(amountX.toString()).div(totalWeightX);
    const ky = new Decimal(amountY.toString()).div(totalWeightY);
    let k = kx.lessThan(ky) ? kx : ky;
    return distributions.map((bin) => {
      if (bin.binId < activeId) {
        const amount = k.mul(new Decimal(bin.weight));
        return {
          binId: bin.binId,
          amountX: new BN4(0),
          amountY: new BN4(amount.floor().toString())
        };
      }
      if (bin.binId > activeId) {
        const price = getPriceOfBinByBinId(bin.binId, binStep);
        const weighPerPrice = new Decimal(bin.weight).div(price);
        const amount = k.mul(weighPerPrice);
        return {
          binId: bin.binId,
          amountX: new BN4(amount.floor().toString()),
          amountY: new BN4(0)
        };
      }
      const amountXActiveBin = k.mul(wx0);
      const amountYActiveBin = k.mul(wy0);
      return {
        binId: bin.binId,
        amountX: new BN4(amountXActiveBin.floor().toString()),
        amountY: new BN4(amountYActiveBin.floor().toString())
      };
    });
  } else {
    let totalWeightX = new Decimal(0);
    let totalWeightY = new Decimal(0);
    distributions.forEach((element) => {
      if (element.binId < activeId) {
        totalWeightY = totalWeightY.add(new Decimal(element.weight));
      } else {
        let price = getPriceOfBinByBinId(element.binId, binStep);
        let weighPerPrice = new Decimal(element.weight).div(price);
        totalWeightX = totalWeightX.add(weighPerPrice);
      }
    });
    let kx = new Decimal(amountX.toString()).div(totalWeightX);
    let ky = new Decimal(amountY.toString()).div(totalWeightY);
    let k = kx.lessThan(ky) ? kx : ky;
    return distributions.map((bin) => {
      if (bin.binId < activeId) {
        const amount = k.mul(new Decimal(bin.weight));
        return {
          binId: bin.binId,
          amountX: new BN4(0),
          amountY: new BN4(amount.floor().toString())
        };
      } else {
        let price = getPriceOfBinByBinId(bin.binId, binStep);
        let weighPerPrice = new Decimal(bin.weight).div(price);
        const amount = k.mul(weighPerPrice);
        return {
          binId: bin.binId,
          amountX: new BN4(amount.floor().toString()),
          amountY: new BN4(0)
        };
      }
    });
  }
}
function autoFillYByWeight(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, distributions) {
  const activeBins = distributions.filter((element) => {
    return element.binId === activeId;
  });
  if (activeBins.length === 1) {
    const p0 = getPriceOfBinByBinId(activeId, binStep);
    let wx0 = new Decimal(0);
    let wy0 = new Decimal(0);
    const activeBin = activeBins[0];
    if (amountXInActiveBin.isZero() && amountYInActiveBin.isZero()) {
      wx0 = new Decimal(activeBin.weight).div(p0.mul(new Decimal(2)));
      wy0 = new Decimal(activeBin.weight).div(new Decimal(2));
    } else {
      let amountXInActiveBinDec = new Decimal(amountXInActiveBin.toString());
      let amountYInActiveBinDec = new Decimal(amountYInActiveBin.toString());
      if (!amountXInActiveBin.isZero()) {
        wx0 = new Decimal(activeBin.weight).div(
          p0.add(amountYInActiveBinDec.div(amountXInActiveBinDec))
        );
      }
      if (!amountYInActiveBin.isZero()) {
        wy0 = new Decimal(activeBin.weight).div(
          new Decimal(1).add(
            p0.mul(amountXInActiveBinDec).div(amountYInActiveBinDec)
          )
        );
      }
    }
    let totalWeightX = wx0;
    let totalWeightY = wy0;
    distributions.forEach((element) => {
      if (element.binId < activeId) {
        totalWeightY = totalWeightY.add(new Decimal(element.weight));
      }
      if (element.binId > activeId) {
        const price = getPriceOfBinByBinId(element.binId, binStep);
        const weighPerPrice = new Decimal(element.weight).div(price);
        totalWeightX = totalWeightX.add(weighPerPrice);
      }
    });
    const kx = totalWeightX.isZero() ? new Decimal(1) : new Decimal(amountX.toString()).div(totalWeightX);
    const amountY = kx.mul(totalWeightY);
    return new BN4(amountY.floor().toString());
  } else {
    let totalWeightX = new Decimal(0);
    let totalWeightY = new Decimal(0);
    distributions.forEach((element) => {
      if (element.binId < activeId) {
        totalWeightY = totalWeightY.add(new Decimal(element.weight));
      } else {
        const price = getPriceOfBinByBinId(element.binId, binStep);
        const weighPerPrice = new Decimal(element.weight).div(price);
        totalWeightX = totalWeightX.add(weighPerPrice);
      }
    });
    const kx = totalWeightX.isZero() ? new Decimal(1) : new Decimal(amountX.toString()).div(totalWeightX);
    const amountY = kx.mul(totalWeightY);
    return new BN4(amountY.floor().toString());
  }
}
function autoFillXByWeight(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, distributions) {
  const activeBins = distributions.filter((element) => {
    return element.binId === activeId;
  });
  if (activeBins.length === 1) {
    const p0 = getPriceOfBinByBinId(activeId, binStep);
    let wx0 = new Decimal(0);
    let wy0 = new Decimal(0);
    const activeBin = activeBins[0];
    if (amountXInActiveBin.isZero() && amountYInActiveBin.isZero()) {
      wx0 = new Decimal(activeBin.weight).div(p0.mul(new Decimal(2)));
      wy0 = new Decimal(activeBin.weight).div(new Decimal(2));
    } else {
      let amountXInActiveBinDec = new Decimal(amountXInActiveBin.toString());
      let amountYInActiveBinDec = new Decimal(amountYInActiveBin.toString());
      if (!amountXInActiveBin.isZero()) {
        wx0 = new Decimal(activeBin.weight).div(
          p0.add(amountYInActiveBinDec.div(amountXInActiveBinDec))
        );
      }
      if (!amountYInActiveBin.isZero()) {
        wy0 = new Decimal(activeBin.weight).div(
          new Decimal(1).add(
            p0.mul(amountXInActiveBinDec).div(amountYInActiveBinDec)
          )
        );
      }
    }
    let totalWeightX = wx0;
    let totalWeightY = wy0;
    distributions.forEach((element) => {
      if (element.binId < activeId) {
        totalWeightY = totalWeightY.add(new Decimal(element.weight));
      }
      if (element.binId > activeId) {
        const price = getPriceOfBinByBinId(element.binId, binStep);
        const weighPerPrice = new Decimal(element.weight).div(price);
        totalWeightX = totalWeightX.add(weighPerPrice);
      }
    });
    const ky = totalWeightY.isZero() ? new Decimal(1) : new Decimal(amountY.toString()).div(totalWeightY);
    const amountX = ky.mul(totalWeightX);
    return new BN4(amountX.floor().toString());
  } else {
    let totalWeightX = new Decimal(0);
    let totalWeightY = new Decimal(0);
    distributions.forEach((element) => {
      if (element.binId < activeId) {
        totalWeightY = totalWeightY.add(new Decimal(element.weight));
      } else {
        const price = getPriceOfBinByBinId(element.binId, binStep);
        const weighPerPrice = new Decimal(element.weight).div(price);
        totalWeightX = totalWeightX.add(weighPerPrice);
      }
    });
    const ky = totalWeightY.isZero() ? new Decimal(1) : new Decimal(amountY.toString()).div(totalWeightY);
    const amountX = ky.mul(totalWeightX);
    return new BN4(amountX.floor().toString());
  }
}

// src/dlmm/helpers/weight.ts
function getPriceOfBinByBinId(binId, binStep) {
  const binStepNum = new Decimal2(binStep).div(new Decimal2(BASIS_POINT_MAX));
  return new Decimal2(1).add(new Decimal2(binStepNum)).pow(new Decimal2(binId));
}
function buildGaussianFromBins(activeBin, binIds) {
  const smallestBin = Math.min(...binIds);
  const largestBin = Math.max(...binIds);
  let mean = 0;
  const isAroundActiveBin = binIds.find((bid) => bid == activeBin);
  if (isAroundActiveBin) {
    mean = activeBin;
  } else if (activeBin < smallestBin) {
    mean = smallestBin;
  } else {
    mean = largestBin;
  }
  const TWO_STANDARD_DEVIATION = 4;
  const stdDev = (largestBin - smallestBin) / TWO_STANDARD_DEVIATION;
  const variance = Math.max(stdDev ** 2, 1);
  return gaussian(mean, variance);
}
function generateBinLiquidityAllocation(gaussian2, binIds, invert) {
  const allocations = binIds.map(
    (bid) => invert ? 1 / gaussian2.pdf(bid) : gaussian2.pdf(bid)
  );
  const totalAllocations = allocations.reduce((acc, v) => acc + v, 0);
  return allocations.map((a) => a / totalAllocations);
}
function computeAllocationBps(allocations) {
  let totalAllocation = new BN5(0);
  const bpsAllocations = [];
  for (const allocation of allocations) {
    const allocBps = new BN5(allocation * 1e4);
    bpsAllocations.push(allocBps);
    totalAllocation = totalAllocation.add(allocBps);
  }
  const pLoss = new BN5(1e4).sub(totalAllocation);
  return {
    bpsAllocations,
    pLoss
  };
}
function toWeightDistribution(amountX, amountY, distributions, binStep) {
  let totalQuote = new BN5(0);
  const precision = 1e12;
  const quoteDistributions = distributions.map((bin) => {
    const price = new BN5(
      getPriceOfBinByBinId(bin.binId, binStep).mul(precision).floor().toString()
    );
    const quoteValue = amountX.mul(new BN5(bin.xAmountBpsOfTotal)).mul(new BN5(price)).div(new BN5(BASIS_POINT_MAX)).div(new BN5(precision));
    const quoteAmount = quoteValue.add(
      amountY.mul(new BN5(bin.yAmountBpsOfTotal)).div(new BN5(BASIS_POINT_MAX))
    );
    totalQuote = totalQuote.add(quoteAmount);
    return {
      binId: bin.binId,
      quoteAmount
    };
  });
  if (totalQuote.eq(new BN5(0))) {
    return [];
  }
  const distributionWeights = quoteDistributions.map((bin) => {
    const weight = Math.floor(
      bin.quoteAmount.mul(new BN5(65535)).div(totalQuote).toNumber()
    );
    return {
      binId: bin.binId,
      weight
    };
  }).filter((item) => item.weight > 0);
  return distributionWeights;
}
function calculateSpotDistribution(activeBin, binIds) {
  if (!binIds.includes(activeBin)) {
    const { div: dist, mod: rem } = new BN5(1e4).divmod(
      new BN5(binIds.length)
    );
    const loss = rem.isZero() ? new BN5(0) : new BN5(1);
    const distributions = binIds[0] < activeBin ? binIds.map((binId) => ({
      binId,
      xAmountBpsOfTotal: new BN5(0),
      yAmountBpsOfTotal: dist
    })) : binIds.map((binId) => ({
      binId,
      xAmountBpsOfTotal: dist,
      yAmountBpsOfTotal: new BN5(0)
    }));
    if (binIds[0] < activeBin) {
      distributions[0].yAmountBpsOfTotal.add(loss);
    } else {
      distributions[binIds.length - 1].xAmountBpsOfTotal.add(loss);
    }
    return distributions;
  }
  const binYCount = binIds.filter((binId) => binId < activeBin).length;
  const binXCount = binIds.filter((binId) => binId > activeBin).length;
  const totalYBinCapacity = binYCount + 0.5;
  const totalXBinCapacity = binXCount + 0.5;
  const yBinBps = new BN5(1e4 / totalYBinCapacity);
  const yActiveBinBps = new BN5(1e4).sub(yBinBps.mul(new BN5(binYCount)));
  const xBinBps = new BN5(1e4 / totalXBinCapacity);
  const xActiveBinBps = new BN5(1e4).sub(xBinBps.mul(new BN5(binXCount)));
  return binIds.map((binId) => {
    const isYBin = binId < activeBin;
    const isXBin = binId > activeBin;
    const isActiveBin = binId === activeBin;
    if (isYBin) {
      return {
        binId,
        xAmountBpsOfTotal: new BN5(0),
        yAmountBpsOfTotal: yBinBps
      };
    }
    if (isXBin) {
      return {
        binId,
        xAmountBpsOfTotal: xBinBps,
        yAmountBpsOfTotal: new BN5(0)
      };
    }
    if (isActiveBin) {
      return {
        binId,
        xAmountBpsOfTotal: xActiveBinBps,
        yAmountBpsOfTotal: yActiveBinBps
      };
    }
  });
}
function calculateBidAskDistribution(activeBin, binIds) {
  const smallestBin = Math.min(...binIds);
  const largestBin = Math.max(...binIds);
  const rightOnly = activeBin < smallestBin;
  const leftOnly = activeBin > largestBin;
  const gaussian2 = buildGaussianFromBins(activeBin, binIds);
  const allocations = generateBinLiquidityAllocation(gaussian2, binIds, true);
  if (rightOnly) {
    const { bpsAllocations, pLoss } = computeAllocationBps(allocations);
    const binDistributions = binIds.map((bid, idx2) => ({
      binId: bid,
      xAmountBpsOfTotal: bpsAllocations[idx2],
      yAmountBpsOfTotal: new BN5(0)
    }));
    const idx = binDistributions.length - 1;
    binDistributions[idx].xAmountBpsOfTotal = binDistributions[idx].xAmountBpsOfTotal.add(pLoss);
    return binDistributions;
  }
  if (leftOnly) {
    const { bpsAllocations, pLoss } = computeAllocationBps(allocations);
    const binDistributions = binIds.map((bid, idx) => ({
      binId: bid,
      xAmountBpsOfTotal: new BN5(0),
      yAmountBpsOfTotal: bpsAllocations[idx]
    }));
    binDistributions[0].yAmountBpsOfTotal = binDistributions[0].yAmountBpsOfTotal.add(pLoss);
    return binDistributions;
  }
  const [totalXAllocation, totalYAllocation] = allocations.reduce(
    ([xAcc, yAcc], allocation, idx) => {
      const binId = binIds[idx];
      if (binId > activeBin) {
        return [xAcc + allocation, yAcc];
      } else if (binId < activeBin) {
        return [xAcc, yAcc + allocation];
      } else {
        const half = allocation / 2;
        return [xAcc + half, yAcc + half];
      }
    },
    [0, 0]
  );
  const [normXAllocations, normYAllocations] = allocations.reduce(
    ([xAllocations, yAllocations], allocation, idx) => {
      const binId = binIds[idx];
      if (binId > activeBin) {
        const distX = new BN5(allocation * 1e4 / totalXAllocation);
        xAllocations.push(distX);
      }
      if (binId < activeBin) {
        const distY = new BN5(allocation * 1e4 / totalYAllocation);
        yAllocations.push(distY);
      }
      if (binId == activeBin) {
        const half = allocation / 2;
        const distX = new BN5(half * 1e4 / totalXAllocation);
        const distY = new BN5(half * 1e4 / totalYAllocation);
        xAllocations.push(distX);
        yAllocations.push(distY);
      }
      return [xAllocations, yAllocations];
    },
    [[], []]
  );
  const totalXNormAllocations = normXAllocations.reduce(
    (acc, v) => acc.add(v),
    new BN5(0)
  );
  const totalYNormAllocations = normYAllocations.reduce(
    (acc, v) => acc.add(v),
    new BN5(0)
  );
  const xPLoss = new BN5(1e4).sub(totalXNormAllocations);
  const yPLoss = new BN5(1e4).sub(totalYNormAllocations);
  const distributions = binIds.map((binId) => {
    if (binId === activeBin) {
      return {
        binId,
        xAmountBpsOfTotal: normXAllocations.shift(),
        yAmountBpsOfTotal: normYAllocations.shift()
      };
    }
    if (binId > activeBin) {
      return {
        binId,
        xAmountBpsOfTotal: normXAllocations.shift(),
        yAmountBpsOfTotal: new BN5(0)
      };
    }
    if (binId < activeBin) {
      return {
        binId,
        xAmountBpsOfTotal: new BN5(0),
        yAmountBpsOfTotal: normYAllocations.shift()
      };
    }
  });
  if (!yPLoss.isZero()) {
    distributions[0].yAmountBpsOfTotal = distributions[0].yAmountBpsOfTotal.add(yPLoss);
  }
  if (!xPLoss.isZero()) {
    const last = distributions.length - 1;
    distributions[last].xAmountBpsOfTotal = distributions[last].xAmountBpsOfTotal.add(xPLoss);
  }
  return distributions;
}
function calculateNormalDistribution(activeBin, binIds) {
  const smallestBin = Math.min(...binIds);
  const largestBin = Math.max(...binIds);
  const rightOnly = activeBin < smallestBin;
  const leftOnly = activeBin > largestBin;
  const gaussian2 = buildGaussianFromBins(activeBin, binIds);
  const allocations = generateBinLiquidityAllocation(gaussian2, binIds, false);
  if (rightOnly) {
    const { bpsAllocations, pLoss } = computeAllocationBps(allocations);
    const binDistributions = binIds.map((bid, idx) => ({
      binId: bid,
      xAmountBpsOfTotal: bpsAllocations[idx],
      yAmountBpsOfTotal: new BN5(0)
    }));
    binDistributions[0].xAmountBpsOfTotal = binDistributions[0].xAmountBpsOfTotal.add(pLoss);
    return binDistributions;
  }
  if (leftOnly) {
    const { bpsAllocations, pLoss } = computeAllocationBps(allocations);
    const binDistributions = binIds.map((bid, idx2) => ({
      binId: bid,
      xAmountBpsOfTotal: new BN5(0),
      yAmountBpsOfTotal: bpsAllocations[idx2]
    }));
    const idx = binDistributions.length - 1;
    binDistributions[idx].yAmountBpsOfTotal = binDistributions[idx].yAmountBpsOfTotal.add(pLoss);
    return binDistributions;
  }
  const [totalXAllocation, totalYAllocation] = allocations.reduce(
    ([xAcc, yAcc], allocation, idx) => {
      const binId = binIds[idx];
      if (binId > activeBin) {
        return [xAcc + allocation, yAcc];
      } else if (binId < activeBin) {
        return [xAcc, yAcc + allocation];
      } else {
        const half = allocation / 2;
        return [xAcc + half, yAcc + half];
      }
    },
    [0, 0]
  );
  const [normXAllocations, normYAllocations] = allocations.reduce(
    ([xAllocations, yAllocations], allocation, idx) => {
      const binId = binIds[idx];
      if (binId > activeBin) {
        const distX = new BN5(allocation * 1e4 / totalXAllocation);
        xAllocations.push(distX);
      }
      if (binId < activeBin) {
        const distY = new BN5(allocation * 1e4 / totalYAllocation);
        yAllocations.push(distY);
      }
      return [xAllocations, yAllocations];
    },
    [[], []]
  );
  const normXActiveBinAllocation = normXAllocations.reduce(
    (maxBps, bps) => maxBps.sub(bps),
    new BN5(1e4)
  );
  const normYActiveBinAllocation = normYAllocations.reduce(
    (maxBps, bps) => maxBps.sub(bps),
    new BN5(1e4)
  );
  return binIds.map((binId) => {
    if (binId === activeBin) {
      return {
        binId,
        xAmountBpsOfTotal: normXActiveBinAllocation,
        yAmountBpsOfTotal: normYActiveBinAllocation
      };
    }
    if (binId > activeBin) {
      return {
        binId,
        xAmountBpsOfTotal: normXAllocations.shift(),
        yAmountBpsOfTotal: new BN5(0)
      };
    }
    if (binId < activeBin) {
      return {
        binId,
        xAmountBpsOfTotal: new BN5(0),
        yAmountBpsOfTotal: normYAllocations.shift()
      };
    }
  });
}
function fromWeightDistributionToAmountOneSide(amount, distributions, binStep, activeId, depositForY, mint, clock) {
  if (depositForY) {
    return toAmountBidSide(activeId, amount, distributions, mint, clock);
  } else {
    return toAmountAskSide(
      activeId,
      binStep,
      amount,
      distributions,
      mint,
      clock
    );
  }
}
function fromWeightDistributionToAmount(amountX, amountY, distributions, binStep, activeId, amountXInActiveBin, amountYInActiveBin, mintX, mintY, clock) {
  var distributions = distributions.sort((n1, n2) => {
    return n1.binId - n2.binId;
  });
  if (distributions.length == 0) {
    return [];
  }
  if (activeId > distributions[distributions.length - 1].binId) {
    let amounts = toAmountBidSide(
      activeId,
      amountY,
      distributions,
      mintY,
      clock
    );
    return amounts.map((bin) => {
      return {
        binId: bin.binId,
        amountX: new BN5(0),
        amountY: new BN5(bin.amount.toString())
      };
    });
  }
  if (activeId < distributions[0].binId) {
    let amounts = toAmountAskSide(
      activeId,
      binStep,
      amountX,
      distributions,
      mintX,
      clock
    );
    return amounts.map((bin) => {
      return {
        binId: bin.binId,
        amountX: new BN5(bin.amount.toString()),
        amountY: new BN5(0)
      };
    });
  }
  return toAmountBothSide(
    activeId,
    binStep,
    amountX,
    amountY,
    amountXInActiveBin,
    amountYInActiveBin,
    distributions,
    mintX,
    mintY,
    clock
  );
}

// src/dlmm/helpers/math.ts
function mulShr(x, y, offset, rounding) {
  const denominator = new BN6(1).shln(offset);
  return mulDiv(x, y, denominator, rounding);
}
function shlDiv(x, y, offset, rounding) {
  const scale = new BN6(1).shln(offset);
  return mulDiv(x, scale, y, rounding);
}
function mulDiv(x, y, denominator, rounding) {
  const { div, mod } = x.mul(y).divmod(denominator);
  if (rounding == 0 /* Up */ && !mod.isZero()) {
    return div.add(new BN6(1));
  }
  return div;
}
function computeBaseFactorFromFeeBps(binStep, feeBps) {
  const U16_MAX = 65535;
  const computedBaseFactor = feeBps.toNumber() * BASIS_POINT_MAX / binStep.toNumber();
  if (computedBaseFactor > U16_MAX) {
    let truncatedBaseFactor = computedBaseFactor;
    let base_power_factor = 0;
    while (truncatedBaseFactor > U16_MAX) {
      const remainder = truncatedBaseFactor % 10;
      if (remainder == 0) {
        base_power_factor += 1;
        truncatedBaseFactor /= 10;
      } else {
        throw "have decimals";
      }
    }
    return [new BN6(truncatedBaseFactor), new BN6(base_power_factor)];
  } else {
    const computedBaseFactorFloor = Math.floor(computedBaseFactor);
    if (computedBaseFactor != computedBaseFactorFloor) {
      if (computedBaseFactorFloor >= U16_MAX) {
        throw "base factor for the give fee bps overflow u16";
      }
      if (computedBaseFactorFloor == 0) {
        throw "base factor for the give fee bps underflow";
      }
      if (computedBaseFactor % 1 != 0) {
        throw "couldn't compute base factor for the exact fee bps";
      }
    }
    return [new BN6(computedBaseFactor), new BN6(0)];
  }
}
function getC(amount, binStep, binId, baseTokenDecimal, quoteTokenDecimal, minPrice, maxPrice, k) {
  const currentPricePerLamport = new Decimal3(1 + binStep / 1e4).pow(
    binId.toNumber()
  );
  const currentPricePerToken = currentPricePerLamport.mul(
    new Decimal3(10 ** (baseTokenDecimal - quoteTokenDecimal))
  );
  const priceRange = maxPrice.sub(minPrice);
  const currentPriceDeltaFromMin = currentPricePerToken.sub(
    new Decimal3(minPrice)
  );
  const c = new Decimal3(amount.toString()).mul(
    currentPriceDeltaFromMin.div(priceRange).pow(k)
  );
  return c.floor();
}
function distributeAmountToCompressedBinsByRatio(compressedBinAmount, uncompressedAmount, multiplier, binCapAmount) {
  const newCompressedBinAmount = /* @__PURE__ */ new Map();
  let totalCompressedAmount = new BN6(0);
  for (const compressedAmount of compressedBinAmount.values()) {
    totalCompressedAmount = totalCompressedAmount.add(compressedAmount);
  }
  let totalDepositedAmount = new BN6(0);
  for (const [binId, compressedAmount] of compressedBinAmount.entries()) {
    const depositAmount = compressedAmount.mul(uncompressedAmount).div(totalCompressedAmount);
    let compressedDepositAmount = depositAmount.div(multiplier);
    let newCompressedAmount = compressedAmount.add(compressedDepositAmount);
    if (newCompressedAmount.gt(binCapAmount)) {
      compressedDepositAmount = compressedDepositAmount.sub(
        newCompressedAmount.sub(binCapAmount)
      );
      newCompressedAmount = binCapAmount;
    }
    newCompressedBinAmount.set(binId, newCompressedAmount);
    totalDepositedAmount = totalDepositedAmount.add(
      compressedDepositAmount.mul(multiplier)
    );
  }
  const loss = uncompressedAmount.sub(totalDepositedAmount);
  return {
    newCompressedBinAmount,
    loss
  };
}
function getPositionCount(minBinId, maxBinId) {
  const binDelta = maxBinId.sub(minBinId);
  const positionCount = binDelta.div(MAX_BIN_PER_POSITION);
  return positionCount.add(new BN6(1));
}
function compressBinAmount(binAmount, multiplier) {
  const compressedBinAmount = /* @__PURE__ */ new Map();
  let totalAmount = new BN6(0);
  let compressionLoss = new BN6(0);
  for (const [binId, amount] of binAmount) {
    totalAmount = totalAmount.add(amount);
    const compressedAmount = amount.div(multiplier);
    compressedBinAmount.set(binId, compressedAmount);
    let loss = amount.sub(compressedAmount.mul(multiplier));
    compressionLoss = compressionLoss.add(loss);
  }
  return {
    compressedBinAmount,
    compressionLoss
  };
}
function generateAmountForBinRange(amount, binStep, tokenXDecimal, tokenYDecimal, minBinId, maxBinId, k) {
  const toTokenMultiplier = new Decimal3(10 ** (tokenXDecimal - tokenYDecimal));
  const minPrice = getPriceOfBinByBinId(minBinId.toNumber(), binStep).mul(
    toTokenMultiplier
  );
  const maxPrice = getPriceOfBinByBinId(maxBinId.toNumber(), binStep).mul(
    toTokenMultiplier
  );
  const binAmounts = /* @__PURE__ */ new Map();
  for (let i = minBinId.toNumber(); i < maxBinId.toNumber(); i++) {
    const binAmount = generateBinAmount(
      amount,
      binStep,
      new BN6(i),
      tokenXDecimal,
      tokenYDecimal,
      minPrice,
      maxPrice,
      k
    );
    binAmounts.set(i, binAmount);
  }
  return binAmounts;
}
function generateBinAmount(amount, binStep, binId, tokenXDecimal, tokenYDecimal, minPrice, maxPrice, k) {
  const c1 = getC(
    amount,
    binStep,
    binId.add(new BN6(1)),
    tokenXDecimal,
    tokenYDecimal,
    minPrice,
    maxPrice,
    k
  );
  const c0 = getC(
    amount,
    binStep,
    binId,
    tokenXDecimal,
    tokenYDecimal,
    minPrice,
    maxPrice,
    k
  );
  return new BN6(c1.sub(c0).floor().toString());
}

// src/dlmm/helpers/computeUnit.ts
import { ComputeBudgetProgram, PublicKey as PublicKey3, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
var DEFAULT_ADD_LIQUIDITY_CU = 8e5;
var MIN_CU_BUFFER = 5e4;
var MAX_CU_BUFFER = 2e5;
var getSimulationComputeUnits = async (connection, instructions, payer, lookupTables, commitment = "confirmed") => {
  const testInstructions = [
    // Set an arbitrarily high number in simulation
    // so we can be sure the transaction will succeed
    // and get the real compute units used
    ComputeBudgetProgram.setComputeUnitLimit({ units: 14e5 }),
    ...instructions
  ];
  const testTransaction = new VersionedTransaction(
    new TransactionMessage({
      instructions: testInstructions,
      payerKey: payer,
      // RecentBlockhash can by any public key during simulation
      // since 'replaceRecentBlockhash' is set to 'true' below
      recentBlockhash: PublicKey3.default.toString()
    }).compileToV0Message(lookupTables)
  );
  const rpcResponse = await connection.simulateTransaction(testTransaction, {
    replaceRecentBlockhash: true,
    sigVerify: false,
    commitment
  });
  if (rpcResponse?.value?.err) {
    const logs = rpcResponse.value.logs?.join("\n  \u2022 ") || "No logs available";
    throw new Error(
      `Transaction simulation failed:
  \u2022${logs}` + JSON.stringify(rpcResponse?.value?.err)
    );
  }
  return rpcResponse.value.unitsConsumed || null;
};

// src/dlmm/helpers/derive.ts
import { PublicKey as PublicKey4 } from "@solana/web3.js";
function sortTokenMints(tokenX, tokenY) {
  const [minKey, maxKey] = tokenX.toBuffer().compare(tokenY.toBuffer()) == 1 ? [tokenY, tokenX] : [tokenX, tokenY];
  return [minKey, maxKey];
}
function derivePresetParameterWithIndex(index, programId) {
  return PublicKey4.findProgramAddressSync(
    [
      Buffer.from("preset_parameter2"),
      new Uint8Array(index.toArrayLike(Buffer, "le", 2))
    ],
    programId
  );
}
function deriveLbPairWithPresetParamWithIndexKey(presetParameterKey, tokenX, tokenY, programId) {
  const [minKey, maxKey] = sortTokenMints(tokenX, tokenY);
  return PublicKey4.findProgramAddressSync(
    [presetParameterKey.toBuffer(), minKey.toBuffer(), maxKey.toBuffer()],
    programId
  );
}
function derivePresetParameter(binStep, programId) {
  return PublicKey4.findProgramAddressSync(
    [
      Buffer.from("preset_parameter"),
      new Uint8Array(binStep.toArrayLike(Buffer, "le", 2))
    ],
    programId
  );
}
function derivePresetParameter2(binStep, baseFactor, programId) {
  return PublicKey4.findProgramAddressSync(
    [
      Buffer.from("preset_parameter"),
      new Uint8Array(binStep.toArrayLike(Buffer, "le", 2)),
      new Uint8Array(baseFactor.toArrayLike(Buffer, "le", 2))
    ],
    programId
  );
}
function deriveLbPair2(tokenX, tokenY, binStep, baseFactor, programId) {
  const [minKey, maxKey] = sortTokenMints(tokenX, tokenY);
  return PublicKey4.findProgramAddressSync(
    [
      minKey.toBuffer(),
      maxKey.toBuffer(),
      new Uint8Array(binStep.toArrayLike(Buffer, "le", 2)),
      new Uint8Array(baseFactor.toArrayLike(Buffer, "le", 2))
    ],
    programId
  );
}
function deriveLbPair(tokenX, tokenY, binStep, programId) {
  const [minKey, maxKey] = sortTokenMints(tokenX, tokenY);
  return PublicKey4.findProgramAddressSync(
    [
      minKey.toBuffer(),
      maxKey.toBuffer(),
      new Uint8Array(binStep.toArrayLike(Buffer, "le", 2))
    ],
    programId
  );
}
function deriveCustomizablePermissionlessLbPair(tokenX, tokenY, programId) {
  const [minKey, maxKey] = sortTokenMints(tokenX, tokenY);
  return PublicKey4.findProgramAddressSync(
    [ILM_BASE.toBuffer(), minKey.toBuffer(), maxKey.toBuffer()],
    programId
  );
}
function derivePermissionLbPair(baseKey, tokenX, tokenY, binStep, programId) {
  const [minKey, maxKey] = sortTokenMints(tokenX, tokenY);
  return PublicKey4.findProgramAddressSync(
    [
      baseKey.toBuffer(),
      minKey.toBuffer(),
      maxKey.toBuffer(),
      new Uint8Array(binStep.toArrayLike(Buffer, "le", 2))
    ],
    programId
  );
}
function deriveOracle(lbPair, programId) {
  return PublicKey4.findProgramAddressSync(
    [Buffer.from("oracle"), lbPair.toBytes()],
    programId
  );
}
function derivePosition(lbPair, base, lowerBinId, width, programId) {
  let lowerBinIdBytes;
  if (lowerBinId.isNeg()) {
    lowerBinIdBytes = new Uint8Array(
      lowerBinId.toTwos(32).toArrayLike(Buffer, "le", 4)
    );
  } else {
    lowerBinIdBytes = new Uint8Array(lowerBinId.toArrayLike(Buffer, "le", 4));
  }
  return PublicKey4.findProgramAddressSync(
    [
      Buffer.from("position"),
      lbPair.toBuffer(),
      base.toBuffer(),
      lowerBinIdBytes,
      new Uint8Array(width.toArrayLike(Buffer, "le", 4))
    ],
    programId
  );
}
function deriveBinArray(lbPair, index, programId) {
  let binArrayBytes;
  if (index.isNeg()) {
    binArrayBytes = new Uint8Array(
      index.toTwos(64).toArrayLike(Buffer, "le", 8)
    );
  } else {
    binArrayBytes = new Uint8Array(index.toArrayLike(Buffer, "le", 8));
  }
  return PublicKey4.findProgramAddressSync(
    [Buffer.from("bin_array"), lbPair.toBytes(), binArrayBytes],
    programId
  );
}
function deriveReserve(token, lbPair, programId) {
  return PublicKey4.findProgramAddressSync(
    [lbPair.toBuffer(), token.toBuffer()],
    programId
  );
}
function deriveTokenBadge(mint, programId) {
  return PublicKey4.findProgramAddressSync(
    [Buffer.from("token_badge"), mint.toBuffer()],
    programId
  );
}
function deriveEventAuthority(programId) {
  return PublicKey4.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    programId
  );
}
function deriveRewardVault(lbPair, rewardIndex, programId) {
  return PublicKey4.findProgramAddressSync(
    [lbPair.toBuffer(), rewardIndex.toArrayLike(Buffer, "le", 8)],
    programId
  );
}

// src/dlmm/helpers/binArray.ts
import { BN as BN8 } from "@coral-xyz/anchor";
import { PublicKey as PublicKey6 } from "@solana/web3.js";

// src/dlmm/types/index.ts
import {
  BN as BN7,
  BorshAccountsCoder
} from "@coral-xyz/anchor";
import {
  PublicKey as PublicKey5
} from "@solana/web3.js";
import Decimal4 from "decimal.js";
import { u64, i64, struct } from "@coral-xyz/borsh";
var POSITION_V2_DISC = BorshAccountsCoder.accountDiscriminator("positionV2");
var PositionVersion = /* @__PURE__ */ ((PositionVersion3) => {
  PositionVersion3[PositionVersion3["V1"] = 0] = "V1";
  PositionVersion3[PositionVersion3["V2"] = 1] = "V2";
  PositionVersion3[PositionVersion3["V3"] = 2] = "V3";
  return PositionVersion3;
})(PositionVersion || {});
var PairType = /* @__PURE__ */ ((PairType2) => {
  PairType2[PairType2["Permissionless"] = 0] = "Permissionless";
  PairType2[PairType2["Permissioned"] = 1] = "Permissioned";
  return PairType2;
})(PairType || {});
var Strategy = {
  SpotBalanced: { spotBalanced: {} },
  CurveBalanced: { curveBalanced: {} },
  BidAskBalanced: { bidAskBalanced: {} },
  SpotImBalanced: { spotImBalanced: {} },
  CurveImBalanced: { curveImBalanced: {} },
  BidAskImBalanced: { bidAskImBalanced: {} }
};
var StrategyType = /* @__PURE__ */ ((StrategyType2) => {
  StrategyType2[StrategyType2["Spot"] = 0] = "Spot";
  StrategyType2[StrategyType2["Curve"] = 1] = "Curve";
  StrategyType2[StrategyType2["BidAsk"] = 2] = "BidAsk";
  return StrategyType2;
})(StrategyType || {});
var ActivationType = /* @__PURE__ */ ((ActivationType2) => {
  ActivationType2[ActivationType2["Slot"] = 0] = "Slot";
  ActivationType2[ActivationType2["Timestamp"] = 1] = "Timestamp";
  return ActivationType2;
})(ActivationType || {});
var BinLiquidity;
((BinLiquidity3) => {
  function fromBin(bin, binId, binStep, baseTokenDecimal, quoteTokenDecimal, version) {
    const pricePerLamport = getPriceOfBinByBinId(binId, binStep).toString();
    return {
      binId,
      xAmount: bin.amountX,
      yAmount: bin.amountY,
      supply: bin.liquiditySupply,
      price: pricePerLamport,
      version,
      pricePerToken: new Decimal4(pricePerLamport).mul(new Decimal4(10 ** (baseTokenDecimal - quoteTokenDecimal))).toString(),
      feeAmountXPerTokenStored: bin.feeAmountXPerTokenStored,
      feeAmountYPerTokenStored: bin.feeAmountYPerTokenStored,
      rewardPerTokenStored: bin.rewardPerTokenStored
    };
  }
  BinLiquidity3.fromBin = fromBin;
  function empty(binId, binStep, baseTokenDecimal, quoteTokenDecimal, version) {
    const pricePerLamport = getPriceOfBinByBinId(binId, binStep).toString();
    return {
      binId,
      xAmount: new BN7(0),
      yAmount: new BN7(0),
      supply: new BN7(0),
      price: pricePerLamport,
      version,
      pricePerToken: new Decimal4(pricePerLamport).mul(new Decimal4(10 ** (baseTokenDecimal - quoteTokenDecimal))).toString(),
      feeAmountXPerTokenStored: new BN7(0),
      feeAmountYPerTokenStored: new BN7(0),
      rewardPerTokenStored: [new BN7(0), new BN7(0)]
    };
  }
  BinLiquidity3.empty = empty;
})(BinLiquidity || (BinLiquidity = {}));
var BitmapType = /* @__PURE__ */ ((BitmapType2) => {
  BitmapType2[BitmapType2["U1024"] = 0] = "U1024";
  BitmapType2[BitmapType2["U512"] = 1] = "U512";
  return BitmapType2;
})(BitmapType || {});
var ClockLayout = struct([
  u64("slot"),
  i64("epochStartTimestamp"),
  u64("epoch"),
  u64("leaderScheduleEpoch"),
  i64("unixTimestamp")
]);
var PairStatus = /* @__PURE__ */ ((PairStatus2) => {
  PairStatus2[PairStatus2["Enabled"] = 0] = "Enabled";
  PairStatus2[PairStatus2["Disabled"] = 1] = "Disabled";
  return PairStatus2;
})(PairStatus || {});
var ActionType = /* @__PURE__ */ ((ActionType2) => {
  ActionType2[ActionType2["Liquidity"] = 0] = "Liquidity";
  ActionType2[ActionType2["Reward"] = 1] = "Reward";
  return ActionType2;
})(ActionType || {});
var MEMO_PROGRAM_ID = new PublicKey5(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

// src/dlmm/helpers/binArray.ts
function internalBitmapRange() {
  const lowerBinArrayIndex = BIN_ARRAY_BITMAP_SIZE.neg();
  const upperBinArrayIndex = BIN_ARRAY_BITMAP_SIZE.sub(new BN8(1));
  return [lowerBinArrayIndex, upperBinArrayIndex];
}
function buildBitmapFromU64Arrays(u64Arrays, type) {
  const buffer = Buffer.concat(
    u64Arrays.map((b) => {
      return b.toArrayLike(Buffer, "le", 8);
    })
  );
  return new BN8(buffer, "le");
}
function bitmapTypeDetail(type) {
  if (type == 0 /* U1024 */) {
    return {
      bits: 1024,
      bytes: 1024 / 8
    };
  } else {
    return {
      bits: 512,
      bytes: 512 / 8
    };
  }
}
function mostSignificantBit(number, bitLength) {
  const highestIndex = bitLength - 1;
  if (number.isZero()) {
    return null;
  }
  for (let i = highestIndex; i >= 0; i--) {
    if (number.testn(i)) {
      return highestIndex - i;
    }
  }
  return null;
}
function leastSignificantBit(number, bitLength) {
  if (number.isZero()) {
    return null;
  }
  for (let i = 0; i < bitLength; i++) {
    if (number.testn(i)) {
      return i;
    }
  }
  return null;
}
function extensionBitmapRange() {
  return [
    BIN_ARRAY_BITMAP_SIZE.neg().mul(
      EXTENSION_BINARRAY_BITMAP_SIZE.add(new BN8(1))
    ),
    BIN_ARRAY_BITMAP_SIZE.mul(
      EXTENSION_BINARRAY_BITMAP_SIZE.add(new BN8(1))
    ).sub(new BN8(1))
  ];
}
function findSetBit(startIndex, endIndex, binArrayBitmapExtension) {
  const getBinArrayOffset = (binArrayIndex) => {
    return binArrayIndex.gt(new BN8(0)) ? binArrayIndex.mod(BIN_ARRAY_BITMAP_SIZE) : binArrayIndex.add(new BN8(1)).neg().mod(BIN_ARRAY_BITMAP_SIZE);
  };
  const getBitmapOffset = (binArrayIndex) => {
    return binArrayIndex.gt(new BN8(0)) ? binArrayIndex.div(BIN_ARRAY_BITMAP_SIZE).sub(new BN8(1)) : binArrayIndex.add(new BN8(1)).neg().div(BIN_ARRAY_BITMAP_SIZE).sub(new BN8(1));
  };
  if (startIndex <= endIndex) {
    for (let i = startIndex; i <= endIndex; i++) {
      const binArrayOffset = getBinArrayOffset(new BN8(i)).toNumber();
      const bitmapOffset = getBitmapOffset(new BN8(i)).toNumber();
      const bitmapChunks = i > 0 ? binArrayBitmapExtension.positiveBinArrayBitmap[bitmapOffset] : binArrayBitmapExtension.negativeBinArrayBitmap[bitmapOffset];
      const bitmap = buildBitmapFromU64Arrays(bitmapChunks, 1 /* U512 */);
      if (bitmap.testn(binArrayOffset)) {
        return i;
      }
    }
  } else {
    for (let i = startIndex; i >= endIndex; i--) {
      const binArrayOffset = getBinArrayOffset(new BN8(i)).toNumber();
      const bitmapOffset = getBitmapOffset(new BN8(i)).toNumber();
      const bitmapChunks = i > 0 ? binArrayBitmapExtension.positiveBinArrayBitmap[bitmapOffset] : binArrayBitmapExtension.negativeBinArrayBitmap[bitmapOffset];
      const bitmap = buildBitmapFromU64Arrays(bitmapChunks, 1 /* U512 */);
      if (bitmap.testn(binArrayOffset)) {
        return i;
      }
    }
  }
  return null;
}
function isOverflowDefaultBinArrayBitmap(binArrayIndex) {
  const [minBinArrayIndex, maxBinArrayIndex] = internalBitmapRange();
  return binArrayIndex.gt(maxBinArrayIndex) || binArrayIndex.lt(minBinArrayIndex);
}
function deriveBinArrayBitmapExtension(lbPair, programId) {
  return PublicKey6.findProgramAddressSync(
    [Buffer.from("bitmap"), lbPair.toBytes()],
    programId
  );
}
function binIdToBinArrayIndex(binId) {
  const { div: idx, mod } = binId.divmod(MAX_BIN_ARRAY_SIZE);
  return binId.isNeg() && !mod.isZero() ? idx.sub(new BN8(1)) : idx;
}
function getBinArrayLowerUpperBinId(binArrayIndex) {
  const lowerBinId = binArrayIndex.mul(MAX_BIN_ARRAY_SIZE);
  const upperBinId = lowerBinId.add(MAX_BIN_ARRAY_SIZE).sub(new BN8(1));
  return [lowerBinId, upperBinId];
}
function isBinIdWithinBinArray(activeId, binArrayIndex) {
  const [lowerBinId, upperBinId] = getBinArrayLowerUpperBinId(binArrayIndex);
  return activeId.gte(lowerBinId) && activeId.lte(upperBinId);
}
function getBinFromBinArray(binId, binArray) {
  const [lowerBinId, upperBinId] = getBinArrayLowerUpperBinId(binArray.index);
  let index = 0;
  if (binId > 0) {
    index = binId - lowerBinId.toNumber();
  } else {
    const delta = upperBinId.toNumber() - binId;
    index = MAX_BIN_ARRAY_SIZE.toNumber() - delta - 1;
  }
  return binArray.bins[index];
}
function findNextBinArrayIndexWithLiquidity(swapForY, activeId, lbPairState, binArrayBitmapExtension) {
  const [lowerBinArrayIndex, upperBinArrayIndex] = internalBitmapRange();
  let startBinArrayIndex = binIdToBinArrayIndex(activeId);
  while (true) {
    if (isOverflowDefaultBinArrayBitmap(startBinArrayIndex)) {
      if (binArrayBitmapExtension === null) {
        return null;
      }
      const [minBinArrayIndex, maxBinArrayIndex] = extensionBitmapRange();
      if (startBinArrayIndex.isNeg()) {
        if (swapForY) {
          const binArrayIndex = findSetBit(
            startBinArrayIndex.toNumber(),
            minBinArrayIndex.toNumber(),
            binArrayBitmapExtension
          );
          if (binArrayIndex !== null) {
            return new BN8(binArrayIndex);
          } else {
            return null;
          }
        } else {
          const binArrayIndex = findSetBit(
            startBinArrayIndex.toNumber(),
            BIN_ARRAY_BITMAP_SIZE.neg().sub(new BN8(1)).toNumber(),
            binArrayBitmapExtension
          );
          if (binArrayIndex !== null) {
            return new BN8(binArrayIndex);
          } else {
            startBinArrayIndex = BIN_ARRAY_BITMAP_SIZE.neg();
          }
        }
      } else {
        if (swapForY) {
          const binArrayIndex = findSetBit(
            startBinArrayIndex.toNumber(),
            BIN_ARRAY_BITMAP_SIZE.toNumber(),
            binArrayBitmapExtension
          );
          if (binArrayIndex !== null) {
            return new BN8(binArrayIndex);
          } else {
            startBinArrayIndex = BIN_ARRAY_BITMAP_SIZE.sub(new BN8(1));
          }
        } else {
          const binArrayIndex = findSetBit(
            startBinArrayIndex.toNumber(),
            maxBinArrayIndex.toNumber(),
            binArrayBitmapExtension
          );
          if (binArrayIndex !== null) {
            return new BN8(binArrayIndex);
          } else {
            return null;
          }
        }
      }
    } else {
      const bitmapType = 0 /* U1024 */;
      const bitmapDetail = bitmapTypeDetail(bitmapType);
      const offset = startBinArrayIndex.add(BIN_ARRAY_BITMAP_SIZE);
      const bitmap = buildBitmapFromU64Arrays(
        lbPairState.binArrayBitmap,
        bitmapType
      );
      if (swapForY) {
        const upperBitRange = new BN8(bitmapDetail.bits - 1).sub(offset);
        const croppedBitmap = bitmap.shln(upperBitRange.toNumber());
        const msb = mostSignificantBit(croppedBitmap, bitmapDetail.bits);
        if (msb !== null) {
          return startBinArrayIndex.sub(new BN8(msb));
        } else {
          startBinArrayIndex = lowerBinArrayIndex.sub(new BN8(1));
        }
      } else {
        const lowerBitRange = offset;
        const croppedBitmap = bitmap.shrn(lowerBitRange.toNumber());
        const lsb = leastSignificantBit(croppedBitmap, bitmapDetail.bits);
        if (lsb !== null) {
          return startBinArrayIndex.add(new BN8(lsb));
        } else {
          startBinArrayIndex = upperBinArrayIndex.add(new BN8(1));
        }
      }
    }
  }
}
function findNextBinArrayWithLiquidity(swapForY, activeBinId, lbPairState, binArrayBitmapExtension, binArrays) {
  const nearestBinArrayIndexWithLiquidity = findNextBinArrayIndexWithLiquidity(
    swapForY,
    activeBinId,
    lbPairState,
    binArrayBitmapExtension
  );
  if (nearestBinArrayIndexWithLiquidity == null) {
    return null;
  }
  const binArrayAccount = binArrays.find(
    (ba) => ba.account.index.eq(nearestBinArrayIndexWithLiquidity)
  );
  if (!binArrayAccount) {
    return null;
  }
  return binArrayAccount;
}
function getBinArraysRequiredByPositionRange(pair, fromBinId, toBinId, programId) {
  const [minBinId, maxBinId] = fromBinId.lt(toBinId) ? [fromBinId, toBinId] : [toBinId, fromBinId];
  const positionCount = getPositionCount(minBinId, maxBinId);
  const binArrays = /* @__PURE__ */ new Map();
  for (let i = 0; i < positionCount.toNumber(); i++) {
    const lowerBinId = minBinId.add(MAX_BIN_PER_POSITION.mul(new BN8(i)));
    const lowerBinArrayIndex = binIdToBinArrayIndex(lowerBinId);
    const upperBinArrayIndex = lowerBinArrayIndex.add(new BN8(1));
    const [lowerBinArray] = deriveBinArray(pair, lowerBinArrayIndex, programId);
    const [upperBinArray] = deriveBinArray(pair, upperBinArrayIndex, programId);
    binArrays.set(lowerBinArray.toBase58(), lowerBinArrayIndex);
    binArrays.set(upperBinArray.toBase58(), upperBinArrayIndex);
  }
  return Array.from(binArrays, ([key, index]) => ({
    key: new PublicKey6(key),
    index
  }));
}
function* enumerateBins(binsById, lowerBinId, upperBinId, binStep, baseTokenDecimal, quoteTokenDecimal, version) {
  for (let currentBinId = lowerBinId; currentBinId <= upperBinId; currentBinId++) {
    const bin = binsById.get(currentBinId);
    if (bin != null) {
      yield BinLiquidity.fromBin(
        bin,
        currentBinId,
        binStep,
        baseTokenDecimal,
        quoteTokenDecimal,
        version
      );
    } else {
      yield BinLiquidity.empty(
        currentBinId,
        binStep,
        baseTokenDecimal,
        quoteTokenDecimal,
        version
      );
    }
  }
}

// src/dlmm/helpers/fee.ts
import { BN as BN9 } from "@coral-xyz/anchor";
function getBaseFee(binStep, sParameter) {
  return new BN9(sParameter.baseFactor).mul(new BN9(binStep)).mul(new BN9(10)).mul(new BN9(10).pow(new BN9(sParameter.baseFeePowerFactor)));
}
function getVariableFee(binStep, sParameter, vParameter) {
  if (sParameter.variableFeeControl > 0) {
    const square_vfa_bin = new BN9(vParameter.volatilityAccumulator).mul(new BN9(binStep)).pow(new BN9(2));
    const v_fee = new BN9(sParameter.variableFeeControl).mul(square_vfa_bin);
    return v_fee.add(new BN9(99999999999)).div(new BN9(1e11));
  }
  return new BN9(0);
}
function getTotalFee(binStep, sParameter, vParameter) {
  const totalFee = getBaseFee(binStep, sParameter).add(
    getVariableFee(binStep, sParameter, vParameter)
  );
  return totalFee.gt(MAX_FEE_RATE) ? MAX_FEE_RATE : totalFee;
}
function computeFee(binStep, sParameter, vParameter, inAmount) {
  const totalFee = getTotalFee(binStep, sParameter, vParameter);
  const denominator = FEE_PRECISION.sub(totalFee);
  return inAmount.mul(totalFee).add(denominator).sub(new BN9(1)).div(denominator);
}
function computeFeeFromAmount(binStep, sParameter, vParameter, inAmountWithFees) {
  const totalFee = getTotalFee(binStep, sParameter, vParameter);
  return inAmountWithFees.mul(totalFee).add(FEE_PRECISION.sub(new BN9(1))).div(FEE_PRECISION);
}
function computeProtocolFee(feeAmount, sParameter) {
  return feeAmount.mul(new BN9(sParameter.protocolShare)).div(new BN9(BASIS_POINT_MAX));
}
function swapExactOutQuoteAtBin(bin, binStep, sParameter, vParameter, outAmount, swapForY) {
  if (swapForY && bin.amountY.isZero()) {
    return {
      amountIn: new BN9(0),
      amountOut: new BN9(0),
      fee: new BN9(0),
      protocolFee: new BN9(0)
    };
  }
  if (!swapForY && bin.amountX.isZero()) {
    return {
      amountIn: new BN9(0),
      amountOut: new BN9(0),
      fee: new BN9(0),
      protocolFee: new BN9(0)
    };
  }
  let maxAmountOut;
  let maxAmountIn;
  if (swapForY) {
    maxAmountOut = bin.amountY;
    maxAmountIn = shlDiv(bin.amountY, bin.price, SCALE_OFFSET, 0 /* Up */);
  } else {
    maxAmountOut = bin.amountX;
    maxAmountIn = mulShr(bin.amountX, bin.price, SCALE_OFFSET, 0 /* Up */);
  }
  if (outAmount.gte(maxAmountOut)) {
    const maxFee = computeFee(binStep, sParameter, vParameter, maxAmountIn);
    const protocolFee = computeProtocolFee(maxFee, sParameter);
    return {
      amountIn: maxAmountIn,
      amountOut: maxAmountOut,
      fee: maxFee,
      protocolFee
    };
  } else {
    const amountIn = getAmountIn(outAmount, bin.price, swapForY);
    const fee = computeFee(binStep, sParameter, vParameter, amountIn);
    const protocolFee = computeProtocolFee(fee, sParameter);
    return {
      amountIn,
      amountOut: outAmount,
      fee,
      protocolFee
    };
  }
}
function swapExactInQuoteAtBin(bin, binStep, sParameter, vParameter, inAmount, swapForY) {
  if (swapForY && bin.amountY.isZero()) {
    return {
      amountIn: new BN9(0),
      amountOut: new BN9(0),
      fee: new BN9(0),
      protocolFee: new BN9(0)
    };
  }
  if (!swapForY && bin.amountX.isZero()) {
    return {
      amountIn: new BN9(0),
      amountOut: new BN9(0),
      fee: new BN9(0),
      protocolFee: new BN9(0)
    };
  }
  let maxAmountOut;
  let maxAmountIn;
  if (swapForY) {
    maxAmountOut = bin.amountY;
    maxAmountIn = shlDiv(bin.amountY, bin.price, SCALE_OFFSET, 0 /* Up */);
  } else {
    maxAmountOut = bin.amountX;
    maxAmountIn = mulShr(bin.amountX, bin.price, SCALE_OFFSET, 0 /* Up */);
  }
  const maxFee = computeFee(binStep, sParameter, vParameter, maxAmountIn);
  maxAmountIn = maxAmountIn.add(maxFee);
  let amountInWithFees;
  let amountOut;
  let fee;
  let protocolFee;
  if (inAmount.gt(maxAmountIn)) {
    amountInWithFees = maxAmountIn;
    amountOut = maxAmountOut;
    fee = maxFee;
    protocolFee = computeProtocolFee(maxFee, sParameter);
  } else {
    fee = computeFeeFromAmount(binStep, sParameter, vParameter, inAmount);
    const amountInAfterFee = inAmount.sub(fee);
    const computedOutAmount = getOutAmount(bin, amountInAfterFee, swapForY);
    amountOut = computedOutAmount.gt(maxAmountOut) ? maxAmountOut : computedOutAmount;
    protocolFee = computeProtocolFee(fee, sParameter);
    amountInWithFees = inAmount;
  }
  return {
    amountIn: amountInWithFees,
    amountOut,
    fee,
    protocolFee
  };
}
function getAmountIn(amountOut, price, swapForY) {
  if (swapForY) {
    return shlDiv(amountOut, price, SCALE_OFFSET, 0 /* Up */);
  } else {
    return mulShr(amountOut, price, SCALE_OFFSET, 0 /* Up */);
  }
}

// src/dlmm/helpers/strategy.ts
import { BN as BN10 } from "@coral-xyz/anchor";
var DEFAULT_MAX_WEIGHT = 2e3;
var DEFAULT_MIN_WEIGHT = 200;
function toWeightSpotBalanced(minBinId, maxBinId) {
  let distributions = [];
  for (let i = minBinId; i <= maxBinId; i++) {
    distributions.push({
      binId: i,
      weight: 1
    });
  }
  return distributions;
}
function toWeightDecendingOrder(minBinId, maxBinId) {
  let distributions = [];
  for (let i = minBinId; i <= maxBinId; i++) {
    distributions.push({
      binId: i,
      weight: maxBinId - i + 1
    });
  }
  return distributions;
}
function toWeightAscendingOrder(minBinId, maxBinId) {
  let distributions = [];
  for (let i = minBinId; i <= maxBinId; i++) {
    distributions.push({
      binId: i,
      weight: i - minBinId + 1
    });
  }
  return distributions;
}
function toWeightCurve(minBinId, maxBinId, activeId) {
  if (activeId < minBinId || activeId > maxBinId) {
    throw "Invalid strategy params";
  }
  let maxWeight = DEFAULT_MAX_WEIGHT;
  let minWeight = DEFAULT_MIN_WEIGHT;
  let diffWeight = maxWeight - minWeight;
  let diffMinWeight = activeId > minBinId ? Math.floor(diffWeight / (activeId - minBinId)) : 0;
  let diffMaxWeight = maxBinId > activeId ? Math.floor(diffWeight / (maxBinId - activeId)) : 0;
  let distributions = [];
  for (let i = minBinId; i <= maxBinId; i++) {
    if (i < activeId) {
      distributions.push({
        binId: i,
        weight: maxWeight - (activeId - i) * diffMinWeight
      });
    } else if (i > activeId) {
      distributions.push({
        binId: i,
        weight: maxWeight - (i - activeId) * diffMaxWeight
      });
    } else {
      distributions.push({
        binId: i,
        weight: maxWeight
      });
    }
  }
  return distributions;
}
function toWeightBidAsk(minBinId, maxBinId, activeId) {
  if (activeId < minBinId || activeId > maxBinId) {
    throw "Invalid strategy params";
  }
  let maxWeight = DEFAULT_MAX_WEIGHT;
  let minWeight = DEFAULT_MIN_WEIGHT;
  let diffWeight = maxWeight - minWeight;
  let diffMinWeight = activeId > minBinId ? Math.floor(diffWeight / (activeId - minBinId)) : 0;
  let diffMaxWeight = maxBinId > activeId ? Math.floor(diffWeight / (maxBinId - activeId)) : 0;
  let distributions = [];
  for (let i = minBinId; i <= maxBinId; i++) {
    if (i < activeId) {
      distributions.push({
        binId: i,
        weight: minWeight + (activeId - i) * diffMinWeight
      });
    } else if (i > activeId) {
      distributions.push({
        binId: i,
        weight: minWeight + (i - activeId) * diffMaxWeight
      });
    } else {
      distributions.push({
        binId: i,
        weight: minWeight
      });
    }
  }
  return distributions;
}
function toAmountsBothSideByStrategy(activeId, binStep, minBinId, maxBinId, amountX, amountY, amountXInActiveBin, amountYInActiveBin, strategyType, mintX, mintY, clock) {
  const isSingleSideX = amountY.isZero();
  switch (strategyType) {
    case 0 /* Spot */: {
      if (activeId < minBinId || activeId > maxBinId) {
        const weights = toWeightSpotBalanced(minBinId, maxBinId);
        return toAmountBothSide(
          activeId,
          binStep,
          amountX,
          amountY,
          amountXInActiveBin,
          amountYInActiveBin,
          weights,
          mintX,
          mintY,
          clock
        );
      }
      const amountsInBin = [];
      if (!isSingleSideX) {
        if (minBinId <= activeId) {
          const weights = toWeightSpotBalanced(minBinId, activeId);
          const amounts = toAmountBidSide(
            activeId,
            amountY,
            weights,
            mintY,
            clock
          );
          for (let bin of amounts) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: new BN10(0),
              amountY: bin.amount
            });
          }
        }
        if (activeId < maxBinId) {
          const weights = toWeightSpotBalanced(activeId + 1, maxBinId);
          const amounts = toAmountAskSide(
            activeId,
            binStep,
            amountX,
            weights,
            mintX,
            clock
          );
          for (let bin of amounts) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: bin.amount,
              amountY: new BN10(0)
            });
          }
        }
      } else {
        if (minBinId < activeId) {
          const weights = toWeightSpotBalanced(minBinId, activeId - 1);
          const amountsIntoBidSide = toAmountBidSide(
            activeId,
            amountY,
            weights,
            mintY,
            clock
          );
          for (let bin of amountsIntoBidSide) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: new BN10(0),
              amountY: bin.amount
            });
          }
        }
        if (activeId <= maxBinId) {
          const weights = toWeightSpotBalanced(activeId, maxBinId);
          const amountsIntoAskSide = toAmountAskSide(
            activeId,
            binStep,
            amountX,
            weights,
            mintX,
            clock
          );
          for (let bin of amountsIntoAskSide) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: bin.amount,
              amountY: new BN10(0)
            });
          }
        }
      }
      return amountsInBin;
    }
    case 1 /* Curve */: {
      if (activeId < minBinId) {
        let weights = toWeightDecendingOrder(minBinId, maxBinId);
        return toAmountBothSide(
          activeId,
          binStep,
          amountX,
          amountY,
          amountXInActiveBin,
          amountYInActiveBin,
          weights,
          mintX,
          mintY,
          clock
        );
      }
      if (activeId > maxBinId) {
        const weights = toWeightAscendingOrder(minBinId, maxBinId);
        return toAmountBothSide(
          activeId,
          binStep,
          amountX,
          amountY,
          amountXInActiveBin,
          amountYInActiveBin,
          weights,
          mintX,
          mintY,
          clock
        );
      }
      const amountsInBin = [];
      if (!isSingleSideX) {
        if (minBinId <= activeId) {
          const weights = toWeightAscendingOrder(minBinId, activeId);
          const amounts = toAmountBidSide(
            activeId,
            amountY,
            weights,
            mintY,
            clock
          );
          for (let bin of amounts) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: new BN10(0),
              amountY: bin.amount
            });
          }
        }
        if (activeId < maxBinId) {
          const weights = toWeightDecendingOrder(activeId + 1, maxBinId);
          const amounts = toAmountAskSide(
            activeId,
            binStep,
            amountX,
            weights,
            mintX,
            clock
          );
          for (let bin of amounts) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: bin.amount,
              amountY: new BN10(0)
            });
          }
        }
      } else {
        if (minBinId < activeId) {
          const weights = toWeightAscendingOrder(minBinId, activeId - 1);
          const amountsIntoBidSide = toAmountBidSide(
            activeId,
            amountY,
            weights,
            mintY,
            clock
          );
          for (let bin of amountsIntoBidSide) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: new BN10(0),
              amountY: bin.amount
            });
          }
        }
        if (activeId <= maxBinId) {
          const weights = toWeightDecendingOrder(activeId, maxBinId);
          const amountsIntoAskSide = toAmountAskSide(
            activeId,
            binStep,
            amountX,
            weights,
            mintX,
            clock
          );
          for (let bin of amountsIntoAskSide) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: bin.amount,
              amountY: new BN10(0)
            });
          }
        }
      }
      return amountsInBin;
    }
    case 2 /* BidAsk */: {
      if (activeId < minBinId) {
        const weights = toWeightAscendingOrder(minBinId, maxBinId);
        return toAmountBothSide(
          activeId,
          binStep,
          amountX,
          amountY,
          amountXInActiveBin,
          amountYInActiveBin,
          weights,
          mintX,
          mintY,
          clock
        );
      }
      if (activeId > maxBinId) {
        const weights = toWeightDecendingOrder(minBinId, maxBinId);
        return toAmountBothSide(
          activeId,
          binStep,
          amountX,
          amountY,
          amountXInActiveBin,
          amountYInActiveBin,
          weights,
          mintX,
          mintY,
          clock
        );
      }
      const amountsInBin = [];
      if (!isSingleSideX) {
        if (minBinId <= activeId) {
          const weights = toWeightDecendingOrder(minBinId, activeId);
          const amounts = toAmountBidSide(
            activeId,
            amountY,
            weights,
            mintY,
            clock
          );
          for (let bin of amounts) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: new BN10(0),
              amountY: bin.amount
            });
          }
        }
        if (activeId < maxBinId) {
          const weights = toWeightAscendingOrder(activeId + 1, maxBinId);
          const amounts = toAmountAskSide(
            activeId,
            binStep,
            amountX,
            weights,
            mintX,
            clock
          );
          for (let bin of amounts) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: bin.amount,
              amountY: new BN10(0)
            });
          }
        }
      } else {
        if (minBinId < activeId) {
          const weights = toWeightDecendingOrder(minBinId, activeId - 1);
          const amountsIntoBidSide = toAmountBidSide(
            activeId,
            amountY,
            weights,
            mintY,
            clock
          );
          for (let bin of amountsIntoBidSide) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: new BN10(0),
              amountY: bin.amount
            });
          }
        }
        if (activeId <= maxBinId) {
          const weights = toWeightAscendingOrder(activeId, maxBinId);
          const amountsIntoAskSide = toAmountAskSide(
            activeId,
            binStep,
            amountX,
            weights,
            mintX,
            clock
          );
          for (let bin of amountsIntoAskSide) {
            amountsInBin.push({
              binId: bin.binId,
              amountX: bin.amount,
              amountY: new BN10(0)
            });
          }
        }
      }
      return amountsInBin;
    }
    case 0 /* Spot */: {
      let weights = toWeightSpotBalanced(minBinId, maxBinId);
      return toAmountBothSide(
        activeId,
        binStep,
        amountX,
        amountY,
        amountXInActiveBin,
        amountYInActiveBin,
        weights,
        mintX,
        mintY,
        clock
      );
    }
    case 1 /* Curve */: {
      let weights = toWeightCurve(minBinId, maxBinId, activeId);
      return toAmountBothSide(
        activeId,
        binStep,
        amountX,
        amountY,
        amountXInActiveBin,
        amountYInActiveBin,
        weights,
        mintX,
        mintY,
        clock
      );
    }
    case 2 /* BidAsk */: {
      let weights = toWeightBidAsk(minBinId, maxBinId, activeId);
      return toAmountBothSide(
        activeId,
        binStep,
        amountX,
        amountY,
        amountXInActiveBin,
        amountYInActiveBin,
        weights,
        mintX,
        mintY,
        clock
      );
    }
  }
}
function autoFillYByStrategy(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, minBinId, maxBinId, strategyType) {
  switch (strategyType) {
    case 0 /* Spot */: {
      let weights = toWeightSpotBalanced(minBinId, maxBinId);
      return autoFillYByWeight(
        activeId,
        binStep,
        amountX,
        amountXInActiveBin,
        amountYInActiveBin,
        weights
      );
    }
    case 1 /* Curve */: {
      let weights = toWeightCurve(minBinId, maxBinId, activeId);
      return autoFillYByWeight(
        activeId,
        binStep,
        amountX,
        amountXInActiveBin,
        amountYInActiveBin,
        weights
      );
    }
    case 2 /* BidAsk */: {
      let weights = toWeightBidAsk(minBinId, maxBinId, activeId);
      return autoFillYByWeight(
        activeId,
        binStep,
        amountX,
        amountXInActiveBin,
        amountYInActiveBin,
        weights
      );
    }
  }
}
function autoFillXByStrategy(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, minBinId, maxBinId, strategyType) {
  switch (strategyType) {
    case 0 /* Spot */: {
      let weights = toWeightSpotBalanced(minBinId, maxBinId);
      return autoFillXByWeight(
        activeId,
        binStep,
        amountY,
        amountXInActiveBin,
        amountYInActiveBin,
        weights
      );
    }
    case 1 /* Curve */: {
      let weights = toWeightCurve(minBinId, maxBinId, activeId);
      return autoFillXByWeight(
        activeId,
        binStep,
        amountY,
        amountXInActiveBin,
        amountYInActiveBin,
        weights
      );
    }
    case 2 /* BidAsk */: {
      let weights = toWeightBidAsk(minBinId, maxBinId, activeId);
      return autoFillXByWeight(
        activeId,
        binStep,
        amountY,
        amountXInActiveBin,
        amountYInActiveBin,
        weights
      );
    }
  }
}
function toStrategyParameters({
  maxBinId,
  minBinId,
  strategyType,
  singleSidedX
}) {
  const parameters = [singleSidedX ? 1 : 0, ...new Array(63).fill(0)];
  switch (strategyType) {
    case 0 /* Spot */: {
      return {
        minBinId,
        maxBinId,
        strategyType: { spotImBalanced: {} },
        parameteres: Buffer.from(parameters).toJSON().data
      };
    }
    case 1 /* Curve */: {
      return {
        minBinId,
        maxBinId,
        strategyType: { curveImBalanced: {} },
        parameteres: Buffer.from(parameters).toJSON().data
      };
    }
    case 2 /* BidAsk */: {
      return {
        minBinId,
        maxBinId,
        strategyType: { bidAskImBalanced: {} },
        parameteres: Buffer.from(parameters).toJSON().data
      };
    }
  }
}

// src/dlmm/helpers/lbPair.ts
import { AnchorProvider, Program as Program2 } from "@coral-xyz/anchor";
import { PublicKey as PublicKey7 } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID as TOKEN_2022_PROGRAM_ID2, TOKEN_PROGRAM_ID as TOKEN_PROGRAM_ID2 } from "@solana/spl-token";
async function getTokensMintFromPoolAddress(connection, poolAddress, opt) {
  const provider = new AnchorProvider(
    connection,
    {},
    AnchorProvider.defaultOptions()
  );
  const program = new Program2(
    IDL,
    opt.programId ?? LBCLMM_PROGRAM_IDS[opt?.cluster ?? "mainnet-beta"],
    provider
  );
  const poolAccount = await program.account.lbPair.fetchNullable(
    new PublicKey7(poolAddress)
  );
  if (!poolAccount)
    throw new Error("Pool account not found");
  return {
    tokenXMint: poolAccount.tokenXMint,
    tokenYMint: poolAccount.tokenYMint
  };
}
function getTokenProgramId(lbPairState) {
  const getTokenProgramIdByFlag = (flag) => {
    return flag == 0 ? TOKEN_PROGRAM_ID2 : TOKEN_2022_PROGRAM_ID2;
  };
  return {
    tokenXProgram: getTokenProgramIdByFlag(lbPairState.tokenMintXProgramFlag),
    tokenYProgram: getTokenProgramIdByFlag(lbPairState.tokenMintYProgramFlag)
  };
}

// src/dlmm/helpers/index.ts
function chunks(array, size) {
  return Array.apply(0, new Array(Math.ceil(array.length / size))).map(
    (_, index) => array.slice(index * size, (index + 1) * size)
  );
}
function range(min, max, mapfn) {
  const length = max - min + 1;
  return Array.from({ length }, (_, i) => mapfn(min + i));
}
async function chunkedFetchMultiplePoolAccount(program, pks, chunkSize = 100) {
  const accounts = (await Promise.all(
    chunks(pks, chunkSize).map(
      (chunk) => program.account.lbPair.fetchMultiple(chunk)
    )
  )).flat();
  return accounts.filter(Boolean);
}
async function chunkedFetchMultipleBinArrayBitmapExtensionAccount(program, pks, chunkSize = 100) {
  const accounts = (await Promise.all(
    chunks(pks, chunkSize).map(
      (chunk) => program.account.binArrayBitmapExtension.fetchMultiple(chunk)
    )
  )).flat();
  return accounts;
}
function getOutAmount(bin, inAmount, swapForY) {
  return swapForY ? mulShr(inAmount, bin.price, SCALE_OFFSET, 1 /* Down */) : shlDiv(inAmount, bin.price, SCALE_OFFSET, 1 /* Down */);
}
async function getTokenDecimals(conn, mint) {
  const token = await getMint(conn, mint);
  return await token.decimals;
}
var getOrCreateATAInstruction = async (connection, tokenMint, owner, programId, payer = owner, allowOwnerOffCurve = true) => {
  programId = programId ?? TOKEN_PROGRAM_ID3;
  const toAccount = getAssociatedTokenAddressSync(
    tokenMint,
    owner,
    allowOwnerOffCurve,
    programId,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  try {
    await getAccount(connection, toAccount, connection.commitment, programId);
    return { ataPubKey: toAccount, ix: void 0 };
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError || e instanceof TokenInvalidAccountOwnerError) {
      const ix = createAssociatedTokenAccountIdempotentInstruction(
        payer,
        toAccount,
        owner,
        tokenMint,
        programId,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      return { ataPubKey: toAccount, ix };
    } else {
      console.error("Error::getOrCreateATAInstruction", e);
      throw e;
    }
  }
};
async function getTokenBalance(conn, tokenAccount) {
  const acc = await getAccount(conn, tokenAccount);
  return acc.amount;
}
var parseLogs = (eventParser, logs) => {
  if (!logs.length)
    throw new Error("No logs found");
  for (const event of eventParser?.parseLogs(logs)) {
    return event.data;
  }
  throw new Error("No events found");
};
var wrapSOLInstruction = (from, to, amount) => {
  return [
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: amount
    }),
    new TransactionInstruction3({
      keys: [
        {
          pubkey: to,
          isSigner: false,
          isWritable: true
        }
      ],
      data: Buffer.from(new Uint8Array([17])),
      programId: TOKEN_PROGRAM_ID3
    })
  ];
};
var unwrapSOLInstruction = async (owner, allowOwnerOffCurve = true) => {
  const wSolATAAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT,
    owner,
    allowOwnerOffCurve
  );
  if (wSolATAAccount) {
    const closedWrappedSolInstruction = createCloseAccountInstruction(
      wSolATAAccount,
      owner,
      owner,
      [],
      TOKEN_PROGRAM_ID3
    );
    return closedWrappedSolInstruction;
  }
  return null;
};
async function chunkedGetMultipleAccountInfos(connection, pks, chunkSize = 100) {
  const accountInfos = (await Promise.all(
    chunks(pks, chunkSize).map(
      (chunk) => connection.getMultipleAccountsInfo(chunk)
    )
  )).flat();
  return accountInfos;
}
var getEstimatedComputeUnitUsageWithBuffer = async (connection, instructions, feePayer, buffer) => {
  if (!buffer) {
    buffer = 0.1;
  }
  buffer = Math.max(0, buffer);
  buffer = Math.min(1, buffer);
  const estimatedComputeUnitUsage = await getSimulationComputeUnits(
    connection,
    instructions,
    feePayer,
    []
  );
  let extraComputeUnitBuffer = estimatedComputeUnitUsage * buffer;
  if (extraComputeUnitBuffer > MAX_CU_BUFFER) {
    extraComputeUnitBuffer = MAX_CU_BUFFER;
  } else if (extraComputeUnitBuffer < MIN_CU_BUFFER) {
    extraComputeUnitBuffer = MIN_CU_BUFFER;
  }
  return estimatedComputeUnitUsage + extraComputeUnitBuffer;
};
var getEstimatedComputeUnitIxWithBuffer = async (connection, instructions, feePayer, buffer) => {
  const units = await getEstimatedComputeUnitUsageWithBuffer(
    connection,
    instructions,
    feePayer,
    buffer
  ).catch((error) => {
    console.error("Error::getEstimatedComputeUnitUsageWithBuffer", error);
    return 14e5;
  });
  return ComputeBudgetProgram2.setComputeUnitLimit({ units });
};

// src/dlmm/helpers/accountFilters.ts
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
var presetParameter2BinStepFilter = (binStep) => {
  return {
    memcmp: {
      bytes: bs58.encode(binStep.toArrayLike(Buffer, "le", 2)),
      offset: 8
    }
  };
};
var presetParameter2BaseFactorFilter = (baseFactor) => {
  return {
    memcmp: {
      bytes: bs58.encode(baseFactor.toArrayLike(Buffer, "le", 2)),
      offset: 8 + 2
    }
  };
};
var presetParameter2BaseFeePowerFactor = (baseFeePowerFactor) => {
  return {
    memcmp: {
      bytes: bs58.encode(baseFeePowerFactor.toArrayLike(Buffer, "le", 1)),
      offset: 8 + 22
    }
  };
};
var binArrayLbPairFilter = (lbPair) => {
  return {
    memcmp: {
      bytes: lbPair.toBase58(),
      offset: 8 + 16
    }
  };
};
var positionOwnerFilter = (owner) => {
  return {
    memcmp: {
      bytes: owner.toBase58(),
      offset: 8 + 32
    }
  };
};
var positionLbPairFilter = (lbPair) => {
  return {
    memcmp: {
      bytes: bs58.encode(lbPair.toBuffer()),
      offset: 8
    }
  };
};

// src/dlmm/helpers/positions/index.ts
import BN12 from "bn.js";

// src/dlmm/helpers/positions/wrapper.ts
import BN11 from "bn.js";
function wrapPosition(program, key, account) {
  const disc = account.data.subarray(0, 8);
  if (disc.equals(POSITION_V2_DISC)) {
    const state = program.coder.accounts.decode(
      program.account.positionV2.idlAccount.name,
      account.data
    );
    return new PositionV2Wrapper(key, state);
  } else {
    throw new Error("Unknown position account");
  }
}
var PositionV2Wrapper = class {
  constructor(positionAddress, inner) {
    this.positionAddress = positionAddress;
    this.inner = inner;
  }
  address() {
    return this.positionAddress;
  }
  totalClaimedRewards() {
    return this.inner.totalClaimedRewards;
  }
  feeOwner() {
    return this.inner.feeOwner;
  }
  lockReleasePoint() {
    return this.inner.lockReleasePoint;
  }
  operator() {
    return this.inner.operator;
  }
  totalClaimedFeeYAmount() {
    return this.inner.totalClaimedFeeYAmount;
  }
  totalClaimedFeeXAmount() {
    return this.inner.totalClaimedFeeXAmount;
  }
  lbPair() {
    return this.inner.lbPair;
  }
  lowerBinId() {
    return new BN11(this.inner.lowerBinId);
  }
  upperBinId() {
    return new BN11(this.inner.upperBinId);
  }
  liquidityShares() {
    return this.inner.liquidityShares;
  }
  rewardInfos() {
    return this.inner.rewardInfos;
  }
  feeInfos() {
    return this.inner.feeInfos;
  }
  lastUpdatedAt() {
    return this.inner.lastUpdatedAt;
  }
  getBinArrayIndexesCoverage() {
    const lowerBinArrayIndex = binIdToBinArrayIndex(this.lowerBinId());
    const upperBinArrayIndex = lowerBinArrayIndex.add(new BN11(1));
    return [lowerBinArrayIndex, upperBinArrayIndex];
  }
  getBinArrayKeysCoverage(programId) {
    return this.getBinArrayIndexesCoverage().map(
      (index) => deriveBinArray(this.lbPair(), index, programId)[0]
    );
  }
  version() {
    return 1 /* V2 */;
  }
  owner() {
    return this.inner.owner;
  }
};

// src/dlmm/helpers/positions/index.ts
function getBinArrayIndexesCoverage(lowerBinId, upperBinId) {
  const lowerBinArrayIndex = binIdToBinArrayIndex(lowerBinId);
  const upperBinArrayIndex = binIdToBinArrayIndex(upperBinId);
  const binArrayIndexes = [];
  for (let i = lowerBinArrayIndex.toNumber(); i <= upperBinArrayIndex.toNumber(); i++) {
    binArrayIndexes.push(new BN12(i));
  }
  return binArrayIndexes;
}
function getBinArrayKeysCoverage(lowerBinId, upperBinId, lbPair, programId) {
  const binArrayIndexes = getBinArrayIndexesCoverage(lowerBinId, upperBinId);
  return binArrayIndexes.map((index) => {
    return deriveBinArray(lbPair, index, programId)[0];
  });
}
function getBinArrayAccountMetasCoverage(lowerBinId, upperBinId, lbPair, programId) {
  return getBinArrayKeysCoverage(lowerBinId, upperBinId, lbPair, programId).map(
    (key) => {
      return {
        pubkey: key,
        isSigner: false,
        isWritable: true
      };
    }
  );
}
function getPositionLowerUpperBinIdWithLiquidity(position) {
  const binWithLiquidity = position.positionBinData.filter(
    (b) => !new BN12(b.binLiquidity).isZero()
  );
  return binWithLiquidity.length > 0 ? {
    lowerBinId: new BN12(binWithLiquidity[0].binId),
    upperBinId: new BN12(binWithLiquidity[binWithLiquidity.length - 1].binId)
  } : null;
}

// src/dlmm/index.ts
import { bs58 as bs582 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
var DLMM = class {
  constructor(pubkey, program, lbPair, binArrayBitmapExtension, tokenX, tokenY, rewards, clock, opt) {
    this.pubkey = pubkey;
    this.program = program;
    this.lbPair = lbPair;
    this.binArrayBitmapExtension = binArrayBitmapExtension;
    this.tokenX = tokenX;
    this.tokenY = tokenY;
    this.rewards = rewards;
    this.clock = clock;
    this.opt = opt;
  }
  /** Static public method */
  /**
   * The function `getLbPairs` retrieves a list of LB pair accounts using a connection and optional
   * parameters.
   * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
   * class, which represents the connection to the Solana blockchain network.
   * @param {Opt} [opt] - The `opt` parameter is an optional object that contains additional options
   * for the function. It can have the following properties:
   * @returns The function `getLbPairs` returns a Promise that resolves to an array of
   * `LbPairAccount` objects.
   */
  static async getLbPairs(connection, opt) {
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[opt?.cluster ?? "mainnet-beta"],
      provider
    );
    return program.account.lbPair.all();
  }
  /**
   * Retrieves the public key of a LB pair if it exists.
   * @param connection The connection to the Solana cluster.
   * @param tokenX The mint address of token X.
   * @param tokenY The mint address of token Y.
   * @param binStep The bin step of the LB pair.
   * @param baseFactor The base factor of the LB pair.
   * @param baseFeePowerFactor The base fee power factor of the LB pair. It allow small bin step to have bigger fee rate.
   * @param opt Optional parameters.
   * @returns The public key of the LB pair if it exists, or null.
   */
  static async getPairPubkeyIfExists(connection, tokenX, tokenY, binStep, baseFactor, baseFeePowerFactor, opt) {
    const cluster = opt?.cluster || "mainnet-beta";
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[cluster],
      provider
    );
    try {
      const [lbPair2Key] = deriveLbPair2(
        tokenX,
        tokenY,
        binStep,
        baseFactor,
        program.programId
      );
      const account2 = await program.account.lbPair.fetchNullable(lbPair2Key);
      if (account2)
        return lbPair2Key;
      const [lbPairKey] = deriveLbPair(
        tokenX,
        tokenY,
        binStep,
        program.programId
      );
      const account = await program.account.lbPair.fetchNullable(lbPairKey);
      if (account && account.parameters.baseFactor === baseFactor.toNumber()) {
        return lbPairKey;
      }
      const presetParametersWithIndex = await program.account.presetParameter2.all([
        presetParameter2BinStepFilter(binStep),
        presetParameter2BaseFactorFilter(baseFactor),
        presetParameter2BaseFeePowerFactor(baseFeePowerFactor)
      ]);
      if (presetParametersWithIndex.length > 0) {
        const possibleLbPairKeys = presetParametersWithIndex.map((account3) => {
          return deriveLbPairWithPresetParamWithIndexKey(
            account3.publicKey,
            tokenX,
            tokenY,
            program.programId
          )[0];
        });
        const accounts = await chunkedGetMultipleAccountInfos(
          program.provider.connection,
          possibleLbPairKeys
        );
        for (let i = 0; i < possibleLbPairKeys.length; i++) {
          const pairKey = possibleLbPairKeys[i];
          const account3 = accounts[i];
          if (account3) {
            return pairKey;
          }
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  static async getCustomizablePermissionlessLbPairIfExists(connection, tokenX, tokenY, opt) {
    const cluster = opt?.cluster || "mainnet-beta";
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[cluster],
      provider
    );
    try {
      const [lpPair] = deriveCustomizablePermissionlessLbPair(
        tokenX,
        tokenY,
        program.programId
      );
      const account = await program.account.lbPair.fetchNullable(lpPair);
      if (account)
        return lpPair;
      return null;
    } catch (error) {
      return null;
    }
  }
  /**
   * The `create` function is a static method that creates a new instance of the `DLMM` class
   * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
   * class, which represents the connection to the Solana blockchain network.
   * @param {PublicKey} dlmm - The PublicKey of LB Pair.
   * @param {Opt} [opt] - The `opt` parameter is an optional object that can contain additional options
   * for the `create` function. It has the following properties:
   * @returns The `create` function returns a `Promise` that resolves to a `DLMM` object.
   */
  static async create(connection, dlmm, opt) {
    const cluster = opt?.cluster || "mainnet-beta";
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[cluster],
      provider
    );
    const binArrayBitMapExtensionPubkey = deriveBinArrayBitmapExtension(
      dlmm,
      program.programId
    )[0];
    let accountsToFetch = [
      dlmm,
      binArrayBitMapExtensionPubkey,
      SYSVAR_CLOCK_PUBKEY
    ];
    const accountsInfo = await chunkedGetMultipleAccountInfos(
      connection,
      accountsToFetch
    );
    const lbPairAccountInfoBuffer = accountsInfo[0]?.data;
    if (!lbPairAccountInfoBuffer)
      throw new Error(`LB Pair account ${dlmm.toBase58()} not found`);
    const lbPairAccInfo = program.coder.accounts.decode(
      program.account.lbPair.idlAccount.name,
      lbPairAccountInfoBuffer
    );
    const binArrayBitMapAccountInfoBuffer = accountsInfo[1]?.data;
    let binArrayBitMapExtensionAccInfo = null;
    if (binArrayBitMapAccountInfoBuffer) {
      binArrayBitMapExtensionAccInfo = program.coder.accounts.decode(
        program.account.binArrayBitmapExtension.idlAccount.name,
        binArrayBitMapAccountInfoBuffer
      );
    }
    const clockAccountInfoBuffer = accountsInfo[2]?.data;
    if (!clockAccountInfoBuffer)
      throw new Error(`Clock account not found`);
    const clock = ClockLayout.decode(clockAccountInfoBuffer);
    accountsToFetch = [
      lbPairAccInfo.reserveX,
      lbPairAccInfo.reserveY,
      lbPairAccInfo.tokenXMint,
      lbPairAccInfo.tokenYMint,
      lbPairAccInfo.rewardInfos[0].vault,
      lbPairAccInfo.rewardInfos[1].vault,
      lbPairAccInfo.rewardInfos[0].mint,
      lbPairAccInfo.rewardInfos[1].mint
    ];
    const [
      reserveXAccount,
      reserveYAccount,
      tokenXMintAccount,
      tokenYMintAccount,
      reward0VaultAccount,
      reward1VaultAccount,
      reward0MintAccount,
      reward1MintAccount
    ] = await chunkedGetMultipleAccountInfos(
      program.provider.connection,
      accountsToFetch
    );
    let binArrayBitmapExtension;
    if (binArrayBitMapExtensionAccInfo) {
      binArrayBitmapExtension = {
        account: binArrayBitMapExtensionAccInfo,
        publicKey: binArrayBitMapExtensionPubkey
      };
    }
    const reserveXBalance = AccountLayout.decode(reserveXAccount.data);
    const reserveYBalance = AccountLayout.decode(reserveYAccount.data);
    const mintX = unpackMint2(
      lbPairAccInfo.tokenXMint,
      tokenXMintAccount,
      tokenXMintAccount.owner
    );
    const mintY = unpackMint2(
      lbPairAccInfo.tokenYMint,
      tokenYMintAccount,
      tokenYMintAccount.owner
    );
    const [
      tokenXTransferHook,
      tokenYTransferHook,
      reward0TransferHook,
      reward1TransferHook
    ] = await Promise.all([
      getExtraAccountMetasForTransferHook(
        connection,
        lbPairAccInfo.tokenXMint,
        tokenXMintAccount
      ),
      getExtraAccountMetasForTransferHook(
        connection,
        lbPairAccInfo.tokenYMint,
        tokenYMintAccount
      ),
      reward0MintAccount ? getExtraAccountMetasForTransferHook(
        connection,
        lbPairAccInfo.rewardInfos[0].mint,
        reward0MintAccount
      ) : [],
      reward1MintAccount ? getExtraAccountMetasForTransferHook(
        connection,
        lbPairAccInfo.rewardInfos[1].mint,
        reward1MintAccount
      ) : []
    ]);
    const tokenX = {
      publicKey: lbPairAccInfo.tokenXMint,
      reserve: lbPairAccInfo.reserveX,
      amount: reserveXBalance.amount,
      mint: mintX,
      owner: tokenXMintAccount.owner,
      transferHookAccountMetas: tokenXTransferHook
    };
    const tokenY = {
      publicKey: lbPairAccInfo.tokenYMint,
      reserve: lbPairAccInfo.reserveY,
      amount: reserveYBalance.amount,
      mint: mintY,
      owner: tokenYMintAccount.owner,
      transferHookAccountMetas: tokenYTransferHook
    };
    const reward0 = !lbPairAccInfo.rewardInfos[0].mint.equals(
      PublicKey9.default
    ) ? {
      publicKey: lbPairAccInfo.rewardInfos[0].mint,
      reserve: lbPairAccInfo.rewardInfos[0].vault,
      amount: AccountLayout.decode(reward0VaultAccount.data).amount,
      mint: unpackMint2(
        lbPairAccInfo.rewardInfos[0].mint,
        reward0MintAccount,
        reward0MintAccount.owner
      ),
      owner: reward0MintAccount.owner,
      transferHookAccountMetas: reward0TransferHook
    } : null;
    const reward1 = !lbPairAccInfo.rewardInfos[1].mint.equals(
      PublicKey9.default
    ) ? {
      publicKey: lbPairAccInfo.rewardInfos[1].mint,
      reserve: lbPairAccInfo.rewardInfos[1].vault,
      amount: AccountLayout.decode(reward1VaultAccount.data).amount,
      mint: unpackMint2(
        lbPairAccInfo.rewardInfos[1].mint,
        reward1MintAccount,
        reward1MintAccount.owner
      ),
      owner: reward1MintAccount.owner,
      transferHookAccountMetas: reward1TransferHook
    } : null;
    return new DLMM(
      dlmm,
      program,
      lbPairAccInfo,
      binArrayBitmapExtension,
      tokenX,
      tokenY,
      [reward0, reward1],
      clock,
      opt
    );
  }
  /**
   * Similar to `create` function, but it accept multiple lbPairs to be initialized.
   * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
   * class, which represents the connection to the Solana blockchain network.
   * @param dlmmList - An Array of PublicKey of LB Pairs.
   * @param {Opt} [opt] - An optional parameter of type `Opt`.
   * @returns The function `createMultiple` returns a Promise that resolves to an array of `DLMM`
   * objects.
   */
  static async createMultiple(connection, dlmmList, opt) {
    const cluster = opt?.cluster || "mainnet-beta";
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[cluster],
      provider
    );
    const binArrayBitMapExtensions = dlmmList.map(
      (lbPair) => deriveBinArrayBitmapExtension(lbPair, program.programId)[0]
    );
    const accountsToFetch = [
      ...dlmmList,
      ...binArrayBitMapExtensions,
      SYSVAR_CLOCK_PUBKEY
    ];
    let accountsInfo = await chunkedGetMultipleAccountInfos(
      connection,
      accountsToFetch
    );
    const clockAccount = accountsInfo.pop();
    const clockAccountInfoBuffer = clockAccount?.data;
    if (!clockAccountInfoBuffer)
      throw new Error(`Clock account not found`);
    const clock = ClockLayout.decode(clockAccountInfoBuffer);
    const lbPairArraysMap = /* @__PURE__ */ new Map();
    for (let i = 0; i < dlmmList.length; i++) {
      const lbPairPubKey = dlmmList[i];
      const lbPairAccountInfoBuffer = accountsInfo[i]?.data;
      if (!lbPairAccountInfoBuffer)
        throw new Error(`LB Pair account ${lbPairPubKey.toBase58()} not found`);
      const binArrayAccInfo = program.coder.accounts.decode(
        program.account.lbPair.idlAccount.name,
        lbPairAccountInfoBuffer
      );
      lbPairArraysMap.set(lbPairPubKey.toBase58(), binArrayAccInfo);
    }
    const binArrayBitMapExtensionsMap = /* @__PURE__ */ new Map();
    for (let i = dlmmList.length; i < accountsInfo.length; i++) {
      const index = i - dlmmList.length;
      const lbPairPubkey = dlmmList[index];
      const binArrayBitMapAccountInfoBuffer = accountsInfo[i]?.data;
      if (binArrayBitMapAccountInfoBuffer) {
        const binArrayBitMapExtensionAccInfo = program.coder.accounts.decode(
          program.account.binArrayBitmapExtension.idlAccount.name,
          binArrayBitMapAccountInfoBuffer
        );
        binArrayBitMapExtensionsMap.set(
          lbPairPubkey.toBase58(),
          binArrayBitMapExtensionAccInfo
        );
      }
    }
    const reservePublicKeys = Array.from(lbPairArraysMap.values()).map(({ reserveX, reserveY }) => [reserveX, reserveY]).flat();
    const tokenMintPublicKeys = Array.from(lbPairArraysMap.values()).map(({ tokenXMint, tokenYMint }) => [tokenXMint, tokenYMint]).flat();
    const rewardVaultPublicKeys = Array.from(lbPairArraysMap.values()).map(({ rewardInfos }) => rewardInfos.map(({ vault }) => vault)).flat();
    const rewardMintPublicKeys = Array.from(lbPairArraysMap.values()).map(({ rewardInfos }) => rewardInfos.map(({ mint }) => mint)).flat();
    accountsInfo = await chunkedGetMultipleAccountInfos(
      program.provider.connection,
      [
        ...reservePublicKeys,
        ...tokenMintPublicKeys,
        ...rewardVaultPublicKeys,
        ...rewardMintPublicKeys
      ]
    );
    const offsetToTokenMint = reservePublicKeys.length;
    const offsetToRewardMint = reservePublicKeys.length + tokenMintPublicKeys.length + rewardVaultPublicKeys.length;
    const tokenMintAccounts = accountsInfo.slice(
      offsetToTokenMint,
      offsetToTokenMint + tokenMintPublicKeys.length
    );
    const rewardMintAccounts = accountsInfo.slice(
      offsetToRewardMint,
      offsetToRewardMint + rewardMintPublicKeys.length
    );
    const tokenMintsWithAccount = tokenMintPublicKeys.map((key, idx) => {
      return {
        mintAddress: key,
        mintAccountInfo: tokenMintAccounts[idx]
      };
    }).filter(({ mintAddress }) => mintAddress !== PublicKey9.default);
    const rewardMintsWithAccount = rewardMintPublicKeys.map((key, idx) => {
      return {
        mintAddress: key,
        mintAccountInfo: rewardMintAccounts[idx]
      };
    }).filter(({ mintAddress }) => mintAddress !== PublicKey9.default);
    const uniqueMintWithAccounts = Array.from(
      new Set(tokenMintsWithAccount.concat(rewardMintsWithAccount))
    );
    const mintHookAccountsMap = await getMultipleMintsExtraAccountMetasForTransferHook(
      connection,
      uniqueMintWithAccounts
    );
    const lbClmmImpl = dlmmList.map((lbPair, index) => {
      const lbPairState = lbPairArraysMap.get(lbPair.toBase58());
      if (!lbPairState)
        throw new Error(`LB Pair ${lbPair.toBase58()} state not found`);
      const binArrayBitmapExtensionState = binArrayBitMapExtensionsMap.get(
        lbPair.toBase58()
      );
      const binArrayBitmapExtensionPubkey = binArrayBitMapExtensions[index];
      let binArrayBitmapExtension = null;
      if (binArrayBitmapExtensionState) {
        binArrayBitmapExtension = {
          account: binArrayBitmapExtensionState,
          publicKey: binArrayBitmapExtensionPubkey
        };
      }
      const reserveXAccountInfo = accountsInfo[index * 2];
      const reserveYAccountInfo = accountsInfo[index * 2 + 1];
      let offsetToTokenMint2 = reservePublicKeys.length;
      const tokenXMintAccountInfo = accountsInfo[offsetToTokenMint2 + index * 2];
      const tokenYMintAccountInfo = accountsInfo[offsetToTokenMint2 + index * 2 + 1];
      const offsetToRewardVaultAccountInfos = offsetToTokenMint2 + tokenMintPublicKeys.length;
      const reward0VaultAccountInfo = accountsInfo[offsetToRewardVaultAccountInfos + index * 2];
      const reward1VaultAccountInfo = accountsInfo[offsetToRewardVaultAccountInfos + index * 2 + 1];
      const offsetToRewardMintAccountInfos = offsetToRewardVaultAccountInfos + rewardVaultPublicKeys.length;
      const reward0MintAccountInfo = accountsInfo[offsetToRewardMintAccountInfos + index * 2];
      const reward1MintAccountInfo = accountsInfo[offsetToRewardMintAccountInfos + index * 2 + 1];
      if (!reserveXAccountInfo || !reserveYAccountInfo)
        throw new Error(
          `Reserve account for LB Pair ${lbPair.toBase58()} not found`
        );
      const reserveXBalance = AccountLayout.decode(reserveXAccountInfo.data);
      const reserveYBalance = AccountLayout.decode(reserveYAccountInfo.data);
      const mintX = unpackMint2(
        lbPairState.tokenXMint,
        tokenXMintAccountInfo,
        tokenXMintAccountInfo.owner
      );
      const mintY = unpackMint2(
        lbPairState.tokenYMint,
        tokenYMintAccountInfo,
        tokenYMintAccountInfo.owner
      );
      const tokenX = {
        publicKey: lbPairState.tokenXMint,
        reserve: lbPairState.reserveX,
        mint: mintX,
        amount: reserveXBalance.amount,
        owner: tokenXMintAccountInfo.owner,
        transferHookAccountMetas: mintHookAccountsMap.get(lbPairState.tokenXMint.toBase58()) ?? []
      };
      const tokenY = {
        publicKey: lbPairState.tokenYMint,
        reserve: lbPairState.reserveY,
        amount: reserveYBalance.amount,
        mint: mintY,
        owner: tokenYMintAccountInfo.owner,
        transferHookAccountMetas: mintHookAccountsMap.get(lbPairState.tokenYMint.toBase58()) ?? []
      };
      const reward0 = !lbPairState.rewardInfos[0].mint.equals(
        PublicKey9.default
      ) ? {
        publicKey: lbPairState.rewardInfos[0].mint,
        reserve: lbPairState.rewardInfos[0].vault,
        amount: AccountLayout.decode(reward0VaultAccountInfo.data).amount,
        mint: unpackMint2(
          lbPairState.rewardInfos[0].mint,
          reward0MintAccountInfo,
          reward0MintAccountInfo.owner
        ),
        owner: reward0MintAccountInfo.owner,
        transferHookAccountMetas: mintHookAccountsMap.get(
          lbPairState.rewardInfos[0].mint.toBase58()
        ) ?? []
      } : null;
      const reward1 = !lbPairState.rewardInfos[1].mint.equals(
        PublicKey9.default
      ) ? {
        publicKey: lbPairState.rewardInfos[1].mint,
        reserve: lbPairState.rewardInfos[1].vault,
        amount: AccountLayout.decode(reward1VaultAccountInfo.data).amount,
        mint: unpackMint2(
          lbPairState.rewardInfos[1].mint,
          reward1MintAccountInfo,
          reward1MintAccountInfo.owner
        ),
        owner: reward1MintAccountInfo.owner,
        transferHookAccountMetas: mintHookAccountsMap.get(
          lbPairState.rewardInfos[1].mint.toBase58()
        ) ?? []
      } : null;
      return new DLMM(
        lbPair,
        program,
        lbPairState,
        binArrayBitmapExtension,
        tokenX,
        tokenY,
        [reward0, reward1],
        clock,
        opt
      );
    });
    return lbClmmImpl;
  }
  /**
   * The `getAllPresetParameters` function retrieves all preset parameter accounts
   * for the given DLMM program.
   *
   * @param {Connection} connection - The connection to the Solana cluster.
   * @param {Opt} [opt] - The optional parameters for the function.
   *
   * @returns A promise that resolves to an object containing the preset parameter
   * accounts, with the following properties:
   * - `presetParameter`: The preset parameter accounts for the original `PresetParameter` struct.
   * - `presetParameter2`: The preset parameter accounts for the `PresetParameter2` struct.
   */
  static async getAllPresetParameters(connection, opt) {
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[opt?.cluster ?? "mainnet-beta"],
      provider
    );
    const [presetParameter, presetParameter2] = await Promise.all([
      program.account.presetParameter.all(),
      program.account.presetParameter2.all()
    ]);
    return {
      presetParameter,
      presetParameter2
    };
  }
  /**
   * The function `getAllLbPairPositionsByUser` retrieves all liquidity pool pair positions for a given
   * user.
   * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
   * class, which represents the connection to the Solana blockchain.
   * @param {PublicKey} userPubKey - The user's wallet public key.
   * @param {Opt} [opt] - An optional object that contains additional options for the function.
   * @returns The function `getAllLbPairPositionsByUser` returns a `Promise` that resolves to a `Map`
   * object. The `Map` object contains key-value pairs, where the key is a string representing the LB
   * Pair account, and the value is an object of PositionInfo
   */
  static async getAllLbPairPositionsByUser(connection, userPubKey, opt) {
    const cluster = opt?.cluster || "mainnet-beta";
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[cluster],
      provider
    );
    const positionsV2 = await program.account.positionV2.all([
      positionOwnerFilter(userPubKey)
    ]);
    const positionWrappers = [
      ...positionsV2.map((p) => new PositionV2Wrapper(p.publicKey, p.account))
    ];
    const binArrayPubkeySetV2 = /* @__PURE__ */ new Set();
    const lbPairSetV2 = /* @__PURE__ */ new Set();
    positionWrappers.forEach((p) => {
      const binArrayKeys = p.getBinArrayKeysCoverage(program.programId);
      binArrayKeys.forEach((binArrayKey) => {
        binArrayPubkeySetV2.add(binArrayKey.toBase58());
      });
      lbPairSetV2.add(p.lbPair().toBase58());
    });
    const binArrayPubkeyArrayV2 = Array.from(binArrayPubkeySetV2).map(
      (pubkey) => new PublicKey9(pubkey)
    );
    const lbPairKeys = Array.from(lbPairSetV2).map(
      (pubkey) => new PublicKey9(pubkey)
    );
    const [clockAccInfo, ...binArraysAccInfo] = await chunkedGetMultipleAccountInfos(connection, [
      SYSVAR_CLOCK_PUBKEY,
      ...binArrayPubkeyArrayV2,
      ...lbPairKeys
    ]);
    const positionBinArraysMapV2 = /* @__PURE__ */ new Map();
    for (let i = 0; i < binArrayPubkeyArrayV2.length; i++) {
      const binArrayPubkey = binArrayPubkeyArrayV2[i];
      const binArrayAccInfoBufferV2 = binArraysAccInfo[i];
      if (binArrayAccInfoBufferV2) {
        const binArrayAccInfo = program.coder.accounts.decode(
          program.account.binArray.idlAccount.name,
          binArrayAccInfoBufferV2.data
        );
        positionBinArraysMapV2.set(binArrayPubkey.toBase58(), binArrayAccInfo);
      }
    }
    const lbPairMap = /* @__PURE__ */ new Map();
    for (let i = binArrayPubkeyArrayV2.length; i < binArraysAccInfo.length; i++) {
      const lbPairPubkey = lbPairKeys[i - binArrayPubkeyArrayV2.length];
      const lbPairAccInfoBufferV2 = binArraysAccInfo[i];
      if (!lbPairAccInfoBufferV2)
        throw new Error(`LB Pair account ${lbPairPubkey.toBase58()} not found`);
      const lbPairAccInfo = program.coder.accounts.decode(
        program.account.lbPair.idlAccount.name,
        lbPairAccInfoBufferV2.data
      );
      lbPairMap.set(lbPairPubkey.toBase58(), lbPairAccInfo);
    }
    const accountKeys = Array.from(lbPairMap.values()).map(({ reserveX, reserveY, tokenXMint, tokenYMint, rewardInfos }) => [
      reserveX,
      reserveY,
      tokenXMint,
      tokenYMint,
      rewardInfos[0].mint,
      rewardInfos[1].mint
    ]).flat();
    const accountInfos = await chunkedGetMultipleAccountInfos(
      program.provider.connection,
      accountKeys
    );
    const lbPairReserveMap = /* @__PURE__ */ new Map();
    const lbPairMintMap = /* @__PURE__ */ new Map();
    lbPairKeys.forEach((lbPair, idx) => {
      const index = idx * 6;
      const reserveXAccount = accountInfos[index];
      const reserveYAccount = accountInfos[index + 1];
      if (!reserveXAccount || !reserveYAccount)
        throw new Error(
          `Reserve account for LB Pair ${lbPair.toBase58()} not found`
        );
      const reserveAccX = AccountLayout.decode(reserveXAccount.data);
      const reserveAccY = AccountLayout.decode(reserveYAccount.data);
      lbPairReserveMap.set(lbPair.toBase58(), {
        reserveX: reserveAccX.amount,
        reserveY: reserveAccY.amount
      });
      const mintXAccount = accountInfos[index + 2];
      const mintYAccount = accountInfos[index + 3];
      if (!mintXAccount || !mintYAccount)
        throw new Error(
          `Mint account for LB Pair ${lbPair.toBase58()} not found`
        );
      const mintX = unpackMint2(
        reserveAccX.mint,
        mintXAccount,
        mintXAccount.owner
      );
      const mintY = unpackMint2(
        reserveAccY.mint,
        mintYAccount,
        mintYAccount.owner
      );
      const rewardMint0Account = accountInfos[index + 4];
      const rewardMint1Account = accountInfos[index + 5];
      const lbPairState = lbPairMap.get(lbPair.toBase58());
      let rewardMint0 = null;
      let rewardMint1 = null;
      if (!lbPairState.rewardInfos[0].mint.equals(PublicKey9.default)) {
        rewardMint0 = unpackMint2(
          lbPairState.rewardInfos[0].mint,
          rewardMint0Account,
          rewardMint0Account.owner
        );
      }
      if (!lbPairState.rewardInfos[1].mint.equals(PublicKey9.default)) {
        rewardMint1 = unpackMint2(
          lbPairState.rewardInfos[1].mint,
          rewardMint1Account,
          rewardMint1Account.owner
        );
      }
      lbPairMintMap.set(lbPair.toBase58(), {
        mintX,
        mintY,
        rewardMint0,
        rewardMint1
      });
    });
    const clock = ClockLayout.decode(clockAccInfo.data);
    const positionsMap = /* @__PURE__ */ new Map();
    for (const position of positionWrappers) {
      const lbPair = position.lbPair();
      const positionPubkey = position.address();
      const version = position.version();
      const lbPairAcc = lbPairMap.get(lbPair.toBase58());
      const { mintX, mintY, rewardMint0, rewardMint1 } = lbPairMintMap.get(
        lbPair.toBase58()
      );
      const reserveXBalance = lbPairReserveMap.get(lbPair.toBase58())?.reserveX ?? BigInt(0);
      const reserveYBalance = lbPairReserveMap.get(lbPair.toBase58())?.reserveY ?? BigInt(0);
      const { tokenXProgram, tokenYProgram } = getTokenProgramId(lbPairAcc);
      const tokenX = {
        publicKey: lbPairAcc.tokenXMint,
        reserve: lbPairAcc.reserveX,
        amount: reserveXBalance,
        mint: mintX,
        owner: tokenXProgram,
        transferHookAccountMetas: []
        // No need, the TokenReserve created just for processing position info, doesn't require any transaction
      };
      const tokenY = {
        publicKey: lbPairAcc.tokenYMint,
        reserve: lbPairAcc.reserveY,
        amount: reserveYBalance,
        mint: mintY,
        owner: tokenYProgram,
        transferHookAccountMetas: []
        // No need, the TokenReserve created just for processing position info, doesn't require any transaction
      };
      const positionData = await DLMM.processPosition(
        program,
        lbPairAcc,
        clock,
        position,
        mintX,
        mintY,
        rewardMint0,
        rewardMint1,
        positionBinArraysMapV2
      );
      if (positionData) {
        positionsMap.set(lbPair.toBase58(), {
          publicKey: lbPair,
          lbPair: lbPairAcc,
          tokenX,
          tokenY,
          lbPairPositionsData: [
            ...positionsMap.get(lbPair.toBase58())?.lbPairPositionsData ?? [],
            {
              publicKey: positionPubkey,
              positionData,
              version
            }
          ]
        });
      }
    }
    return positionsMap;
  }
  static getPricePerLamport(tokenXDecimal, tokenYDecimal, price) {
    return new Decimal5(price).mul(new Decimal5(10 ** (tokenYDecimal - tokenXDecimal))).toString();
  }
  static getBinIdFromPrice(price, binStep, min) {
    const binStepNum = new Decimal5(binStep).div(new Decimal5(BASIS_POINT_MAX));
    const binId = new Decimal5(price).log().dividedBy(new Decimal5(1).add(binStepNum).log());
    return (min ? binId.floor() : binId.ceil()).toNumber();
  }
  /**
   * The function `getLbPairLockInfo` retrieves all pair positions that has locked liquidity.
   * @param {number} [lockDurationOpt] - An optional value indicating the minimum position lock duration that the function should return.
   * Depending on the lbPair activationType, the param should be a number of seconds or a number of slots.
   * @returns The function `getLbPairLockInfo` returns a `Promise` that resolves to a `PairLockInfo`
   * object. The `PairLockInfo` object contains an array of `PositionLockInfo` objects.
   */
  async getLbPairLockInfo(lockDurationOpt) {
    const lockDuration = lockDurationOpt | 0;
    const lbPairPositions = await this.program.account.positionV2.all([
      {
        memcmp: {
          bytes: bs582.encode(this.pubkey.toBuffer()),
          offset: 8
        }
      }
    ]);
    const clockAccInfo = await this.program.provider.connection.getAccountInfo(
      SYSVAR_CLOCK_PUBKEY
    );
    const clock = ClockLayout.decode(clockAccInfo.data);
    const currentPoint = this.lbPair.activationType == 0 /* Slot */ ? clock.slot : clock.unixTimestamp;
    const minLockReleasePoint = currentPoint.add(new BN13(lockDuration));
    const positionsWithLock = lbPairPositions.filter(
      (p) => p.account.lockReleasePoint.gt(minLockReleasePoint)
    );
    if (positionsWithLock.length == 0) {
      return {
        positions: []
      };
    }
    const positions = [
      ...positionsWithLock.map(
        (p) => new PositionV2Wrapper(p.publicKey, p.account)
      )
    ];
    const binArrayPubkeySetV2 = /* @__PURE__ */ new Set();
    positions.forEach((position) => {
      const binArrayKeys = position.getBinArrayKeysCoverage(
        this.program.programId
      );
      binArrayKeys.forEach((key) => {
        binArrayPubkeySetV2.add(key.toBase58());
      });
    });
    const binArrayPubkeyArrayV2 = Array.from(binArrayPubkeySetV2).map(
      (pubkey) => new PublicKey9(pubkey)
    );
    const binArraysAccInfo = await chunkedGetMultipleAccountInfos(
      this.program.provider.connection,
      binArrayPubkeyArrayV2
    );
    const positionBinArraysMapV2 = /* @__PURE__ */ new Map();
    for (let i = 0; i < binArraysAccInfo.length; i++) {
      const binArrayPubkey = binArrayPubkeyArrayV2[i];
      const binArrayAccBufferV2 = binArraysAccInfo[i];
      if (!binArrayAccBufferV2)
        throw new Error(
          `Bin Array account ${binArrayPubkey.toBase58()} not found`
        );
      const binArrayAccInfo = this.program.coder.accounts.decode(
        this.program.account.binArray.idlAccount.name,
        binArrayAccBufferV2.data
      );
      positionBinArraysMapV2.set(binArrayPubkey.toBase58(), binArrayAccInfo);
    }
    const positionsLockInfo = await Promise.all(
      positions.map(async (position) => {
        const positionData = await DLMM.processPosition(
          this.program,
          this.lbPair,
          clock,
          position,
          this.tokenX.mint,
          this.tokenY.mint,
          this.rewards[0].mint,
          this.rewards[1].mint,
          positionBinArraysMapV2
        );
        return {
          positionAddress: position.address(),
          owner: position.owner(),
          lockReleasePoint: position.lockReleasePoint().toNumber(),
          tokenXAmount: positionData.totalXAmount,
          tokenYAmount: positionData.totalYAmount
        };
      })
    );
    return {
      positions: positionsLockInfo
    };
  }
  /** Public methods */
  /**
   * Create a new customizable permissionless pair. Support both token and token 2022.
   * @param connection A connection to the Solana cluster.
   * @param binStep The bin step for the pair.
   * @param tokenX The mint of the first token.
   * @param tokenY The mint of the second token.
   * @param activeId The ID of the initial active bin. Represent the starting price.
   * @param feeBps The fee rate for swaps in the pair, in basis points.
   * @param activationType The type of activation for the pair.
   * @param hasAlphaVault Whether the pair has an alpha vault.
   * @param creatorKey The public key of the creator of the pair.
   * @param activationPoint The timestamp at which the pair will be activated.
   * @param opt An options object.
   * @returns A transaction that creates the pair.
   */
  static async createCustomizablePermissionlessLbPair2(connection, binStep, tokenX, tokenY, activeId, feeBps, activationType, hasAlphaVault, creatorKey, activationPoint, creatorPoolOnOffControl, opt) {
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[opt.cluster],
      provider
    );
    const [tokenBadgeX] = deriveTokenBadge(tokenX, program.programId);
    const [tokenBadgeY] = deriveTokenBadge(tokenY, program.programId);
    const [
      tokenXAccount,
      tokenYAccount,
      tokenBadgeXAccount,
      tokenBadgeYAccount
    ] = await provider.connection.getMultipleAccountsInfo([
      tokenX,
      tokenY,
      tokenBadgeX,
      tokenBadgeY
    ]);
    const [lbPair] = deriveCustomizablePermissionlessLbPair(
      tokenX,
      tokenY,
      program.programId
    );
    const [reserveX] = deriveReserve(tokenX, lbPair, program.programId);
    const [reserveY] = deriveReserve(tokenY, lbPair, program.programId);
    const [oracle] = deriveOracle(lbPair, program.programId);
    const activeBinArrayIndex = binIdToBinArrayIndex(activeId);
    const binArrayBitmapExtension = isOverflowDefaultBinArrayBitmap(
      activeBinArrayIndex
    ) ? deriveBinArrayBitmapExtension(lbPair, program.programId)[0] : null;
    const [baseFactor, baseFeePowerFactor] = computeBaseFactorFromFeeBps(
      binStep,
      feeBps
    );
    const ixData = {
      activeId: activeId.toNumber(),
      binStep: binStep.toNumber(),
      baseFactor: baseFactor.toNumber(),
      activationType,
      activationPoint: activationPoint ? activationPoint : null,
      hasAlphaVault,
      creatorPoolOnOffControl: creatorPoolOnOffControl ? creatorPoolOnOffControl : false,
      baseFeePowerFactor: baseFeePowerFactor.toNumber(),
      padding: Array(63).fill(0)
    };
    const userTokenX = getAssociatedTokenAddressSync2(
      tokenX,
      creatorKey,
      true,
      tokenXAccount.owner
    );
    const userTokenY = getAssociatedTokenAddressSync2(
      tokenY,
      creatorKey,
      true,
      tokenYAccount.owner
    );
    return program.methods.initializeCustomizablePermissionlessLbPair2(ixData).accounts({
      tokenBadgeX: tokenBadgeXAccount ? tokenBadgeX : program.programId,
      tokenBadgeY: tokenBadgeYAccount ? tokenBadgeY : program.programId,
      lbPair,
      reserveX,
      reserveY,
      binArrayBitmapExtension,
      tokenMintX: tokenX,
      tokenMintY: tokenY,
      oracle,
      systemProgram: SystemProgram2.programId,
      userTokenX,
      userTokenY,
      funder: creatorKey,
      tokenProgramX: tokenXAccount.owner,
      tokenProgramY: tokenYAccount.owner
    }).transaction();
  }
  /**
   * Create a new customizable permissionless pair. Support only token program.
   * @param connection A connection to the Solana cluster.
   * @param binStep The bin step for the pair.
   * @param tokenX The mint of the first token.
   * @param tokenY The mint of the second token.
   * @param activeId The ID of the initial active bin. Represent the starting price.
   * @param feeBps The fee rate for swaps in the pair, in basis points.
   * @param activationType The type of activation for the pair.
   * @param hasAlphaVault Whether the pair has an alpha vault.
   * @param creatorKey The public key of the creator of the pair.
   * @param activationPoint The timestamp at which the pair will be activated.
   * @param opt An options object.
   * @returns A transaction that creates the pair.
   */
  static async createCustomizablePermissionlessLbPair(connection, binStep, tokenX, tokenY, activeId, feeBps, activationType, hasAlphaVault, creatorKey, activationPoint, creatorPoolOnOffControl, opt) {
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[opt.cluster],
      provider
    );
    const [mintXAccount, mintYAccount] = await connection.getMultipleAccountsInfo([tokenX, tokenY]);
    const [lbPair] = deriveCustomizablePermissionlessLbPair(
      tokenX,
      tokenY,
      program.programId
    );
    const [reserveX] = deriveReserve(tokenX, lbPair, program.programId);
    const [reserveY] = deriveReserve(tokenY, lbPair, program.programId);
    const [oracle] = deriveOracle(lbPair, program.programId);
    const activeBinArrayIndex = binIdToBinArrayIndex(activeId);
    const binArrayBitmapExtension = isOverflowDefaultBinArrayBitmap(
      activeBinArrayIndex
    ) ? deriveBinArrayBitmapExtension(lbPair, program.programId)[0] : null;
    const [baseFactor, baseFeePowerFactor] = computeBaseFactorFromFeeBps(
      binStep,
      feeBps
    );
    if (!baseFeePowerFactor.isZero()) {
      throw "base factor for the give fee bps overflow u16";
    }
    const ixData = {
      activeId: activeId.toNumber(),
      binStep: binStep.toNumber(),
      baseFactor: baseFactor.toNumber(),
      activationType,
      activationPoint: activationPoint ? activationPoint : null,
      hasAlphaVault,
      baseFeePowerFactor: 0,
      creatorPoolOnOffControl: creatorPoolOnOffControl ? creatorPoolOnOffControl : false,
      padding: Array(63).fill(0)
    };
    const userTokenX = getAssociatedTokenAddressSync2(tokenX, creatorKey);
    const userTokenY = getAssociatedTokenAddressSync2(tokenY, creatorKey);
    return program.methods.initializeCustomizablePermissionlessLbPair(ixData).accounts({
      lbPair,
      reserveX,
      reserveY,
      binArrayBitmapExtension,
      tokenMintX: tokenX,
      tokenMintY: tokenY,
      oracle,
      systemProgram: SystemProgram2.programId,
      userTokenX,
      userTokenY,
      funder: creatorKey
    }).transaction();
  }
  /**
   * Create a new liquidity pair. Support only token program.
   * @param connection A connection to the Solana cluster.
   * @param funder The public key of the funder of the pair.
   * @param tokenX The mint of the first token.
   * @param tokenY The mint of the second token.
   * @param binStep The bin step for the pair.
   * @param baseFactor The base factor for the pair.
   * @param presetParameter The public key of the preset parameter account.
   * @param activeId The ID of the initial active bin. Represent the starting price.
   * @param opt An options object.
   * @returns A transaction that creates the pair.
   * @throws If the pair already exists.
   */
  static async createLbPair(connection, funder, tokenX, tokenY, binStep, baseFactor, presetParameter, activeId, opt) {
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[opt.cluster],
      provider
    );
    const existsPool = await this.getPairPubkeyIfExists(
      connection,
      tokenX,
      tokenY,
      binStep,
      baseFactor,
      new BN13(0)
    );
    if (existsPool) {
      throw new Error("Pool already exists");
    }
    const [lbPair] = deriveLbPair2(
      tokenX,
      tokenY,
      binStep,
      baseFactor,
      program.programId
    );
    const [reserveX] = deriveReserve(tokenX, lbPair, program.programId);
    const [reserveY] = deriveReserve(tokenY, lbPair, program.programId);
    const [oracle] = deriveOracle(lbPair, program.programId);
    const activeBinArrayIndex = binIdToBinArrayIndex(activeId);
    const binArrayBitmapExtension = isOverflowDefaultBinArrayBitmap(
      activeBinArrayIndex
    ) ? deriveBinArrayBitmapExtension(lbPair, program.programId)[0] : null;
    return program.methods.initializeLbPair(activeId.toNumber(), binStep.toNumber()).accounts({
      funder,
      lbPair,
      rent: SYSVAR_RENT_PUBKEY,
      reserveX,
      reserveY,
      binArrayBitmapExtension,
      tokenMintX: tokenX,
      tokenMintY: tokenY,
      tokenProgram: TOKEN_PROGRAM_ID4,
      oracle,
      presetParameter,
      systemProgram: SystemProgram2.programId
    }).transaction();
  }
  /**
   * Create a new liquidity pair. Support both token and token2022 program.
   * @param connection A connection to the Solana cluster.
   * @param funder The public key of the funder of the pair.
   * @param tokenX The mint of the first token.
   * @param tokenY The mint of the second token.
   * @param presetParameter The public key of the preset parameter account.
   * @param activeId The ID of the initial active bin. Represent the starting price.
   * @param opt An options object.
   * @returns A transaction that creates the pair.
   * @throws If the pair already exists.
   */
  static async createLbPair2(connection, funder, tokenX, tokenY, presetParameter, activeId, opt) {
    const provider = new AnchorProvider2(
      connection,
      {},
      AnchorProvider2.defaultOptions()
    );
    const program = new Program3(
      IDL,
      opt?.programId ?? LBCLMM_PROGRAM_IDS[opt.cluster],
      provider
    );
    const [tokenBadgeX] = deriveTokenBadge(tokenX, program.programId);
    const [tokenBadgeY] = deriveTokenBadge(tokenY, program.programId);
    const [
      tokenXAccount,
      tokenYAccount,
      tokenBadgeXAccount,
      tokenBadgeYAccount
    ] = await provider.connection.getMultipleAccountsInfo([
      tokenX,
      tokenY,
      tokenBadgeX,
      tokenBadgeY
    ]);
    const presetParameterState = await program.account.presetParameter2.fetch(presetParameter);
    const existsPool = await this.getPairPubkeyIfExists(
      connection,
      tokenX,
      tokenY,
      new BN13(presetParameterState.binStep),
      new BN13(presetParameterState.baseFactor),
      new BN13(presetParameterState.baseFactor)
    );
    if (existsPool) {
      throw new Error("Pool already exists");
    }
    const [lbPair] = deriveLbPairWithPresetParamWithIndexKey(
      presetParameter,
      tokenX,
      tokenY,
      program.programId
    );
    const [reserveX] = deriveReserve(tokenX, lbPair, program.programId);
    const [reserveY] = deriveReserve(tokenY, lbPair, program.programId);
    const [oracle] = deriveOracle(lbPair, program.programId);
    const activeBinArrayIndex = binIdToBinArrayIndex(activeId);
    const binArrayBitmapExtension = isOverflowDefaultBinArrayBitmap(
      activeBinArrayIndex
    ) ? deriveBinArrayBitmapExtension(lbPair, program.programId)[0] : null;
    return program.methods.initializeLbPair2({
      activeId: activeId.toNumber(),
      padding: Array(96).fill(0)
    }).accounts({
      funder,
      lbPair,
      reserveX,
      reserveY,
      binArrayBitmapExtension,
      tokenMintX: tokenX,
      tokenMintY: tokenY,
      tokenBadgeX: tokenBadgeXAccount ? tokenBadgeX : program.programId,
      tokenBadgeY: tokenBadgeYAccount ? tokenBadgeY : program.programId,
      tokenProgramX: tokenXAccount.owner,
      tokenProgramY: tokenYAccount.owner,
      oracle,
      presetParameter,
      systemProgram: SystemProgram2.programId
    }).transaction();
  }
  /**
   * The function `refetchStates` retrieves and updates various states and data related to bin arrays
   * and lb pairs.
   */
  async refetchStates() {
    const binArrayBitmapExtensionPubkey = deriveBinArrayBitmapExtension(
      this.pubkey,
      this.program.programId
    )[0];
    const [
      lbPairAccountInfo,
      binArrayBitmapExtensionAccountInfo,
      reserveXAccountInfo,
      reserveYAccountInfo,
      mintXAccountInfo,
      mintYAccountInfo,
      reward0VaultAccountInfo,
      reward1VaultAccountInfo,
      rewardMint0AccountInfo,
      rewardMint1AccountInfo,
      clockAccountInfo
    ] = await chunkedGetMultipleAccountInfos(this.program.provider.connection, [
      this.pubkey,
      binArrayBitmapExtensionPubkey,
      this.lbPair.reserveX,
      this.lbPair.reserveY,
      this.lbPair.tokenXMint,
      this.lbPair.tokenYMint,
      this.lbPair.rewardInfos[0].vault,
      this.lbPair.rewardInfos[1].vault,
      this.lbPair.rewardInfos[0].mint,
      this.lbPair.rewardInfos[1].mint,
      SYSVAR_CLOCK_PUBKEY
    ]);
    const lbPairState = this.program.coder.accounts.decode(
      this.program.account.lbPair.idlAccount.name,
      lbPairAccountInfo.data
    );
    if (binArrayBitmapExtensionAccountInfo) {
      const binArrayBitmapExtensionState = this.program.coder.accounts.decode(
        this.program.account.binArrayBitmapExtension.idlAccount.name,
        binArrayBitmapExtensionAccountInfo.data
      );
      if (binArrayBitmapExtensionState) {
        this.binArrayBitmapExtension = {
          account: binArrayBitmapExtensionState,
          publicKey: binArrayBitmapExtensionPubkey
        };
      }
    }
    const reserveXBalance = AccountLayout.decode(reserveXAccountInfo.data);
    const reserveYBalance = AccountLayout.decode(reserveYAccountInfo.data);
    const [
      tokenXTransferHook,
      tokenYTransferHook,
      reward0TransferHook,
      reward1TransferHook
    ] = await Promise.all([
      getExtraAccountMetasForTransferHook(
        this.program.provider.connection,
        lbPairState.tokenXMint,
        mintXAccountInfo
      ),
      getExtraAccountMetasForTransferHook(
        this.program.provider.connection,
        lbPairState.tokenYMint,
        mintYAccountInfo
      ),
      rewardMint0AccountInfo ? getExtraAccountMetasForTransferHook(
        this.program.provider.connection,
        lbPairState.rewardInfos[0].mint,
        rewardMint0AccountInfo
      ) : [],
      rewardMint1AccountInfo ? getExtraAccountMetasForTransferHook(
        this.program.provider.connection,
        lbPairState.rewardInfos[1].mint,
        rewardMint1AccountInfo
      ) : []
    ]);
    const mintX = unpackMint2(
      this.tokenX.publicKey,
      mintXAccountInfo,
      mintXAccountInfo.owner
    );
    const mintY = unpackMint2(
      this.tokenY.publicKey,
      mintYAccountInfo,
      mintYAccountInfo.owner
    );
    this.tokenX = {
      amount: reserveXBalance.amount,
      mint: mintX,
      publicKey: lbPairState.tokenXMint,
      reserve: lbPairState.reserveX,
      owner: mintXAccountInfo.owner,
      transferHookAccountMetas: tokenXTransferHook
    };
    this.tokenY = {
      amount: reserveYBalance.amount,
      mint: mintY,
      publicKey: lbPairState.tokenYMint,
      reserve: lbPairState.reserveY,
      owner: mintYAccountInfo.owner,
      transferHookAccountMetas: tokenYTransferHook
    };
    this.rewards[0] = null;
    this.rewards[1] = null;
    if (!lbPairState.rewardInfos[0].mint.equals(PublicKey9.default)) {
      this.rewards[0] = {
        publicKey: lbPairState.rewardInfos[0].mint,
        reserve: lbPairState.rewardInfos[0].vault,
        mint: unpackMint2(
          lbPairState.rewardInfos[0].mint,
          rewardMint0AccountInfo,
          rewardMint0AccountInfo.owner
        ),
        amount: AccountLayout.decode(reward0VaultAccountInfo.data).amount,
        owner: rewardMint0AccountInfo.owner,
        transferHookAccountMetas: reward0TransferHook
      };
    }
    if (!lbPairState.rewardInfos[1].mint.equals(PublicKey9.default)) {
      this.rewards[1] = {
        publicKey: lbPairState.rewardInfos[1].mint,
        reserve: lbPairState.rewardInfos[1].vault,
        mint: unpackMint2(
          lbPairState.rewardInfos[1].mint,
          rewardMint1AccountInfo,
          rewardMint1AccountInfo.owner
        ),
        amount: AccountLayout.decode(reward1VaultAccountInfo.data).amount,
        owner: rewardMint1AccountInfo.owner,
        transferHookAccountMetas: reward1TransferHook
      };
    }
    const clock = ClockLayout.decode(clockAccountInfo.data);
    this.clock = clock;
    this.lbPair = lbPairState;
  }
  /**
   * Set the status of a permissionless LB pair to either enabled or disabled. This require pool field `creator_pool_on_off_control` to be true and type `CustomizablePermissionless`.
   * Pool creator can enable/disable the pair anytime before the pool is opened / activated. Once the pool activation time is passed, the pool creator can only enable the pair.
   * Useful for token launches which do not have fixed activation time.
   * @param enable If true, the pair will be enabled. If false, the pair will be disabled.
   * @param creator The public key of the pool creator.
   * @returns a Promise that resolves to the transaction.
   */
  async setPairStatusPermissionless(enable, creator) {
    const status = enable ? 0 : 1;
    const tx = await this.program.methods.setPairStatusPermissionless(status).accounts({
      lbPair: this.pubkey,
      creator
    }).transaction();
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      feePayer: this.lbPair.creator,
      blockhash,
      lastValidBlockHeight
    }).add(tx);
  }
  /**
   * The function `getBinArrays` returns an array of `BinArrayAccount` objects
   * @returns a Promise that resolves to an array of BinArrayAccount objects.
   */
  async getBinArrays() {
    return this.program.account.binArray.all([
      binArrayLbPairFilter(this.pubkey)
    ]);
  }
  /**
   * The function `getBinArrayAroundActiveBin` retrieves a specified number of `BinArrayAccount`
   * objects from the blockchain, based on the active bin and its surrounding bin arrays.
   * @param
   *    swapForY - The `swapForY` parameter is a boolean value that indicates whether the swap is using quote token as input.
   *    [count=4] - The `count` parameter is the number of bin arrays to retrieve on left and right respectively. By default, it is set to 4.
   * @returns an array of `BinArrayAccount` objects.
   */
  async getBinArrayForSwap(swapForY, count = 4) {
    await this.refetchStates();
    const binArraysPubkey = /* @__PURE__ */ new Set();
    let shouldStop = false;
    let activeIdToLoop = this.lbPair.activeId;
    while (!shouldStop) {
      const binArrayIndex = findNextBinArrayIndexWithLiquidity(
        swapForY,
        new BN13(activeIdToLoop),
        this.lbPair,
        this.binArrayBitmapExtension?.account ?? null
      );
      if (binArrayIndex === null)
        shouldStop = true;
      else {
        const [binArrayPubKey] = deriveBinArray(
          this.pubkey,
          binArrayIndex,
          this.program.programId
        );
        binArraysPubkey.add(binArrayPubKey.toBase58());
        const [lowerBinId, upperBinId] = getBinArrayLowerUpperBinId(binArrayIndex);
        activeIdToLoop = swapForY ? lowerBinId.toNumber() - 1 : upperBinId.toNumber() + 1;
      }
      if (binArraysPubkey.size === count)
        shouldStop = true;
    }
    const accountsToFetch = Array.from(binArraysPubkey).map(
      (pubkey) => new PublicKey9(pubkey)
    );
    const binArraysAccInfoBuffer = await chunkedGetMultipleAccountInfos(
      this.program.provider.connection,
      accountsToFetch
    );
    const binArrays = await Promise.all(
      binArraysAccInfoBuffer.map(async (accInfo, idx) => {
        const account = this.program.coder.accounts.decode(
          this.program.account.binArray.idlAccount.name,
          accInfo.data
        );
        const publicKey = accountsToFetch[idx];
        return {
          account,
          publicKey
        };
      })
    );
    return binArrays;
  }
  /**
   * The function `calculateFeeInfo` calculates the base fee rate percentage and maximum fee rate percentage
   * given the base factor, bin step, and optional base fee power factor.
   * @param baseFactor - The base factor of the pair.
   * @param binStep - The bin step of the pair.
   * @param baseFeePowerFactor - Optional parameter to allow small bin step to have bigger fee rate. Default to 0.
   * @returns an object of type `Omit<FeeInfo, "protocolFeePercentage">` with the following properties: baseFeeRatePercentage and maxFeeRatePercentage.
   */
  static calculateFeeInfo(baseFactor, binStep, baseFeePowerFactor) {
    const baseFeeRate = new BN13(baseFactor).mul(new BN13(binStep)).mul(new BN13(10)).mul(new BN13(10).pow(new BN13(baseFeePowerFactor ?? 0)));
    const baseFeeRatePercentage = new Decimal5(baseFeeRate.toString()).mul(new Decimal5(100)).div(new Decimal5(FEE_PRECISION.toString()));
    const maxFeeRatePercentage = new Decimal5(MAX_FEE_RATE.toString()).mul(new Decimal5(100)).div(new Decimal5(FEE_PRECISION.toString()));
    return {
      baseFeeRatePercentage,
      maxFeeRatePercentage
    };
  }
  /**
   * The function `getFeeInfo` calculates and returns the base fee rate percentage, maximum fee rate
   * percentage, and protocol fee percentage.
   * @returns an object of type `FeeInfo` with the following properties: baseFeeRatePercentage, maxFeeRatePercentage, and protocolFeePercentage.
   */
  getFeeInfo() {
    const { baseFactor, protocolShare } = this.lbPair.parameters;
    const { baseFeeRatePercentage, maxFeeRatePercentage } = DLMM.calculateFeeInfo(
      baseFactor,
      this.lbPair.binStep,
      this.lbPair.parameters.baseFeePowerFactor
    );
    const protocolFeePercentage = new Decimal5(protocolShare.toString()).mul(new Decimal5(100)).div(new Decimal5(BASIS_POINT_MAX));
    return {
      baseFeeRatePercentage,
      maxFeeRatePercentage,
      protocolFeePercentage
    };
  }
  /**
   * The function calculates and returns a dynamic fee
   * @returns a Decimal value representing the dynamic fee.
   */
  getDynamicFee() {
    let vParameterClone = Object.assign({}, this.lbPair.vParameters);
    let activeId = new BN13(this.lbPair.activeId);
    const sParameters2 = this.lbPair.parameters;
    const currentTimestamp = Date.now() / 1e3;
    this.updateReference(
      activeId.toNumber(),
      vParameterClone,
      sParameters2,
      currentTimestamp
    );
    this.updateVolatilityAccumulator(
      vParameterClone,
      sParameters2,
      activeId.toNumber()
    );
    const totalFee = getTotalFee(
      this.lbPair.binStep,
      sParameters2,
      vParameterClone
    );
    return new Decimal5(totalFee.toString()).div(new Decimal5(FEE_PRECISION.toString())).mul(100);
  }
  /**
   * The function `getEmissionRate` returns the emission rates for two rewards.
   * @returns an object of type `EmissionRate`. The object has two properties: `rewardOne` and
   * `rewardTwo`, both of which are of type `Decimal`.
   */
  getEmissionRate() {
    const now = Date.now() / 1e3;
    const [rewardOneEmissionRate, rewardTwoEmissionRate] = this.lbPair.rewardInfos.map(
      ({ rewardRate, rewardDurationEnd }) => now > rewardDurationEnd.toNumber() ? void 0 : rewardRate
    );
    return {
      rewardOne: rewardOneEmissionRate ? new Decimal5(rewardOneEmissionRate.toString()).div(PRECISION) : void 0,
      rewardTwo: rewardTwoEmissionRate ? new Decimal5(rewardTwoEmissionRate.toString()).div(PRECISION) : void 0
    };
  }
  /**
   * The function `getBinsAroundActiveBin` retrieves a specified number of bins to the left and right
   * of the active bin and returns them along with the active bin ID.
   * @param {number} numberOfBinsToTheLeft - The parameter `numberOfBinsToTheLeft` represents the
   * number of bins to the left of the active bin that you want to retrieve. It determines how many
   * bins you want to include in the result that are positioned to the left of the active bin.
   * @param {number} numberOfBinsToTheRight - The parameter `numberOfBinsToTheRight` represents the
   * number of bins to the right of the active bin that you want to retrieve.
   * @returns an object with two properties: "activeBin" and "bins". The value of "activeBin" is the
   * value of "this.lbPair.activeId", and the value of "bins" is the result of calling the "getBins"
   * function with the specified parameters.
   */
  async getBinsAroundActiveBin(numberOfBinsToTheLeft, numberOfBinsToTheRight) {
    const lowerBinId = this.lbPair.activeId - numberOfBinsToTheLeft - 1;
    const upperBinId = this.lbPair.activeId + numberOfBinsToTheRight + 1;
    const bins = await this.getBins(
      this.pubkey,
      lowerBinId,
      upperBinId,
      this.tokenX.mint.decimals,
      this.tokenY.mint.decimals
    );
    return { activeBin: this.lbPair.activeId, bins };
  }
  /**
   * The function `getBinsBetweenMinAndMaxPrice` retrieves a list of bins within a specified price
   * range.
   * @param {number} minPrice - The minimum price value for filtering the bins.
   * @param {number} maxPrice - The `maxPrice` parameter is the maximum price value that you want to
   * use for filtering the bins.
   * @returns an object with two properties: "activeBin" and "bins". The value of "activeBin" is the
   * active bin ID of the lbPair, and the value of "bins" is an array of BinLiquidity objects.
   */
  async getBinsBetweenMinAndMaxPrice(minPrice, maxPrice) {
    const lowerBinId = this.getBinIdFromPrice(minPrice, true) - 1;
    const upperBinId = this.getBinIdFromPrice(maxPrice, false) + 1;
    const bins = await this.getBins(
      this.pubkey,
      lowerBinId,
      upperBinId,
      this.tokenX.mint.decimals,
      this.tokenX.mint.decimals
    );
    return { activeBin: this.lbPair.activeId, bins };
  }
  /**
   * The function `getBinsBetweenLowerAndUpperBound` retrieves a list of bins between a lower and upper
   * bin ID and returns the active bin ID and the list of bins.
   * @param {number} lowerBinId - The lowerBinId parameter is a number that represents the ID of the
   * lowest bin.
   * @param {number} upperBinId - The upperBinID parameter is a number that represents the ID of the
   * highest bin.
   * @param {BinArray} [lowerBinArrays] - The `lowerBinArrays` parameter is an optional parameter of
   * type `BinArray`. It represents an array of bins that are below the lower bin ID.
   * @param {BinArray} [upperBinArrays] - The parameter `upperBinArrays` is an optional parameter of
   * type `BinArray`. It represents an array of bins that are above the upper bin ID.
   * @returns an object with two properties: "activeBin" and "bins". The value of "activeBin" is the
   * active bin ID of the lbPair, and the value of "bins" is an array of BinLiquidity objects.
   */
  async getBinsBetweenLowerAndUpperBound(lowerBinId, upperBinId, lowerBinArray, upperBinArray) {
    const bins = await this.getBins(
      this.pubkey,
      lowerBinId,
      upperBinId,
      this.tokenX.mint.decimals,
      this.tokenY.mint.decimals,
      lowerBinArray,
      upperBinArray
    );
    return { activeBin: this.lbPair.activeId, bins };
  }
  /**
   * The function converts a real price of bin to a lamport value
   * @param {number} price - The `price` parameter is a number representing the price of a token.
   * @returns {string} price per Lamport of bin
   */
  toPricePerLamport(price) {
    return DLMM.getPricePerLamport(
      this.tokenX.mint.decimals,
      this.tokenY.mint.decimals,
      price
    );
  }
  /**
   * The function converts a price per lamport value to a real price of bin
   * @param {number} pricePerLamport - The parameter `pricePerLamport` is a number representing the
   * price per lamport.
   * @returns {string} real price of bin
   */
  fromPricePerLamport(pricePerLamport) {
    return new Decimal5(pricePerLamport).div(
      new Decimal5(
        10 ** (this.tokenY.mint.decimals - this.tokenX.mint.decimals)
      )
    ).toString();
  }
  /**
   * The function retrieves the active bin ID and its corresponding price.
   * @returns an object with two properties: "binId" which is a number, and "price" which is a string.
   */
  async getActiveBin() {
    const { activeId } = await this.program.account.lbPair.fetch(this.pubkey);
    const [activeBinState] = await this.getBins(
      this.pubkey,
      activeId,
      activeId,
      this.tokenX.mint.decimals,
      this.tokenY.mint.decimals
    );
    return activeBinState;
  }
  /**
   * The function get bin ID based on a given price and a boolean flag indicating whether to
   * round down or up.
   * @param {number} price - The price parameter is a number that represents the price value.
   * @param {boolean} min - The "min" parameter is a boolean value that determines whether to round
   * down or round up the calculated binId. If "min" is true, the binId will be rounded down (floor),
   * otherwise it will be rounded up (ceil).
   * @returns {number} which is the binId calculated based on the given price and whether the minimum
   * value should be used.
   */
  getBinIdFromPrice(price, min) {
    return DLMM.getBinIdFromPrice(price, this.lbPair.binStep, min);
  }
  /**
   * The function `getPositionsByUserAndLbPair` retrieves positions by user and LB pair, including
   * active bin and user positions.
   * @param {PublicKey} [userPubKey] - The `userPubKey` parameter is an optional parameter of type
   * `PublicKey`. It represents the public key of a user. If no `userPubKey` is provided, the function
   * will return an object with an empty `userPositions` array and the active bin information obtained
   * from the `getActive
   * @returns The function `getPositionsByUserAndLbPair` returns a Promise that resolves to an object
   * with two properties:
   *    - "activeBin" which is an object with two properties: "binId" and "price". The value of "binId"
   *     is the active bin ID of the lbPair, and the value of "price" is the price of the active bin.
   *   - "userPositions" which is an array of Position objects.
   */
  async getPositionsByUserAndLbPair(userPubKey) {
    const promiseResults = await Promise.all([
      this.getActiveBin(),
      userPubKey && this.program.account.positionV2.all([
        positionOwnerFilter(userPubKey),
        positionLbPairFilter(this.pubkey)
      ])
    ]);
    const [activeBin, positionsV2] = promiseResults;
    if (!activeBin) {
      throw new Error("Error fetching active bin");
    }
    if (!userPubKey) {
      return {
        activeBin,
        userPositions: []
      };
    }
    const positions = [
      ...positionsV2.map((p) => new PositionV2Wrapper(p.publicKey, p.account))
    ];
    if (!positions) {
      throw new Error("Error fetching positions");
    }
    const binArrayPubkeySetV2 = /* @__PURE__ */ new Set();
    positions.forEach((position) => {
      const binArrayKeys = position.getBinArrayKeysCoverage(
        this.program.programId
      );
      binArrayKeys.forEach((key) => {
        binArrayPubkeySetV2.add(key.toBase58());
      });
    });
    const binArrayPubkeyArrayV2 = Array.from(binArrayPubkeySetV2).map(
      (pubkey) => new PublicKey9(pubkey)
    );
    const lbPairAndBinArrays = await chunkedGetMultipleAccountInfos(
      this.program.provider.connection,
      [this.pubkey, SYSVAR_CLOCK_PUBKEY, ...binArrayPubkeyArrayV2]
    );
    const [lbPairAccInfo, clockAccInfo, ...binArraysAccInfo] = lbPairAndBinArrays;
    const positionBinArraysMapV2 = /* @__PURE__ */ new Map();
    for (let i = 0; i < binArraysAccInfo.length; i++) {
      const binArrayPubkey = binArrayPubkeyArrayV2[i];
      const binArrayAccBufferV2 = binArraysAccInfo[i];
      if (binArrayAccBufferV2) {
        const binArrayAccInfo = this.program.coder.accounts.decode(
          this.program.account.binArray.idlAccount.name,
          binArrayAccBufferV2.data
        );
        positionBinArraysMapV2.set(binArrayPubkey.toBase58(), binArrayAccInfo);
      }
    }
    if (!lbPairAccInfo)
      throw new Error(`LB Pair account ${this.pubkey.toBase58()} not found`);
    const clock = ClockLayout.decode(clockAccInfo.data);
    const userPositions = await Promise.all(
      positions.map(async (position) => {
        return {
          publicKey: position.address(),
          positionData: await DLMM.processPosition(
            this.program,
            this.lbPair,
            clock,
            position,
            this.tokenX.mint,
            this.tokenY.mint,
            this.rewards[0]?.mint,
            this.rewards[1]?.mint,
            positionBinArraysMapV2
          ),
          version: position.version()
        };
      })
    );
    return {
      activeBin,
      userPositions
    };
  }
  async quoteCreatePosition({ strategy }) {
    const { minBinId, maxBinId } = strategy;
    const lowerBinArrayIndex = binIdToBinArrayIndex(new BN13(minBinId));
    const upperBinArrayIndex = BN13.max(
      binIdToBinArrayIndex(new BN13(maxBinId)),
      lowerBinArrayIndex.add(new BN13(1))
    );
    const binArraysCount = (await this.binArraysToBeCreate(lowerBinArrayIndex, upperBinArrayIndex)).length;
    const positionCount = Math.ceil((maxBinId - minBinId + 1) / MAX_BIN_PER_TX);
    const binArrayCost = binArraysCount * BIN_ARRAY_FEE;
    const positionCost = positionCount * POSITION_FEE;
    return {
      binArraysCount,
      binArrayCost,
      positionCount,
      positionCost
    };
  }
  /**
   * Creates an empty position and initializes the corresponding bin arrays if needed.
   * @param param0 The settings of the requested new position.
   * @returns A promise that resolves into a transaction for creating the requested position.
   */
  async createEmptyPosition({
    positionPubKey,
    minBinId,
    maxBinId,
    user
  }) {
    const createPositionIx = await this.program.methods.initializePosition(minBinId, maxBinId - minBinId + 1).accounts({
      payer: user,
      position: positionPubKey,
      lbPair: this.pubkey,
      owner: user
    }).instruction();
    const lowerBinArrayIndex = binIdToBinArrayIndex(new BN13(minBinId));
    const upperBinArrayIndex = BN13.max(
      lowerBinArrayIndex.add(new BN13(1)),
      binIdToBinArrayIndex(new BN13(maxBinId))
    );
    const binArrayIndexes = Array.from(
      { length: upperBinArrayIndex.sub(lowerBinArrayIndex).toNumber() + 1 },
      (_, index) => index + lowerBinArrayIndex.toNumber()
    ).map((idx) => new BN13(idx));
    const createBinArrayIxs = await this.createBinArraysIfNeeded(
      binArrayIndexes,
      user
    );
    const instructions = [createPositionIx, ...createBinArrayIxs];
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      instructions,
      user
    );
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: user
    }).add(setCUIx, ...instructions);
  }
  /**
   * The function `getPosition` retrieves position information for a given public key and processes it
   * using various data to return a `LbPosition` object.
   * @param {PublicKey} positionPubKey - The `getPosition` function you provided is an asynchronous
   * function that fetches position information based on a given public key. Here's a breakdown of the
   * parameters used in the function:
   * @returns The `getPosition` function returns a Promise that resolves to an object of type
   * `LbPosition`. The object contains the following properties:
   * - `publicKey`: The public key of the position account
   * - `positionData`: Position Object
   * - `version`: The version of the position (in this case, `Position.V2`)
   */
  async getPosition(positionPubKey) {
    const positionAccountInfo = await this.program.provider.connection.getAccountInfo(positionPubKey);
    if (!positionAccountInfo) {
      throw new Error(
        `Position account ${positionPubKey.toBase58()} not found`
      );
    }
    let position = wrapPosition(
      this.program,
      positionPubKey,
      positionAccountInfo
    );
    const binArrayKeys = position.getBinArrayKeysCoverage(
      this.program.programId
    );
    const [clockAccInfo, ...binArrayAccountsInfo] = await chunkedGetMultipleAccountInfos(this.program.provider.connection, [
      SYSVAR_CLOCK_PUBKEY,
      ...binArrayKeys
    ]);
    const clock = ClockLayout.decode(clockAccInfo.data);
    const binArrayMap = /* @__PURE__ */ new Map();
    for (let i = 0; i < binArrayAccountsInfo.length; i++) {
      if (binArrayAccountsInfo[i]) {
        const binArrayState = this.program.coder.accounts.decode(
          this.program.account.binArray.idlAccount.name,
          binArrayAccountsInfo[i].data
        );
        binArrayMap.set(binArrayKeys[i].toBase58(), binArrayState);
      }
    }
    return {
      publicKey: positionPubKey,
      positionData: await DLMM.processPosition(
        this.program,
        this.lbPair,
        clock,
        position,
        this.tokenX.mint,
        this.tokenY.mint,
        this.rewards[0]?.mint,
        this.rewards[1]?.mint,
        binArrayMap
      ),
      version: position.version()
    };
  }
  /**
   * The function `initializePositionAndAddLiquidityByStrategy` function is used to initializes a position and adds liquidity
   * @param {TInitializePositionAndAddLiquidityParamsByStrategy}
   *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
   *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
   *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
   *    - `strategy`: The strategy parameters to be used for the liquidity pool (Can use `calculateStrategyParameter` to calculate).
   *    - `user`: The public key of the user account.
   *    - `slippage`: The slippage percentage to be used for the liquidity pool.
   * @returns {Promise<Transaction>} The function `initializePositionAndAddLiquidityByStrategy` returns a `Promise` that
   * resolves to either a single `Transaction` object.
   */
  async initializePositionAndAddLiquidityByStrategy({
    positionPubKey,
    totalXAmount,
    totalYAmount,
    strategy,
    user,
    slippage
  }) {
    const { maxBinId, minBinId } = strategy;
    const maxActiveBinSlippage = slippage ? Math.ceil(slippage / (this.lbPair.binStep / 100)) : MAX_ACTIVE_BIN_SLIPPAGE;
    const preInstructions = [];
    const initializePositionIx = await this.program.methods.initializePosition(minBinId, maxBinId - minBinId + 1).accounts({
      payer: user,
      position: positionPubKey,
      lbPair: this.pubkey,
      owner: user
    }).instruction();
    preInstructions.push(initializePositionIx);
    const binArrayIndexes = getBinArrayIndexesCoverage(
      new BN13(minBinId),
      new BN13(maxBinId)
    );
    const binArrayAccountMetas = getBinArrayAccountMetasCoverage(
      new BN13(minBinId),
      new BN13(maxBinId),
      this.pubkey,
      this.program.programId
    );
    const createBinArrayIxs = await this.createBinArraysIfNeeded(
      binArrayIndexes,
      user
    );
    preInstructions.push(...createBinArrayIxs);
    const [
      { ataPubKey: userTokenX, ix: createPayerTokenXIx },
      { ataPubKey: userTokenY, ix: createPayerTokenYIx }
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenX.publicKey,
        user,
        this.tokenX.owner
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenY.publicKey,
        user,
        this.tokenY.owner
      )
    ]);
    createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
    createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
    if (this.tokenX.publicKey.equals(NATIVE_MINT2) && !totalXAmount.isZero()) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenX,
        BigInt(totalXAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
    }
    if (this.tokenY.publicKey.equals(NATIVE_MINT2) && !totalYAmount.isZero()) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenY,
        BigInt(totalYAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
    }
    const postInstructions = [];
    if ([
      this.tokenX.publicKey.toBase58(),
      this.tokenY.publicKey.toBase58()
    ].includes(NATIVE_MINT2.toBase58())) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    const minBinArrayIndex = binIdToBinArrayIndex(new BN13(minBinId));
    const maxBinArrayIndex = binIdToBinArrayIndex(new BN13(maxBinId));
    const useExtension = isOverflowDefaultBinArrayBitmap(minBinArrayIndex) || isOverflowDefaultBinArrayBitmap(maxBinArrayIndex);
    const binArrayBitmapExtension = useExtension ? deriveBinArrayBitmapExtension(this.pubkey, this.program.programId)[0] : null;
    const activeId = this.lbPair.activeId;
    const strategyParameters = toStrategyParameters(strategy);
    const liquidityParams = {
      amountX: totalXAmount,
      amountY: totalYAmount,
      activeId,
      maxActiveBinSlippage,
      strategyParameters
    };
    const addLiquidityAccounts = {
      position: positionPubKey,
      lbPair: this.pubkey,
      userTokenX,
      userTokenY,
      reserveX: this.lbPair.reserveX,
      reserveY: this.lbPair.reserveY,
      tokenXMint: this.lbPair.tokenXMint,
      tokenYMint: this.lbPair.tokenYMint,
      binArrayBitmapExtension,
      sender: user,
      tokenXProgram: this.tokenX.owner,
      tokenYProgram: this.tokenY.owner,
      memoProgram: MEMO_PROGRAM_ID
    };
    const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(0 /* Liquidity */);
    const programMethod = this.program.methods.addLiquidityByStrategy2(
      liquidityParams,
      {
        slices
      }
    );
    const addLiquidityIx = await programMethod.accounts(addLiquidityAccounts).remainingAccounts(transferHookAccounts).remainingAccounts(binArrayAccountMetas).instruction();
    const instructions = [
      ...preInstructions,
      addLiquidityIx,
      ...postInstructions
    ];
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      instructions,
      user
    );
    instructions.unshift(setCUIx);
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: user
    }).add(...instructions);
  }
  /**
   * @deprecated Use `initializePositionAndAddLiquidityByStrategy` instead which support both token and token2022.
   * The function `initializePositionAndAddLiquidityByWeight` function is used to initializes a position and adds liquidity
   * @param {TInitializePositionAndAddLiquidityParams}
   *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
   *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
   *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
   *    - `xYAmountDistribution`: An array of objects of type `XYAmountDistribution` that represents (can use `calculateSpotDistribution`, `calculateBidAskDistribution` & `calculateNormalDistribution`)
   *    - `user`: The public key of the user account.
   *    - `slippage`: The slippage percentage to be used for the liquidity pool.
   * @returns {Promise<Transaction|Transaction[]>} The function `initializePositionAndAddLiquidityByWeight` returns a `Promise` that
   * resolves to either a single `Transaction` object (if less than 26bin involved) or an array of `Transaction` objects.
   */
  async initializePositionAndAddLiquidityByWeight({
    positionPubKey,
    totalXAmount,
    totalYAmount,
    xYAmountDistribution,
    user,
    slippage
  }) {
    const { lowerBinId, upperBinId, binIds } = this.processXYAmountDistribution(xYAmountDistribution);
    const maxActiveBinSlippage = slippage ? Math.ceil(slippage / (this.lbPair.binStep / 100)) : MAX_ACTIVE_BIN_SLIPPAGE;
    if (upperBinId >= lowerBinId + MAX_BIN_PER_POSITION.toNumber()) {
      throw new Error(
        `Position must be within a range of 1 to ${MAX_BIN_PER_POSITION.toNumber()} bins.`
      );
    }
    const preInstructions = [];
    const initializePositionIx = await this.program.methods.initializePosition(lowerBinId, upperBinId - lowerBinId + 1).accounts({
      payer: user,
      position: positionPubKey,
      lbPair: this.pubkey,
      owner: user
    }).instruction();
    preInstructions.push(initializePositionIx);
    const lowerBinArrayIndex = binIdToBinArrayIndex(new BN13(lowerBinId));
    const [binArrayLower] = deriveBinArray(
      this.pubkey,
      lowerBinArrayIndex,
      this.program.programId
    );
    const upperBinArrayIndex = BN13.max(
      lowerBinArrayIndex.add(new BN13(1)),
      binIdToBinArrayIndex(new BN13(upperBinId))
    );
    const [binArrayUpper] = deriveBinArray(
      this.pubkey,
      upperBinArrayIndex,
      this.program.programId
    );
    const createBinArrayIxs = await this.createBinArraysIfNeeded(
      [lowerBinArrayIndex, upperBinArrayIndex],
      user
    );
    preInstructions.push(...createBinArrayIxs);
    const [
      { ataPubKey: userTokenX, ix: createPayerTokenXIx },
      { ataPubKey: userTokenY, ix: createPayerTokenYIx }
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenX.publicKey,
        user,
        this.tokenX.owner
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenY.publicKey,
        user,
        this.tokenY.owner
      )
    ]);
    createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
    createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
    if (this.tokenX.publicKey.equals(NATIVE_MINT2) && !totalXAmount.isZero()) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenX,
        BigInt(totalXAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
    }
    if (this.tokenY.publicKey.equals(NATIVE_MINT2) && !totalYAmount.isZero()) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenY,
        BigInt(totalYAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
    }
    const postInstructions = [];
    if ([
      this.tokenX.publicKey.toBase58(),
      this.tokenY.publicKey.toBase58()
    ].includes(NATIVE_MINT2.toBase58())) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    const minBinId = Math.min(...binIds);
    const maxBinId = Math.max(...binIds);
    const minBinArrayIndex = binIdToBinArrayIndex(new BN13(minBinId));
    const maxBinArrayIndex = binIdToBinArrayIndex(new BN13(maxBinId));
    const useExtension = isOverflowDefaultBinArrayBitmap(minBinArrayIndex) || isOverflowDefaultBinArrayBitmap(maxBinArrayIndex);
    const binArrayBitmapExtension = useExtension ? deriveBinArrayBitmapExtension(this.pubkey, this.program.programId)[0] : null;
    const activeId = this.lbPair.activeId;
    const binLiquidityDist = toWeightDistribution(
      totalXAmount,
      totalYAmount,
      xYAmountDistribution.map((item) => ({
        binId: item.binId,
        xAmountBpsOfTotal: item.xAmountBpsOfTotal,
        yAmountBpsOfTotal: item.yAmountBpsOfTotal
      })),
      this.lbPair.binStep
    );
    if (binLiquidityDist.length === 0) {
      throw new Error("No liquidity to add");
    }
    const liquidityParams = {
      amountX: totalXAmount,
      amountY: totalYAmount,
      binLiquidityDist,
      activeId,
      maxActiveBinSlippage
    };
    const addLiquidityAccounts = {
      position: positionPubKey,
      lbPair: this.pubkey,
      userTokenX,
      userTokenY,
      reserveX: this.lbPair.reserveX,
      reserveY: this.lbPair.reserveY,
      tokenXMint: this.lbPair.tokenXMint,
      tokenYMint: this.lbPair.tokenYMint,
      binArrayLower,
      binArrayUpper,
      binArrayBitmapExtension,
      sender: user,
      tokenXProgram: TOKEN_PROGRAM_ID4,
      tokenYProgram: TOKEN_PROGRAM_ID4
    };
    const oneSideLiquidityParams = {
      amount: totalXAmount.isZero() ? totalYAmount : totalXAmount,
      activeId,
      maxActiveBinSlippage,
      binLiquidityDist
    };
    const oneSideAddLiquidityAccounts = {
      binArrayLower,
      binArrayUpper,
      lbPair: this.pubkey,
      binArrayBitmapExtension: null,
      sender: user,
      position: positionPubKey,
      reserve: totalXAmount.isZero() ? this.lbPair.reserveY : this.lbPair.reserveX,
      tokenMint: totalXAmount.isZero() ? this.lbPair.tokenYMint : this.lbPair.tokenXMint,
      tokenProgram: TOKEN_PROGRAM_ID4,
      userToken: totalXAmount.isZero() ? userTokenY : userTokenX
    };
    const isOneSideDeposit = totalXAmount.isZero() || totalYAmount.isZero();
    const programMethod = isOneSideDeposit ? this.program.methods.addLiquidityOneSide(oneSideLiquidityParams) : this.program.methods.addLiquidityByWeight(liquidityParams);
    if (xYAmountDistribution.length < MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX) {
      const addLiqIx2 = await programMethod.accounts(
        isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts
      ).instruction();
      const instructions = [...preInstructions, addLiqIx2, ...postInstructions];
      const setCUIx2 = await getEstimatedComputeUnitIxWithBuffer(
        this.program.provider.connection,
        instructions,
        user
      );
      instructions.unshift(setCUIx2);
      const { blockhash: blockhash2, lastValidBlockHeight: lastValidBlockHeight2 } = await this.program.provider.connection.getLatestBlockhash("confirmed");
      return new Transaction({
        blockhash: blockhash2,
        lastValidBlockHeight: lastValidBlockHeight2,
        feePayer: user
      }).add(...instructions);
    }
    const addLiqIx = await programMethod.accounts(
      isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts
    ).instruction();
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      [addLiqIx],
      user,
      DEFAULT_ADD_LIQUIDITY_CU
      // The function return multiple transactions that dependent on each other, simulation will fail
    );
    const mainInstructions = [setCUIx, addLiqIx];
    const transactions = [];
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    if (preInstructions.length) {
      const preInstructionsTx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: user
      }).add(...preInstructions);
      transactions.push(preInstructionsTx);
    }
    const mainTx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: user
    }).add(...mainInstructions);
    transactions.push(mainTx);
    if (postInstructions.length) {
      const postInstructionsTx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: user
      }).add(...postInstructions);
      transactions.push(postInstructionsTx);
    }
    return transactions;
  }
  /**
   * The `addLiquidityByStrategy` function is used to add liquidity to existing position
   * @param {TInitializePositionAndAddLiquidityParamsByStrategy}
   *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
   *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
   *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
   *    - `strategy`: The strategy parameters to be used for the liquidity pool (Can use `calculateStrategyParameter` to calculate).
   *    - `user`: The public key of the user account.
   *    - `slippage`: The slippage percentage to be used for the liquidity pool.
   * @returns {Promise<Transaction>} The function `addLiquidityByWeight` returns a `Promise` that resolves to either a single
   * `Transaction` object
   */
  async addLiquidityByStrategy({
    positionPubKey,
    totalXAmount,
    totalYAmount,
    strategy,
    user,
    slippage
  }) {
    const { maxBinId, minBinId } = strategy;
    const maxActiveBinSlippage = slippage ? Math.ceil(slippage / (this.lbPair.binStep / 100)) : MAX_ACTIVE_BIN_SLIPPAGE;
    const preInstructions = [];
    const minBinArrayIndex = binIdToBinArrayIndex(new BN13(minBinId));
    const maxBinArrayIndex = binIdToBinArrayIndex(new BN13(maxBinId));
    const useExtension = isOverflowDefaultBinArrayBitmap(minBinArrayIndex) || isOverflowDefaultBinArrayBitmap(maxBinArrayIndex);
    const binArrayBitmapExtension = useExtension ? deriveBinArrayBitmapExtension(this.pubkey, this.program.programId)[0] : null;
    const strategyParameters = toStrategyParameters(strategy);
    const binArrayIndexes = getBinArrayIndexesCoverage(
      new BN13(minBinId),
      new BN13(maxBinId)
    );
    const binArrayAccountsMeta = getBinArrayAccountMetasCoverage(
      new BN13(minBinId),
      new BN13(maxBinId),
      this.pubkey,
      this.program.programId
    );
    const createBinArrayIxs = await this.createBinArraysIfNeeded(
      binArrayIndexes,
      user
    );
    preInstructions.push(...createBinArrayIxs);
    const [
      { ataPubKey: userTokenX, ix: createPayerTokenXIx },
      { ataPubKey: userTokenY, ix: createPayerTokenYIx }
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenX.publicKey,
        user,
        this.tokenX.owner
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenY.publicKey,
        user,
        this.tokenY.owner
      )
    ]);
    createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
    createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
    if (this.tokenX.publicKey.equals(NATIVE_MINT2) && !totalXAmount.isZero()) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenX,
        BigInt(totalXAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
    }
    if (this.tokenY.publicKey.equals(NATIVE_MINT2) && !totalYAmount.isZero()) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenY,
        BigInt(totalYAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
    }
    const postInstructions = [];
    if ([
      this.tokenX.publicKey.toBase58(),
      this.tokenY.publicKey.toBase58()
    ].includes(NATIVE_MINT2.toBase58())) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    const liquidityParams = {
      amountX: totalXAmount,
      amountY: totalYAmount,
      activeId: this.lbPair.activeId,
      maxActiveBinSlippage,
      strategyParameters
    };
    const addLiquidityAccounts = {
      position: positionPubKey,
      lbPair: this.pubkey,
      userTokenX,
      userTokenY,
      reserveX: this.lbPair.reserveX,
      reserveY: this.lbPair.reserveY,
      tokenXMint: this.lbPair.tokenXMint,
      tokenYMint: this.lbPair.tokenYMint,
      binArrayBitmapExtension,
      sender: user,
      tokenXProgram: this.tokenX.owner,
      tokenYProgram: this.tokenY.owner,
      memoProgram: MEMO_PROGRAM_ID
    };
    const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(0 /* Liquidity */);
    const programMethod = this.program.methods.addLiquidityByStrategy2(
      liquidityParams,
      {
        slices
      }
    );
    const addLiquidityIx = await programMethod.accounts(addLiquidityAccounts).remainingAccounts(transferHookAccounts).remainingAccounts(binArrayAccountsMeta).instruction();
    const instructions = [
      ...preInstructions,
      addLiquidityIx,
      ...postInstructions
    ];
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      instructions,
      user
    );
    instructions.unshift(setCUIx);
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: user
    }).add(...instructions);
  }
  /**
   * @deprecated Use `addLiquidityByStrategy` instead which support both token and token2022.
   * The `addLiquidityByWeight` function is used to add liquidity to existing position
   * @param {TInitializePositionAndAddLiquidityParams}
   *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
   *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
   *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
   *    - `xYAmountDistribution`: An array of objects of type `XYAmountDistribution` that represents (can use `calculateSpotDistribution`, `calculateBidAskDistribution` & `calculateNormalDistribution`)
   *    - `user`: The public key of the user account.
   *    - `slippage`: The slippage percentage to be used for the liquidity pool.
   * @returns {Promise<Transaction|Transaction[]>} The function `addLiquidityByWeight` returns a `Promise` that resolves to either a single
   * `Transaction` object (if less than 26bin involved) or an array of `Transaction` objects.
   */
  async addLiquidityByWeight({
    positionPubKey,
    totalXAmount,
    totalYAmount,
    xYAmountDistribution,
    user,
    slippage
  }) {
    const maxActiveBinSlippage = slippage ? Math.ceil(slippage / (this.lbPair.binStep / 100)) : MAX_ACTIVE_BIN_SLIPPAGE;
    const positionAccount = await this.program.account.positionV2.fetch(positionPubKey);
    const { lowerBinId, upperBinId, binIds } = this.processXYAmountDistribution(xYAmountDistribution);
    if (lowerBinId < positionAccount.lowerBinId)
      throw new Error(
        `Lower Bin ID (${lowerBinId}) lower than Position Lower Bin Id (${positionAccount.lowerBinId})`
      );
    if (upperBinId > positionAccount.upperBinId)
      throw new Error(
        `Upper Bin ID (${upperBinId}) higher than Position Upper Bin Id (${positionAccount.upperBinId})`
      );
    const minBinId = Math.min(...binIds);
    const maxBinId = Math.max(...binIds);
    const minBinArrayIndex = binIdToBinArrayIndex(new BN13(minBinId));
    const maxBinArrayIndex = binIdToBinArrayIndex(new BN13(maxBinId));
    const useExtension = isOverflowDefaultBinArrayBitmap(minBinArrayIndex) || isOverflowDefaultBinArrayBitmap(maxBinArrayIndex);
    const binArrayBitmapExtension = useExtension ? deriveBinArrayBitmapExtension(this.pubkey, this.program.programId)[0] : null;
    const activeId = this.lbPair.activeId;
    const binLiquidityDist = toWeightDistribution(
      totalXAmount,
      totalYAmount,
      xYAmountDistribution.map((item) => ({
        binId: item.binId,
        xAmountBpsOfTotal: item.xAmountBpsOfTotal,
        yAmountBpsOfTotal: item.yAmountBpsOfTotal
      })),
      this.lbPair.binStep
    );
    if (binLiquidityDist.length === 0) {
      throw new Error("No liquidity to add");
    }
    const lowerBinArrayIndex = binIdToBinArrayIndex(
      new BN13(positionAccount.lowerBinId)
    );
    const [binArrayLower] = deriveBinArray(
      this.pubkey,
      lowerBinArrayIndex,
      this.program.programId
    );
    const upperBinArrayIndex = BN13.max(
      lowerBinArrayIndex.add(new BN13(1)),
      binIdToBinArrayIndex(new BN13(positionAccount.upperBinId))
    );
    const [binArrayUpper] = deriveBinArray(
      this.pubkey,
      upperBinArrayIndex,
      this.program.programId
    );
    const preInstructions = [];
    const createBinArrayIxs = await this.createBinArraysIfNeeded(
      [lowerBinArrayIndex, upperBinArrayIndex],
      user
    );
    preInstructions.push(...createBinArrayIxs);
    const [
      { ataPubKey: userTokenX, ix: createPayerTokenXIx },
      { ataPubKey: userTokenY, ix: createPayerTokenYIx }
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenX.publicKey,
        user,
        this.tokenX.owner
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenY.publicKey,
        user,
        this.tokenY.owner
      )
    ]);
    createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
    createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
    if (this.tokenX.publicKey.equals(NATIVE_MINT2) && !totalXAmount.isZero()) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenX,
        BigInt(totalXAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
    }
    if (this.tokenY.publicKey.equals(NATIVE_MINT2) && !totalYAmount.isZero()) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenY,
        BigInt(totalYAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
    }
    const postInstructions = [];
    if ([
      this.tokenX.publicKey.toBase58(),
      this.tokenY.publicKey.toBase58()
    ].includes(NATIVE_MINT2.toBase58())) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    const liquidityParams = {
      amountX: totalXAmount,
      amountY: totalYAmount,
      binLiquidityDist,
      activeId,
      maxActiveBinSlippage
    };
    const addLiquidityAccounts = {
      position: positionPubKey,
      lbPair: this.pubkey,
      userTokenX,
      userTokenY,
      reserveX: this.lbPair.reserveX,
      reserveY: this.lbPair.reserveY,
      tokenXMint: this.lbPair.tokenXMint,
      tokenYMint: this.lbPair.tokenYMint,
      binArrayLower,
      binArrayUpper,
      binArrayBitmapExtension,
      sender: user,
      tokenXProgram: TOKEN_PROGRAM_ID4,
      tokenYProgram: TOKEN_PROGRAM_ID4
    };
    const oneSideLiquidityParams = {
      amount: totalXAmount.isZero() ? totalYAmount : totalXAmount,
      activeId,
      maxActiveBinSlippage,
      binLiquidityDist
    };
    const oneSideAddLiquidityAccounts = {
      binArrayLower,
      binArrayUpper,
      lbPair: this.pubkey,
      binArrayBitmapExtension: null,
      sender: user,
      position: positionPubKey,
      reserve: totalXAmount.isZero() ? this.lbPair.reserveY : this.lbPair.reserveX,
      tokenMint: totalXAmount.isZero() ? this.lbPair.tokenYMint : this.lbPair.tokenXMint,
      tokenProgram: TOKEN_PROGRAM_ID4,
      userToken: totalXAmount.isZero() ? userTokenY : userTokenX
    };
    const isOneSideDeposit = totalXAmount.isZero() || totalYAmount.isZero();
    const programMethod = isOneSideDeposit ? this.program.methods.addLiquidityOneSide(oneSideLiquidityParams) : this.program.methods.addLiquidityByWeight(liquidityParams);
    if (xYAmountDistribution.length < MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX) {
      const addLiqIx2 = await programMethod.accounts(
        isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts
      ).instruction();
      const instructions = [...preInstructions, addLiqIx2, ...postInstructions];
      const setCUIx2 = await getEstimatedComputeUnitIxWithBuffer(
        this.program.provider.connection,
        instructions,
        user
      );
      instructions.unshift(setCUIx2);
      const { blockhash: blockhash2, lastValidBlockHeight: lastValidBlockHeight2 } = await this.program.provider.connection.getLatestBlockhash("confirmed");
      return new Transaction({
        blockhash: blockhash2,
        lastValidBlockHeight: lastValidBlockHeight2,
        feePayer: user
      }).add(...instructions);
    }
    const addLiqIx = await programMethod.accounts(
      isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts
    ).instruction();
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      [addLiqIx],
      user
    );
    const mainInstructions = [setCUIx, addLiqIx];
    const transactions = [];
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    if (preInstructions.length) {
      const preInstructionsTx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: user
      }).add(...preInstructions);
      transactions.push(preInstructionsTx);
    }
    const mainTx = new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: user
    }).add(...mainInstructions);
    transactions.push(mainTx);
    if (postInstructions.length) {
      const postInstructionsTx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: user
      }).add(...postInstructions);
      transactions.push(postInstructionsTx);
    }
    return transactions;
  }
  /**
   * The `removeLiquidity` function is used to remove liquidity from a position,
   * with the option to claim rewards and close the position.
   * @param
   *    - `user`: The public key of the user account.
   *    - `position`: The public key of the position account.
   *    - `fromBinId`: The ID of the starting bin to remove liquidity from. Must within position range.
   *    - `toBinId`: The ID of the ending bin to remove liquidity from. Must within position range.
   *    - `liquiditiesBpsToRemove`: An array of numbers (percentage) that represent the liquidity to remove from each bin.
   *    - `shouldClaimAndClose`: A boolean flag that indicates whether to claim rewards and close the position.
   * @returns {Promise<Transaction | Transaction[]>}
   */
  async removeLiquidity({
    user,
    position,
    fromBinId,
    toBinId,
    bps,
    shouldClaimAndClose = false
  }) {
    const positionAccount = await this.program.provider.connection.getAccountInfo(position);
    const positionState = wrapPosition(this.program, position, positionAccount);
    const lbPair = positionState.lbPair();
    const owner = positionState.owner();
    const feeOwner = positionState.feeOwner();
    const liquidityShares = positionState.liquidityShares();
    const liqudityShareWithBinId = liquidityShares.map((share, i) => {
      return {
        share,
        binId: positionState.lowerBinId().add(new BN13(i))
      };
    });
    const binIdsWithLiquidity = liqudityShareWithBinId.filter((bin) => {
      return !bin.share.isZero();
    });
    if (binIdsWithLiquidity.length == 0) {
      throw new Error("No liquidity to remove");
    }
    const lowerBinIdWithLiquidity = binIdsWithLiquidity[0].binId.toNumber();
    const upperBinIdWithLiquidity = binIdsWithLiquidity[binIdsWithLiquidity.length - 1].binId.toNumber();
    if (fromBinId < lowerBinIdWithLiquidity) {
      fromBinId = lowerBinIdWithLiquidity;
    }
    if (toBinId > upperBinIdWithLiquidity) {
      toBinId = upperBinIdWithLiquidity;
    }
    const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(0 /* Liquidity */);
    const binArrayAccountsMeta = getBinArrayAccountMetasCoverage(
      new BN13(fromBinId),
      new BN13(toBinId),
      this.pubkey,
      this.program.programId
    );
    const preInstructions = [];
    const walletToReceiveFee = feeOwner.equals(PublicKey9.default) ? user : feeOwner;
    const [
      { ataPubKey: userTokenX, ix: createPayerTokenXIx },
      { ataPubKey: userTokenY, ix: createPayerTokenYIx },
      { ataPubKey: feeOwnerTokenX, ix: createFeeOwnerTokenXIx },
      { ataPubKey: feeOwnerTokenY, ix: createFeeOwnerTokenYIx }
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenX.publicKey,
        owner,
        this.tokenX.owner,
        user
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenY.publicKey,
        owner,
        this.tokenY.owner,
        user
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenX.publicKey,
        walletToReceiveFee,
        this.tokenX.owner,
        user
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenY.publicKey,
        walletToReceiveFee,
        this.tokenY.owner,
        user
      )
    ]);
    createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
    createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
    if (!walletToReceiveFee.equals(owner)) {
      createFeeOwnerTokenXIx && preInstructions.push(createFeeOwnerTokenXIx);
      createFeeOwnerTokenYIx && preInstructions.push(createFeeOwnerTokenYIx);
    }
    const secondTransactionsIx = [];
    const postInstructions = [];
    if (shouldClaimAndClose) {
      const claimSwapFeeIx = await this.program.methods.claimFee2(fromBinId, toBinId, {
        slices
      }).accounts({
        lbPair: this.pubkey,
        sender: user,
        position,
        reserveX: this.lbPair.reserveX,
        reserveY: this.lbPair.reserveY,
        tokenXMint: this.tokenX.publicKey,
        tokenYMint: this.tokenY.publicKey,
        userTokenX: feeOwnerTokenX,
        userTokenY: feeOwnerTokenY,
        tokenProgramX: this.tokenX.owner,
        tokenProgramY: this.tokenY.owner,
        memoProgram: MEMO_PROGRAM_ID
      }).remainingAccounts(transferHookAccounts).remainingAccounts(binArrayAccountsMeta).instruction();
      postInstructions.push(claimSwapFeeIx);
      for (let i = 0; i < 2; i++) {
        const rewardInfo = this.lbPair.rewardInfos[i];
        if (!rewardInfo || rewardInfo.mint.equals(PublicKey9.default))
          continue;
        const { ataPubKey, ix: rewardAtaIx } = await getOrCreateATAInstruction(
          this.program.provider.connection,
          rewardInfo.mint,
          user,
          this.rewards[i].owner
        );
        rewardAtaIx && preInstructions.push(rewardAtaIx);
        const { slices: slices2, accounts: transferHookAccounts2 } = this.getPotentialToken2022IxDataAndAccounts(1 /* Reward */, i);
        const claimRewardIx = await this.program.methods.claimReward2(new BN13(i), fromBinId, toBinId, {
          slices: slices2
        }).accounts({
          lbPair: this.pubkey,
          sender: user,
          position,
          rewardVault: rewardInfo.vault,
          rewardMint: rewardInfo.mint,
          tokenProgram: this.rewards[i].owner,
          userTokenAccount: ataPubKey,
          memoProgram: MEMO_PROGRAM_ID
        }).remainingAccounts(transferHookAccounts2).remainingAccounts(binArrayAccountsMeta).instruction();
        secondTransactionsIx.push(claimRewardIx);
      }
      const closePositionIx = await this.program.methods.closePositionIfEmpty().accounts({
        rentReceiver: owner,
        // Must be position owner
        position,
        sender: user
      }).instruction();
      if (secondTransactionsIx.length) {
        secondTransactionsIx.push(closePositionIx);
      } else {
        postInstructions.push(closePositionIx);
      }
    }
    if ([
      this.tokenX.publicKey.toBase58(),
      this.tokenY.publicKey.toBase58()
    ].includes(NATIVE_MINT2.toBase58())) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    const binArrayBitmapExtension = this.binArrayBitmapExtension ? this.binArrayBitmapExtension.publicKey : this.program.programId;
    const removeLiquidityTx = await this.program.methods.removeLiquidityByRange2(fromBinId, toBinId, bps.toNumber(), {
      slices
    }).accounts({
      position,
      lbPair,
      userTokenX,
      userTokenY,
      reserveX: this.lbPair.reserveX,
      reserveY: this.lbPair.reserveY,
      tokenXMint: this.tokenX.publicKey,
      tokenYMint: this.tokenY.publicKey,
      binArrayBitmapExtension,
      tokenXProgram: this.tokenX.owner,
      tokenYProgram: this.tokenY.owner,
      sender: user,
      memoProgram: MEMO_PROGRAM_ID
    }).remainingAccounts(transferHookAccounts).remainingAccounts(binArrayAccountsMeta).instruction();
    const instructions = [
      ...preInstructions,
      removeLiquidityTx,
      ...postInstructions
    ];
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      instructions,
      user
    );
    instructions.unshift(setCUIx);
    if (secondTransactionsIx.length) {
      const setCUIx2 = await getEstimatedComputeUnitIxWithBuffer(
        this.program.provider.connection,
        secondTransactionsIx,
        user
      );
      const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
      const claimRewardsTx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: user
      }).add(setCUIx2, ...secondTransactionsIx);
      const mainTx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: user
      }).add(...instructions);
      return [mainTx, claimRewardsTx];
    } else {
      const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
      return new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: user
      }).add(...instructions);
    }
  }
  /**
   * The `closePositionIfEmpty` function closes a position if it is empty. Else, it does nothing.
   */
  async closePositionIfEmpty({
    owner,
    position
  }) {
    const closePositionIfEmptyIx = await this.program.methods.closePositionIfEmpty().accounts({
      rentReceiver: owner,
      position: position.publicKey,
      sender: owner
    }).instruction();
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      [closePositionIfEmptyIx],
      owner
    );
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: owner
    }).add(setCUIx, closePositionIfEmptyIx);
  }
  /**
   * The `closePosition` function closes a position
   * @param
   *    - `owner`: The public key of the owner of the position.
   *    - `position`: The public key of the position account.
   * @returns {Promise<Transaction>}
   */
  async closePosition({
    owner,
    position
  }) {
    const closePositionIx = await this.program.methods.closePosition2().accounts({
      rentReceiver: owner,
      position: position.publicKey,
      sender: owner
    }).instruction();
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      [closePositionIx],
      owner
    );
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: owner
    }).add(setCUIx, closePositionIx);
  }
  /**
   * The `swapQuoteExactOut` function returns a quote for a swap
   * @param
   *    - `outAmount`: Amount of lamport to swap out
   *    - `swapForY`: Swap token X to Y when it is true, else reversed.
   *    - `allowedSlippage`: Allowed slippage for the swap. Expressed in BPS. To convert from slippage percentage to BPS unit: SLIPPAGE_PERCENTAGE * 100
   *    - `maxExtraBinArrays`: Maximum number of extra binArrays to return
   * @returns {SwapQuote}
   *    - `inAmount`: Amount of lamport to swap in
   *    - `outAmount`: Amount of lamport to swap out
   *    - `fee`: Fee amount
   *    - `protocolFee`: Protocol fee amount
   *    - `maxInAmount`: Maximum amount of lamport to swap in
   *    - `binArraysPubkey`: Array of bin arrays involved in the swap
   * @throws {DlmmSdkError}
   *
   */
  swapQuoteExactOut(outAmount, swapForY, allowedSlippage, binArrays, maxExtraBinArrays = 0) {
    const currentTimestamp = Date.now() / 1e3;
    const [inMint, outMint] = swapForY ? [this.tokenX.mint, this.tokenY.mint] : [this.tokenY.mint, this.tokenX.mint];
    let outAmountLeft = calculateTransferFeeIncludedAmount(
      outAmount,
      outMint,
      this.clock.epoch.toNumber()
    ).amount;
    if (maxExtraBinArrays < 0 || maxExtraBinArrays > MAX_EXTRA_BIN_ARRAYS) {
      throw new DlmmSdkError(
        "INVALID_MAX_EXTRA_BIN_ARRAYS",
        `maxExtraBinArrays must be a value between 0 and ${MAX_EXTRA_BIN_ARRAYS}`
      );
    }
    let vParameterClone = Object.assign({}, this.lbPair.vParameters);
    let activeId = new BN13(this.lbPair.activeId);
    const binStep = this.lbPair.binStep;
    const sParameters2 = this.lbPair.parameters;
    this.updateReference(
      activeId.toNumber(),
      vParameterClone,
      sParameters2,
      currentTimestamp
    );
    let startBinId = activeId;
    let binArraysForSwap = /* @__PURE__ */ new Map();
    let actualInAmount = new BN13(0);
    let feeAmount = new BN13(0);
    let protocolFeeAmount = new BN13(0);
    while (!outAmountLeft.isZero()) {
      let binArrayAccountToSwap = findNextBinArrayWithLiquidity(
        swapForY,
        activeId,
        this.lbPair,
        this.binArrayBitmapExtension?.account ?? null,
        binArrays
      );
      if (binArrayAccountToSwap == null) {
        throw new DlmmSdkError(
          "SWAP_QUOTE_INSUFFICIENT_LIQUIDITY",
          "Insufficient liquidity in binArrays"
        );
      }
      binArraysForSwap.set(binArrayAccountToSwap.publicKey, true);
      this.updateVolatilityAccumulator(
        vParameterClone,
        sParameters2,
        activeId.toNumber()
      );
      if (isBinIdWithinBinArray(activeId, binArrayAccountToSwap.account.index)) {
        const bin = getBinFromBinArray(
          activeId.toNumber(),
          binArrayAccountToSwap.account
        );
        const { amountIn, amountOut, fee, protocolFee } = swapExactOutQuoteAtBin(
          bin,
          binStep,
          sParameters2,
          vParameterClone,
          outAmountLeft,
          swapForY
        );
        if (!amountOut.isZero()) {
          outAmountLeft = outAmountLeft.sub(amountOut);
          actualInAmount = actualInAmount.add(amountIn);
          feeAmount = feeAmount.add(fee);
          protocolFeeAmount = protocolFee.add(protocolFee);
        }
      }
      if (!outAmountLeft.isZero()) {
        if (swapForY) {
          activeId = activeId.sub(new BN13(1));
        } else {
          activeId = activeId.add(new BN13(1));
        }
      }
    }
    const startPrice = getPriceOfBinByBinId(
      startBinId.toNumber(),
      this.lbPair.binStep
    );
    const endPrice = getPriceOfBinByBinId(
      activeId.toNumber(),
      this.lbPair.binStep
    );
    const priceImpact = startPrice.sub(endPrice).abs().div(startPrice).mul(new Decimal5(100));
    actualInAmount = calculateTransferFeeIncludedAmount(
      actualInAmount.add(feeAmount),
      inMint,
      this.clock.epoch.toNumber()
    ).amount;
    const maxInAmount = actualInAmount.mul(new BN13(BASIS_POINT_MAX).add(allowedSlippage)).div(new BN13(BASIS_POINT_MAX));
    if (maxExtraBinArrays > 0 && maxExtraBinArrays <= MAX_EXTRA_BIN_ARRAYS) {
      const extraBinArrays = new Array();
      while (extraBinArrays.length < maxExtraBinArrays) {
        let binArrayAccountToSwap = findNextBinArrayWithLiquidity(
          swapForY,
          activeId,
          this.lbPair,
          this.binArrayBitmapExtension?.account ?? null,
          binArrays
        );
        if (binArrayAccountToSwap == null) {
          break;
        }
        const binArrayAccountToSwapExisted = binArraysForSwap.has(
          binArrayAccountToSwap.publicKey
        );
        if (binArrayAccountToSwapExisted) {
          if (swapForY) {
            activeId = activeId.sub(new BN13(1));
          } else {
            activeId = activeId.add(new BN13(1));
          }
        } else {
          extraBinArrays.push(binArrayAccountToSwap.publicKey);
          const [lowerBinId, upperBinId] = getBinArrayLowerUpperBinId(
            binArrayAccountToSwap.account.index
          );
          if (swapForY) {
            activeId = lowerBinId.sub(new BN13(1));
          } else {
            activeId = upperBinId.add(new BN13(1));
          }
        }
      }
      extraBinArrays.forEach((binArrayPubkey) => {
        binArraysForSwap.set(binArrayPubkey, true);
      });
    }
    const binArraysPubkey = Array.from(binArraysForSwap.keys());
    return {
      inAmount: actualInAmount,
      maxInAmount,
      outAmount,
      priceImpact,
      fee: feeAmount,
      protocolFee: protocolFeeAmount,
      binArraysPubkey
    };
  }
  /**
   * The `swapQuote` function returns a quote for a swap
   * @param
   *    - `inAmount`: Amount of lamport to swap in
   *    - `swapForY`: Swap token X to Y when it is true, else reversed.
   *    - `allowedSlippage`: Allowed slippage for the swap. Expressed in BPS. To convert from slippage percentage to BPS unit: SLIPPAGE_PERCENTAGE * 100
   *    - `binArrays`: binArrays for swapQuote.
   *    - `isPartialFill`: Flag to check whether the the swapQuote is partial fill, default = false.
   *    - `maxExtraBinArrays`: Maximum number of extra binArrays to return
   * @returns {SwapQuote}
   *    - `consumedInAmount`: Amount of lamport to swap in
   *    - `outAmount`: Amount of lamport to swap out
   *    - `fee`: Fee amount
   *    - `protocolFee`: Protocol fee amount
   *    - `minOutAmount`: Minimum amount of lamport to swap out
   *    - `priceImpact`: Price impact of the swap
   *    - `binArraysPubkey`: Array of bin arrays involved in the swap
   * @throws {DlmmSdkError}
   */
  swapQuote(inAmount, swapForY, allowedSlippage, binArrays, isPartialFill, maxExtraBinArrays = 0) {
    const currentTimestamp = Date.now() / 1e3;
    if (maxExtraBinArrays < 0 || maxExtraBinArrays > MAX_EXTRA_BIN_ARRAYS) {
      throw new DlmmSdkError(
        "INVALID_MAX_EXTRA_BIN_ARRAYS",
        `maxExtraBinArrays must be a value between 0 and ${MAX_EXTRA_BIN_ARRAYS}`
      );
    }
    const [inMint, outMint] = swapForY ? [this.tokenX.mint, this.tokenY.mint] : [this.tokenY.mint, this.tokenX.mint];
    let transferFeeExcludedAmountIn = calculateTransferFeeExcludedAmount(
      inAmount,
      inMint,
      this.clock.epoch.toNumber()
    ).amount;
    let inAmountLeft = transferFeeExcludedAmountIn;
    let vParameterClone = Object.assign({}, this.lbPair.vParameters);
    let activeId = new BN13(this.lbPair.activeId);
    const binStep = this.lbPair.binStep;
    const sParameters2 = this.lbPair.parameters;
    this.updateReference(
      activeId.toNumber(),
      vParameterClone,
      sParameters2,
      currentTimestamp
    );
    let startBin = null;
    let binArraysForSwap = /* @__PURE__ */ new Map();
    let totalOutAmount = new BN13(0);
    let feeAmount = new BN13(0);
    let protocolFeeAmount = new BN13(0);
    let lastFilledActiveBinId = activeId;
    while (!inAmountLeft.isZero()) {
      let binArrayAccountToSwap = findNextBinArrayWithLiquidity(
        swapForY,
        activeId,
        this.lbPair,
        this.binArrayBitmapExtension?.account ?? null,
        binArrays
      );
      if (binArrayAccountToSwap == null) {
        if (isPartialFill) {
          break;
        } else {
          throw new DlmmSdkError(
            "SWAP_QUOTE_INSUFFICIENT_LIQUIDITY",
            "Insufficient liquidity in binArrays for swapQuote"
          );
        }
      }
      binArraysForSwap.set(binArrayAccountToSwap.publicKey, true);
      this.updateVolatilityAccumulator(
        vParameterClone,
        sParameters2,
        activeId.toNumber()
      );
      if (isBinIdWithinBinArray(activeId, binArrayAccountToSwap.account.index)) {
        const bin = getBinFromBinArray(
          activeId.toNumber(),
          binArrayAccountToSwap.account
        );
        const { amountIn, amountOut, fee, protocolFee } = swapExactInQuoteAtBin(
          bin,
          binStep,
          sParameters2,
          vParameterClone,
          inAmountLeft,
          swapForY
        );
        if (!amountIn.isZero()) {
          inAmountLeft = inAmountLeft.sub(amountIn);
          totalOutAmount = totalOutAmount.add(amountOut);
          feeAmount = feeAmount.add(fee);
          protocolFeeAmount = protocolFee.add(protocolFee);
          if (!startBin) {
            startBin = bin;
          }
          lastFilledActiveBinId = activeId;
        }
      }
      if (!inAmountLeft.isZero()) {
        if (swapForY) {
          activeId = activeId.sub(new BN13(1));
        } else {
          activeId = activeId.add(new BN13(1));
        }
      }
    }
    if (!startBin) {
      throw new DlmmSdkError(
        "SWAP_QUOTE_INSUFFICIENT_LIQUIDITY",
        "Insufficient liquidity"
      );
    }
    const actualInAmount = transferFeeExcludedAmountIn.sub(inAmountLeft);
    let transferFeeIncludedInAmount = calculateTransferFeeIncludedAmount(
      actualInAmount,
      inMint,
      this.clock.epoch.toNumber()
    ).amount;
    transferFeeIncludedInAmount = transferFeeIncludedInAmount.gt(inAmount) ? inAmount : transferFeeIncludedInAmount;
    const outAmountWithoutSlippage = getOutAmount(
      startBin,
      actualInAmount.sub(
        computeFeeFromAmount(
          binStep,
          sParameters2,
          vParameterClone,
          actualInAmount
        )
      ),
      swapForY
    );
    const priceImpact = new Decimal5(totalOutAmount.toString()).sub(new Decimal5(outAmountWithoutSlippage.toString())).div(new Decimal5(outAmountWithoutSlippage.toString())).mul(new Decimal5(100));
    const endPrice = getPriceOfBinByBinId(
      lastFilledActiveBinId.toNumber(),
      this.lbPair.binStep
    );
    if (maxExtraBinArrays > 0 && maxExtraBinArrays <= MAX_EXTRA_BIN_ARRAYS) {
      const extraBinArrays = new Array();
      while (extraBinArrays.length < maxExtraBinArrays) {
        let binArrayAccountToSwap = findNextBinArrayWithLiquidity(
          swapForY,
          activeId,
          this.lbPair,
          this.binArrayBitmapExtension?.account ?? null,
          binArrays
        );
        if (binArrayAccountToSwap == null) {
          break;
        }
        const binArrayAccountToSwapExisted = binArraysForSwap.has(
          binArrayAccountToSwap.publicKey
        );
        if (binArrayAccountToSwapExisted) {
          if (swapForY) {
            activeId = activeId.sub(new BN13(1));
          } else {
            activeId = activeId.add(new BN13(1));
          }
        } else {
          extraBinArrays.push(binArrayAccountToSwap.publicKey);
          const [lowerBinId, upperBinId] = getBinArrayLowerUpperBinId(
            binArrayAccountToSwap.account.index
          );
          if (swapForY) {
            activeId = lowerBinId.sub(new BN13(1));
          } else {
            activeId = upperBinId.add(new BN13(1));
          }
        }
      }
      extraBinArrays.forEach((binArrayPubkey) => {
        binArraysForSwap.set(binArrayPubkey, true);
      });
    }
    const binArraysPubkey = Array.from(binArraysForSwap.keys());
    const transferFeeExcludedAmountOut = calculateTransferFeeExcludedAmount(
      totalOutAmount,
      outMint,
      this.clock.epoch.toNumber()
    ).amount;
    const minOutAmount = transferFeeExcludedAmountOut.mul(new BN13(BASIS_POINT_MAX).sub(allowedSlippage)).div(new BN13(BASIS_POINT_MAX));
    return {
      consumedInAmount: transferFeeIncludedInAmount,
      outAmount: transferFeeExcludedAmountOut,
      fee: feeAmount,
      protocolFee: protocolFeeAmount,
      minOutAmount,
      priceImpact,
      binArraysPubkey,
      endPrice
    };
  }
  async swapExactOut({
    inToken,
    outToken,
    outAmount,
    maxInAmount,
    lbPair,
    user,
    binArraysPubkey
  }) {
    const preInstructions = [];
    const postInstructions = [];
    const [inTokenProgram, outTokenProgram] = inToken.equals(
      this.lbPair.tokenXMint
    ) ? [this.tokenX.owner, this.tokenY.owner] : [this.tokenY.owner, this.tokenX.owner];
    const [
      { ataPubKey: userTokenIn, ix: createInTokenAccountIx },
      { ataPubKey: userTokenOut, ix: createOutTokenAccountIx }
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        inToken,
        user,
        inTokenProgram
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        outToken,
        user,
        outTokenProgram
      )
    ]);
    createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
    createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
    if (inToken.equals(NATIVE_MINT2)) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenIn,
        BigInt(maxInAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    if (outToken.equals(NATIVE_MINT2)) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(0 /* Liquidity */);
    const binArrays = binArraysPubkey.map((pubkey) => {
      return {
        isSigner: false,
        isWritable: true,
        pubkey
      };
    });
    const swapIx = await this.program.methods.swapExactOut2(maxInAmount, outAmount, { slices }).accounts({
      lbPair,
      reserveX: this.lbPair.reserveX,
      reserveY: this.lbPair.reserveY,
      tokenXMint: this.lbPair.tokenXMint,
      tokenYMint: this.lbPair.tokenYMint,
      tokenXProgram: this.tokenX.owner,
      tokenYProgram: this.tokenY.owner,
      user,
      userTokenIn,
      userTokenOut,
      binArrayBitmapExtension: this.binArrayBitmapExtension ? this.binArrayBitmapExtension.publicKey : null,
      oracle: this.lbPair.oracle,
      hostFeeIn: null,
      memoProgram: MEMO_PROGRAM_ID
    }).remainingAccounts(transferHookAccounts).remainingAccounts(binArrays).instruction();
    const instructions = [...preInstructions, swapIx, ...postInstructions];
    instructions.push(
      ComputeBudgetProgram3.setComputeUnitLimit({
        units: 14e5
      })
    );
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: user
    }).add(...instructions);
  }
  /**
   * Returns a transaction to be signed and sent by user performing swap.
   * @param {SwapWithPriceImpactParams}
   *    - `inToken`: The public key of the token to be swapped in.
   *    - `outToken`: The public key of the token to be swapped out.
   *    - `inAmount`: The amount of token to be swapped in.
   *    - `priceImpact`: Accepted price impact bps.
   *    - `lbPair`: The public key of the liquidity pool.
   *    - `user`: The public key of the user account.
   *    - `binArraysPubkey`: Array of bin arrays involved in the swap
   * @returns {Promise<Transaction>}
   */
  async swapWithPriceImpact({
    inToken,
    outToken,
    inAmount,
    lbPair,
    user,
    priceImpact,
    binArraysPubkey
  }) {
    const preInstructions = [];
    const postInstructions = [];
    const [
      { ataPubKey: userTokenIn, ix: createInTokenAccountIx },
      { ataPubKey: userTokenOut, ix: createOutTokenAccountIx }
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        inToken,
        user,
        this.tokenX.owner
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        outToken,
        user,
        this.tokenY.owner
      )
    ]);
    createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
    createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
    if (inToken.equals(NATIVE_MINT2)) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenIn,
        BigInt(inAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    if (outToken.equals(NATIVE_MINT2)) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    const binArrays = binArraysPubkey.map((pubkey) => {
      return {
        isSigner: false,
        isWritable: true,
        pubkey
      };
    });
    const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(0 /* Liquidity */);
    const swapIx = await this.program.methods.swapWithPriceImpact2(
      inAmount,
      this.lbPair.activeId,
      priceImpact.toNumber(),
      { slices }
    ).accounts({
      lbPair,
      reserveX: this.lbPair.reserveX,
      reserveY: this.lbPair.reserveY,
      tokenXMint: this.lbPair.tokenXMint,
      tokenYMint: this.lbPair.tokenYMint,
      tokenXProgram: this.tokenX.owner,
      tokenYProgram: this.tokenY.owner,
      user,
      userTokenIn,
      userTokenOut,
      binArrayBitmapExtension: this.binArrayBitmapExtension ? this.binArrayBitmapExtension.publicKey : null,
      oracle: this.lbPair.oracle,
      hostFeeIn: null,
      memoProgram: MEMO_PROGRAM_ID
    }).remainingAccounts(transferHookAccounts).remainingAccounts(binArrays).instruction();
    const instructions = [...preInstructions, swapIx, ...postInstructions];
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      instructions,
      user
    );
    instructions.unshift(setCUIx);
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: user
    }).add(...instructions);
  }
  /**
   * Returns a transaction to be signed and sent by user performing swap.
   * @param {SwapParams}
   *    - `inToken`: The public key of the token to be swapped in.
   *    - `outToken`: The public key of the token to be swapped out.
   *    - `inAmount`: The amount of token to be swapped in.
   *    - `minOutAmount`: The minimum amount of token to be swapped out.
   *    - `lbPair`: The public key of the liquidity pool.
   *    - `user`: The public key of the user account.
   *    - `binArraysPubkey`: Array of bin arrays involved in the swap
   * @returns {Promise<Transaction>}
   */
  async swap({
    inToken,
    outToken,
    inAmount,
    minOutAmount,
    lbPair,
    user,
    binArraysPubkey
  }) {
    const preInstructions = [];
    const postInstructions = [];
    const [inTokenProgram, outTokenProgram] = inToken.equals(
      this.lbPair.tokenXMint
    ) ? [this.tokenX.owner, this.tokenY.owner] : [this.tokenY.owner, this.tokenX.owner];
    const [
      { ataPubKey: userTokenIn, ix: createInTokenAccountIx },
      { ataPubKey: userTokenOut, ix: createOutTokenAccountIx }
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        inToken,
        user,
        inTokenProgram
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        outToken,
        user,
        outTokenProgram
      )
    ]);
    createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
    createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
    if (inToken.equals(NATIVE_MINT2)) {
      const wrapSOLIx = wrapSOLInstruction(
        user,
        userTokenIn,
        BigInt(inAmount.toString())
      );
      preInstructions.push(...wrapSOLIx);
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    if (outToken.equals(NATIVE_MINT2)) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(user);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    const binArrays = binArraysPubkey.map((pubkey) => {
      return {
        isSigner: false,
        isWritable: true,
        pubkey
      };
    });
    const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(0 /* Liquidity */);
    const swapIx = await this.program.methods.swap2(inAmount, minOutAmount, { slices }).accounts({
      lbPair,
      reserveX: this.lbPair.reserveX,
      reserveY: this.lbPair.reserveY,
      tokenXMint: this.lbPair.tokenXMint,
      tokenYMint: this.lbPair.tokenYMint,
      tokenXProgram: this.tokenX.owner,
      tokenYProgram: this.tokenY.owner,
      user,
      userTokenIn,
      userTokenOut,
      binArrayBitmapExtension: this.binArrayBitmapExtension ? this.binArrayBitmapExtension.publicKey : null,
      oracle: this.lbPair.oracle,
      hostFeeIn: null,
      memoProgram: MEMO_PROGRAM_ID
    }).remainingAccounts(transferHookAccounts).remainingAccounts(binArrays).instruction();
    const instructions = [...preInstructions, swapIx, ...postInstructions];
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      instructions,
      user
    );
    instructions.unshift(setCUIx);
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: user
    }).add(...instructions);
  }
  /**
   * The claimLMReward function is used to claim rewards for a specific position owned by a specific owner.
   * @param
   *    - `owner`: The public key of the owner of the position.
   *    - `position`: The public key of the position account.
   * @returns {Promise<Transaction>} Claim LM reward transactions.
   */
  async claimLMReward({
    owner,
    position
  }) {
    const claimTransactions = await this.createClaimBuildMethod({
      owner,
      position
    });
    if (!claimTransactions.length)
      return;
    const instructions = claimTransactions.map((t) => t.instructions).flat();
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      instructions,
      owner
    );
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: owner
    }).add(setCUIx, ...claimTransactions);
  }
  /**
   * The `claimAllLMRewards` function is used to claim all liquidity mining rewards for a given owner
   * and their positions.
   * @param
   *    - `owner`: The public key of the owner of the positions.
   *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim rewards from.
   * @returns {Promise<Transaction[]>} Array of claim LM reward and fees transactions.
   */
  async claimAllLMRewards({
    owner,
    positions
  }) {
    const claimAllTxs = (await Promise.all(
      positions.filter(
        ({ positionData: { rewardOne, rewardTwo } }) => !rewardOne.isZero() || !rewardTwo.isZero()
      ).map(async (position, idx) => {
        return await this.createClaimBuildMethod({
          owner,
          position
        });
      })
    )).flat();
    const chunkedClaimAllTx = chunks(claimAllTxs, MAX_CLAIM_ALL_ALLOWED);
    if (chunkedClaimAllTx.length === 0)
      return [];
    const chunkedClaimAllTxIx = await Promise.all(
      chunkedClaimAllTx.map(async (txs) => {
        const ixs = txs.map((t) => t.instructions).flat();
        const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
          this.program.provider.connection,
          ixs,
          owner
        );
        return [setCUIx, ...ixs];
      })
    );
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return Promise.all(
      chunkedClaimAllTxIx.map(async (claimAllTx) => {
        return new Transaction({
          feePayer: owner,
          blockhash,
          lastValidBlockHeight
        }).add(...claimAllTx);
      })
    );
  }
  async setActivationPoint(activationPoint) {
    const setActivationPointTx = await this.program.methods.setActivationPoint(activationPoint).accounts({
      lbPair: this.pubkey,
      admin: this.lbPair.creator
    }).transaction();
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      feePayer: this.lbPair.creator,
      blockhash,
      lastValidBlockHeight
    }).add(setActivationPointTx);
  }
  async setPairStatus(enabled) {
    const pairStatus = enabled ? 0 : 1;
    const tx = await this.program.methods.setPairStatus(pairStatus).accounts({
      lbPair: this.pubkey,
      admin: this.lbPair.creator
    }).transaction();
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      feePayer: this.lbPair.creator,
      blockhash,
      lastValidBlockHeight
    }).add(tx);
  }
  /**
   * The function `claimSwapFee` is used to claim swap fees for a specific position owned by a specific owner.
   * @param
   *    - `owner`: The public key of the owner of the position.
   *    - `position`: The public key of the position account.
   *    - `binRange`: The bin range to claim swap fees for. If not provided, the function claim swap fees for full range.
   * @returns {Promise<Transaction>} Claim swap fee transactions.
   */
  async claimSwapFee({
    owner,
    position
  }) {
    const claimFeeTx = await this.createClaimSwapFeeMethod({ owner, position });
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
      this.program.provider.connection,
      claimFeeTx.instructions,
      owner
    );
    return new Transaction({
      blockhash,
      lastValidBlockHeight,
      feePayer: owner
    }).add(setCUIx, ...claimFeeTx.instructions);
  }
  /**
   * The `claimAllSwapFee` function to claim swap fees for multiple positions owned by a specific owner.
   * @param
   *    - `owner`: The public key of the owner of the positions.
   *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim swap fees from.
   * @returns {Promise<Transaction[]>} Array of claim swap fee transactions.
   */
  async claimAllSwapFee({
    owner,
    positions
  }) {
    const claimAllTxs = (await Promise.all(
      positions.filter(
        ({ positionData: { feeX, feeY } }) => !feeX.isZero() || !feeY.isZero()
      ).map(async (position) => {
        return await this.createClaimSwapFeeMethod({
          owner,
          position
        });
      })
    )).flat();
    const chunkedClaimAllTx = chunks(claimAllTxs, MAX_CLAIM_ALL_ALLOWED);
    if (chunkedClaimAllTx.length === 0)
      return [];
    const chunkedClaimAllTxIxs = await Promise.all(
      chunkedClaimAllTx.map(async (tx) => {
        const ixs = tx.map((t) => t.instructions).flat();
        const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
          this.program.provider.connection,
          ixs,
          owner
        );
        return [setCUIx, ...ixs];
      })
    );
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return Promise.all(
      chunkedClaimAllTxIxs.map(async (claimAllTx) => {
        return new Transaction({
          feePayer: owner,
          blockhash,
          lastValidBlockHeight
        }).add(...claimAllTx);
      })
    );
  }
  /**
   * The function `claimAllRewardsByPosition` allows a user to claim all rewards for a specific
   * position.
   * @param
   *    - `owner`: The public key of the owner of the position.
   *    - `position`: The public key of the position account.
   * @returns {Promise<Transaction[]>} Array of claim reward transactions.
   */
  async claimAllRewardsByPosition({
    owner,
    position
  }) {
    const claimAllSwapFeeTxs = await this.createClaimSwapFeeMethod({
      owner,
      position
    });
    const claimAllLMTxs = await this.createClaimBuildMethod({
      owner,
      position
    });
    const claimAllTxs = chunks(
      [claimAllSwapFeeTxs, ...claimAllLMTxs],
      MAX_CLAIM_ALL_ALLOWED
    );
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return Promise.all(
      claimAllTxs.map(async (claimAllTx) => {
        const instructions = claimAllTx.map((t) => t.instructions).flat();
        const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
          this.program.provider.connection,
          instructions,
          owner
        );
        const tx = new Transaction({
          feePayer: owner,
          blockhash,
          lastValidBlockHeight
        }).add(setCUIx, ...instructions);
        return tx;
      })
    );
  }
  /**
   * The `seedLiquidity` function create multiple grouped instructions. The grouped instructions will be [init ata + send lamport for token provde], [initialize bin array + initialize position instructions] and [deposit instruction]. Each grouped instructions can be executed parallelly.
   * @param
   *    - `owner`: The public key of the positions owner.
   *    - `seedAmount`: Lamport amount to be seeded to the pool.
   *    - `minPrice`: Start price in UI format
   *    - `maxPrice`: End price in UI format
   *    - `base`: Base key
   *    - `txPayer`: Account rental fee payer
   *    - `feeOwner`: Fee owner key. Default to position owner
   *    - `operator`: Operator key
   *    - `lockReleasePoint`: Timelock. Point (slot/timestamp) the position can withdraw the liquidity,
   *    - `shouldSeedPositionOwner` (optional): Whether to send 1 lamport amount of token X to the position owner to prove ownership.
   * @returns {Promise<SeedLiquidityResponse>}
   */
  async seedLiquidity(owner, seedAmount, curvature, minPrice, maxPrice, base, payer, feeOwner, operator, lockReleasePoint, shouldSeedPositionOwner = false) {
    const toLamportMultiplier = new Decimal5(
      10 ** (this.tokenY.mint.decimals - this.tokenX.mint.decimals)
    );
    const minPricePerLamport = new Decimal5(minPrice).mul(toLamportMultiplier);
    const maxPricePerLamport = new Decimal5(maxPrice).mul(toLamportMultiplier);
    const minBinId = new BN13(
      DLMM.getBinIdFromPrice(minPricePerLamport, this.lbPair.binStep, false)
    );
    const maxBinId = new BN13(
      DLMM.getBinIdFromPrice(maxPricePerLamport, this.lbPair.binStep, true)
    );
    if (minBinId.toNumber() < this.lbPair.activeId) {
      throw new Error("minPrice < current pair price");
    }
    if (minBinId.toNumber() >= maxBinId.toNumber()) {
      throw new Error("Price range too small");
    }
    const k = 1 / curvature;
    const binDepositAmount = generateAmountForBinRange(
      seedAmount,
      this.lbPair.binStep,
      this.tokenX.mint.decimals,
      this.tokenY.mint.decimals,
      minBinId,
      maxBinId,
      k
    );
    const decompressMultiplier = new BN13(10 ** this.tokenX.mint.decimals);
    let { compressedBinAmount, compressionLoss } = compressBinAmount(
      binDepositAmount,
      decompressMultiplier
    );
    let {
      newCompressedBinAmount: compressedBinDepositAmount,
      loss: finalLoss
    } = distributeAmountToCompressedBinsByRatio(
      compressedBinAmount,
      compressionLoss,
      decompressMultiplier,
      new BN13(2 ** 32 - 1)
      // u32
    );
    const positionCount = getPositionCount(minBinId, maxBinId.sub(new BN13(1)));
    const seederTokenX = getAssociatedTokenAddressSync2(
      this.lbPair.tokenXMint,
      operator,
      false,
      this.tokenX.owner
    );
    const seederTokenY = getAssociatedTokenAddressSync2(
      this.lbPair.tokenYMint,
      operator,
      false,
      this.tokenY.owner
    );
    const ownerTokenX = getAssociatedTokenAddressSync2(
      this.lbPair.tokenXMint,
      owner,
      false,
      this.tokenX.owner
    );
    const sendPositionOwnerTokenProveIxs = [];
    const initializeBinArraysAndPositionIxs = [];
    const addLiquidityIxs = [];
    const appendedInitBinArrayIx = /* @__PURE__ */ new Set();
    if (shouldSeedPositionOwner) {
      const positionOwnerTokenX = await this.program.provider.connection.getAccountInfo(ownerTokenX);
      let requireTokenProve = false;
      if (positionOwnerTokenX) {
        const ownerTokenXState = unpackAccount(
          ownerTokenX,
          positionOwnerTokenX,
          this.tokenX.owner
        );
        requireTokenProve = ownerTokenXState.amount == 0n;
      } else {
        requireTokenProve = true;
      }
      if (requireTokenProve) {
        const initPositionOwnerTokenX = createAssociatedTokenAccountIdempotentInstruction2(
          payer,
          ownerTokenX,
          owner,
          this.lbPair.tokenXMint,
          this.tokenX.owner
        );
        const proveAmount = calculateTransferFeeIncludedAmount(
          new BN13(1),
          this.tokenX.mint,
          this.clock.epoch.toNumber()
        ).amount;
        sendPositionOwnerTokenProveIxs.push(initPositionOwnerTokenX);
        const transferIx = createTransferCheckedInstruction2(
          seederTokenX,
          this.lbPair.tokenXMint,
          ownerTokenX,
          operator,
          BigInt(proveAmount.toString()),
          this.tokenX.mint.decimals,
          [],
          this.tokenX.owner
        );
        transferIx.keys.push(...this.tokenX.transferHookAccountMetas);
        sendPositionOwnerTokenProveIxs.push(transferIx);
      }
    }
    const slices = [
      {
        accountsType: {
          transferHookX: {}
        },
        length: this.tokenX.transferHookAccountMetas.length
      }
    ];
    const transferHookAccountMetas = this.tokenX.transferHookAccountMetas;
    for (let i = 0; i < positionCount.toNumber(); i++) {
      const lowerBinId = minBinId.add(MAX_BIN_PER_POSITION.mul(new BN13(i)));
      const upperBinId = lowerBinId.add(MAX_BIN_PER_POSITION).sub(new BN13(1));
      const binArrayAccountMetas = getBinArrayAccountMetasCoverage(
        lowerBinId,
        upperBinId,
        this.pubkey,
        this.program.programId
      );
      const binArrayIndexes = getBinArrayIndexesCoverage(
        lowerBinId,
        upperBinId
      );
      const [positionPda, _bump] = derivePosition(
        this.pubkey,
        base,
        lowerBinId,
        MAX_BIN_PER_POSITION,
        this.program.programId
      );
      const accounts = await this.program.provider.connection.getMultipleAccountsInfo([
        ...binArrayAccountMetas.map((acc) => acc.pubkey),
        positionPda
      ]);
      let instructions = [];
      const binArrayAccounts = accounts.splice(0, binArrayAccountMetas.length);
      for (let i2 = 0; i2 < binArrayAccountMetas.length; i2++) {
        const account = binArrayAccounts[i2];
        const pubkey = binArrayAccountMetas[i2].pubkey.toBase58();
        const index = binArrayIndexes[i2];
        if (!account && !appendedInitBinArrayIx.has(pubkey)) {
          instructions.push(
            await this.program.methods.initializeBinArray(index).accounts({
              lbPair: this.pubkey,
              binArray: pubkey,
              funder: payer
            }).instruction()
          );
        }
      }
      const positionAccount = accounts.pop();
      if (!positionAccount) {
        instructions.push(
          await this.program.methods.initializePositionByOperator(
            lowerBinId.toNumber(),
            MAX_BIN_PER_POSITION.toNumber(),
            feeOwner,
            lockReleasePoint
          ).accounts({
            lbPair: this.pubkey,
            position: positionPda,
            base,
            owner,
            operator,
            operatorTokenX: seederTokenX,
            ownerTokenX,
            systemProgram: SystemProgram2.programId,
            payer
          }).instruction()
        );
      }
      if (instructions.length > 1) {
        initializeBinArraysAndPositionIxs.push(instructions);
        instructions = [];
      }
      const positionDeposited = positionAccount && this.program.coder.accounts.decode(
        this.program.account.positionV2.idlAccount.name,
        positionAccount.data
      ).liquidityShares.reduce((total, cur) => total.add(cur), new BN13(0)).gt(new BN13(0));
      if (!positionDeposited) {
        const cappedUpperBinId = Math.min(
          upperBinId.toNumber(),
          maxBinId.toNumber() - 1
        );
        const bins = [];
        for (let i2 = lowerBinId.toNumber(); i2 <= cappedUpperBinId; i2++) {
          bins.push({
            binId: i2,
            amount: compressedBinDepositAmount.get(i2).toNumber()
          });
        }
        instructions.push(
          await this.program.methods.addLiquidityOneSidePrecise2(
            {
              bins,
              decompressMultiplier,
              maxAmount: U64_MAX
            },
            {
              slices
            }
          ).accounts({
            position: positionPda,
            lbPair: this.pubkey,
            binArrayBitmapExtension: this.binArrayBitmapExtension ? this.binArrayBitmapExtension.publicKey : this.program.programId,
            userToken: seederTokenX,
            reserve: this.lbPair.reserveX,
            tokenMint: this.lbPair.tokenXMint,
            sender: operator,
            tokenProgram: this.tokenX.owner
          }).remainingAccounts([
            ...transferHookAccountMetas,
            ...binArrayAccountMetas
          ]).instruction()
        );
        if (i + 1 >= positionCount.toNumber() && !finalLoss.isZero()) {
          const finalLossIncludesTransferFee = calculateTransferFeeIncludedAmount(
            finalLoss,
            this.tokenX.mint,
            this.clock.epoch.toNumber()
          ).amount;
          instructions.push(
            await this.program.methods.addLiquidity2(
              {
                amountX: finalLossIncludesTransferFee,
                amountY: new BN13(0),
                binLiquidityDist: [
                  {
                    binId: cappedUpperBinId,
                    distributionX: BASIS_POINT_MAX,
                    distributionY: BASIS_POINT_MAX
                  }
                ]
              },
              {
                slices
              }
            ).accounts({
              position: positionPda,
              lbPair: this.pubkey,
              binArrayBitmapExtension: this.binArrayBitmapExtension ? this.binArrayBitmapExtension.publicKey : this.program.programId,
              userTokenX: seederTokenX,
              userTokenY: seederTokenY,
              reserveX: this.lbPair.reserveX,
              reserveY: this.lbPair.reserveY,
              tokenXMint: this.lbPair.tokenXMint,
              tokenYMint: this.lbPair.tokenYMint,
              tokenXProgram: this.tokenX.owner,
              tokenYProgram: this.tokenY.owner,
              sender: operator
            }).remainingAccounts([
              ...transferHookAccountMetas,
              ...getBinArrayAccountMetasCoverage(
                new BN13(cappedUpperBinId),
                new BN13(cappedUpperBinId),
                this.pubkey,
                this.program.programId
              )
            ]).instruction()
          );
        }
        addLiquidityIxs.push([
          ComputeBudgetProgram3.setComputeUnitLimit({
            units: DEFAULT_ADD_LIQUIDITY_CU
          }),
          ...instructions
        ]);
      }
    }
    return {
      sendPositionOwnerTokenProveIxs,
      initializeBinArraysAndPositionIxs,
      addLiquidityIxs
    };
  }
  /**
   * The `seedLiquiditySingleBin` function seed liquidity into a single bin.
   * @param
   *    - `payer`: The public key of the tx payer.
   *    - `base`: Base key
   *    - `seedAmount`: Token X lamport amount to be seeded to the pool.
   *    - `price`: TokenX/TokenY Price in UI format
   *    - `roundingUp`: Whether to round up the price
   *    - `positionOwner`: The owner of the position
   *    - `feeOwner`: Position fee owner
   *    - `operator`: Operator of the position. Operator able to manage the position on behalf of the position owner. However, liquidity withdrawal issue by the operator can only send to the position owner.
   *    - `lockReleasePoint`: The lock release point of the position.
   *    - `shouldSeedPositionOwner` (optional): Whether to send 1 lamport amount of token X to the position owner to prove ownership.
   *
   * The returned instructions need to be executed sequentially if it was separated into multiple transactions.
   * @returns {Promise<TransactionInstruction[]>}
   */
  async seedLiquiditySingleBin(payer, base, seedAmount, price, roundingUp, positionOwner, feeOwner, operator, lockReleasePoint, shouldSeedPositionOwner = false) {
    const pricePerLamport = DLMM.getPricePerLamport(
      this.tokenX.mint.decimals,
      this.tokenY.mint.decimals,
      price
    );
    const binIdNumber = DLMM.getBinIdFromPrice(
      pricePerLamport,
      this.lbPair.binStep,
      !roundingUp
    );
    const binId = new BN13(binIdNumber);
    const [positionPda] = derivePosition(
      this.pubkey,
      base,
      binId,
      new BN13(1),
      this.program.programId
    );
    const binArrayIndex = binIdToBinArrayIndex(binId);
    const [binArrayKey] = deriveBinArray(
      this.pubkey,
      binArrayIndex,
      this.program.programId
    );
    const preInstructions = [];
    const [
      { ataPubKey: userTokenX, ix: createPayerTokenXIx },
      { ataPubKey: userTokenY, ix: createPayerTokenYIx }
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenX.publicKey,
        operator,
        this.tokenX.owner,
        payer
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenY.publicKey,
        operator,
        this.tokenY.owner,
        payer
      )
    ]);
    createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
    createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
    let [binArrayBitmapExtension] = deriveBinArrayBitmapExtension(
      this.pubkey,
      this.program.programId
    );
    const [binArrayAccount, positionAccount, bitmapExtensionAccount] = await this.program.provider.connection.getMultipleAccountsInfo([
      binArrayKey,
      positionPda,
      binArrayBitmapExtension
    ]);
    if (isOverflowDefaultBinArrayBitmap(binArrayIndex)) {
      if (!bitmapExtensionAccount) {
        preInstructions.push(
          await this.program.methods.initializeBinArrayBitmapExtension().accounts({
            binArrayBitmapExtension,
            funder: payer,
            lbPair: this.pubkey
          }).instruction()
        );
      }
    } else {
      binArrayBitmapExtension = this.program.programId;
    }
    const operatorTokenX = getAssociatedTokenAddressSync2(
      this.lbPair.tokenXMint,
      operator,
      true,
      this.tokenX.owner
    );
    const positionOwnerTokenX = getAssociatedTokenAddressSync2(
      this.lbPair.tokenXMint,
      positionOwner,
      true,
      this.tokenX.owner
    );
    if (shouldSeedPositionOwner) {
      const positionOwnerTokenXAccount = await this.program.provider.connection.getAccountInfo(
        positionOwnerTokenX
      );
      const proveAmount = calculateTransferFeeIncludedAmount(
        new BN13(1),
        this.tokenX.mint,
        this.clock.epoch.toNumber()
      ).amount;
      if (positionOwnerTokenXAccount) {
        const account = unpackAccount(
          positionOwnerTokenX,
          positionOwnerTokenXAccount,
          this.tokenX.owner
        );
        if (account.amount == BigInt(0)) {
          const transferIx = createTransferCheckedInstruction2(
            operatorTokenX,
            this.lbPair.tokenXMint,
            positionOwnerTokenX,
            operator,
            BigInt(proveAmount.toString()),
            this.tokenX.mint.decimals,
            [],
            this.tokenX.owner
          );
          transferIx.keys.push(...this.tokenX.transferHookAccountMetas);
          preInstructions.push(transferIx);
        }
      } else {
        const createPositionOwnerTokenXIx = createAssociatedTokenAccountIdempotentInstruction2(
          payer,
          positionOwnerTokenX,
          positionOwner,
          this.lbPair.tokenXMint,
          this.tokenX.owner
        );
        preInstructions.push(createPositionOwnerTokenXIx);
        const transferIx = createTransferCheckedInstruction2(
          operatorTokenX,
          this.lbPair.tokenXMint,
          positionOwnerTokenX,
          operator,
          BigInt(proveAmount.toString()),
          this.tokenX.mint.decimals,
          [],
          this.tokenX.owner
        );
        transferIx.keys.push(...this.tokenX.transferHookAccountMetas);
        preInstructions.push(transferIx);
      }
    }
    if (!binArrayAccount) {
      preInstructions.push(
        await this.program.methods.initializeBinArray(binArrayIndex).accounts({
          binArray: binArrayKey,
          funder: payer,
          lbPair: this.pubkey
        }).instruction()
      );
    }
    if (!positionAccount) {
      preInstructions.push(
        await this.program.methods.initializePositionByOperator(
          binId.toNumber(),
          1,
          feeOwner,
          lockReleasePoint
        ).accounts({
          payer,
          base,
          position: positionPda,
          lbPair: this.pubkey,
          owner: positionOwner,
          operator,
          operatorTokenX,
          ownerTokenX: positionOwnerTokenX
        }).instruction()
      );
    }
    const slices = [
      {
        accountsType: {
          transferHookX: {}
        },
        length: this.tokenX.transferHookAccountMetas.length
      }
    ];
    const transferHookAccountMetas = this.tokenX.transferHookAccountMetas;
    const binLiquidityDist = {
      binId: binIdNumber,
      distributionX: BASIS_POINT_MAX,
      distributionY: BASIS_POINT_MAX
    };
    const seedAmountIncludeTransferFee = calculateTransferFeeIncludedAmount(
      seedAmount,
      this.tokenX.mint,
      this.clock.epoch.toNumber()
    ).amount;
    const addLiquidityParams = {
      amountX: seedAmountIncludeTransferFee,
      amountY: new BN13(0),
      binLiquidityDist: [binLiquidityDist]
    };
    const depositLiquidityIx = await this.program.methods.addLiquidity2(addLiquidityParams, {
      slices
    }).accounts({
      position: positionPda,
      lbPair: this.pubkey,
      binArrayBitmapExtension,
      userTokenX,
      userTokenY,
      reserveX: this.lbPair.reserveX,
      reserveY: this.lbPair.reserveY,
      tokenXMint: this.lbPair.tokenXMint,
      tokenYMint: this.lbPair.tokenYMint,
      sender: operator,
      tokenXProgram: TOKEN_PROGRAM_ID4,
      tokenYProgram: TOKEN_PROGRAM_ID4
    }).remainingAccounts([
      ...transferHookAccountMetas,
      {
        pubkey: binArrayKey,
        isSigner: false,
        isWritable: true
      }
    ]).instruction();
    return [...preInstructions, depositLiquidityIx];
  }
  /**
   * Initializes bin arrays for the given bin array indexes if it wasn't initialized.
   *
   * @param {BN[]} binArrayIndexes - An array of bin array indexes to initialize.
   * @param {PublicKey} funder - The public key of the funder.
   * @return {Promise<TransactionInstruction[]>} An array of transaction instructions to initialize the bin arrays.
   */
  async initializeBinArrays(binArrayIndexes, funder) {
    const ixs = [];
    for (const idx of binArrayIndexes) {
      const [binArray] = deriveBinArray(
        this.pubkey,
        idx,
        this.program.programId
      );
      const binArrayAccount = await this.program.provider.connection.getAccountInfo(binArray);
      if (binArrayAccount === null) {
        const initBinArrayIx = await this.program.methods.initializeBinArray(idx).accounts({
          binArray,
          funder,
          lbPair: this.pubkey
        }).instruction();
        ixs.push(initBinArrayIx);
      }
    }
    if (ixs.length > 0) {
      const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
        this.program.provider.connection,
        ixs,
        funder
      );
      ixs.unshift(setCUIx);
    }
    return ixs;
  }
  /**
   *
   * @param
   *    - `lowerBinId`: Lower bin ID of the position. This represent the lowest price of the position
   *    - `positionWidth`: Width of the position. This will decide the upper bin id of the position, which represents the highest price of the position. UpperBinId = lowerBinId + positionWidth
   *    - `owner`: Owner of the position.
   *    - `operator`: Operator of the position. Operator able to manage the position on behalf of the position owner. However, liquidity withdrawal issue by the operator can only send to the position owner.
   *    - `base`: Base key
   *    - `feeOwner`: Owner of the fees earned by the position.
   *    - `payer`: Payer for the position account rental.
   *    - `lockReleasePoint`: The lock release point of the position.
   * @returns
   */
  async initializePositionByOperator({
    lowerBinId,
    positionWidth,
    owner,
    feeOwner,
    base,
    operator,
    payer,
    lockReleasePoint
  }) {
    const [positionPda, _bump] = derivePosition(
      this.pubkey,
      base,
      lowerBinId,
      positionWidth,
      this.program.programId
    );
    const operatorTokenX = getAssociatedTokenAddressSync2(
      this.lbPair.tokenXMint,
      operator,
      true,
      this.tokenX.owner
    );
    const ownerTokenX = getAssociatedTokenAddressSync2(
      this.lbPair.tokenXMint,
      owner,
      true,
      this.tokenY.owner
    );
    const initializePositionByOperatorTx = await this.program.methods.initializePositionByOperator(
      lowerBinId.toNumber(),
      MAX_BIN_PER_POSITION.toNumber(),
      feeOwner,
      lockReleasePoint
    ).accounts({
      lbPair: this.pubkey,
      position: positionPda,
      base,
      operator,
      owner,
      ownerTokenX,
      operatorTokenX,
      payer
    }).transaction();
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return new Transaction({
      feePayer: operator,
      blockhash,
      lastValidBlockHeight
    }).add(initializePositionByOperatorTx);
  }
  /**
   * The `claimAllRewards` function to claim swap fees and LM rewards for multiple positions owned by a specific owner.
   * @param
   *    - `owner`: The public key of the owner of the positions.
   *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim swap fees and LM rewards from.
   * @returns {Promise<Transaction[]>} Array of claim swap fee and LM reward transactions.
   */
  async claimAllRewards({
    owner,
    positions
  }) {
    positions = positions.filter(
      ({ positionData: { feeX, feeY, rewardOne, rewardTwo } }) => !feeX.isZero() || !feeY.isZero() || !rewardOne.isZero() || !rewardTwo.isZero()
    );
    const claimAllSwapFeeTxs = (await Promise.all(
      positions.map(async (position) => {
        return await this.createClaimSwapFeeMethod({
          owner,
          position
        });
      })
    )).flat();
    const claimAllLMTxs = (await Promise.all(
      positions.map(async (position) => {
        return await this.createClaimBuildMethod({
          owner,
          position
        });
      })
    )).flat();
    const chunkedClaimAllTx = chunks(
      [...claimAllSwapFeeTxs, ...claimAllLMTxs],
      MAX_CLAIM_ALL_ALLOWED
    );
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    return Promise.all(
      chunkedClaimAllTx.map(async (claimAllTx) => {
        const instructions = claimAllTx.map((t) => t.instructions).flat();
        const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
          this.program.provider.connection,
          instructions,
          owner
        );
        const tx = new Transaction({
          feePayer: owner,
          blockhash,
          lastValidBlockHeight
        }).add(setCUIx, ...instructions);
        return tx;
      })
    );
  }
  canSyncWithMarketPrice(marketPrice, activeBinId) {
    const marketPriceBinId = this.getBinIdFromPrice(
      Number(
        DLMM.getPricePerLamport(
          this.tokenX.mint.decimals,
          this.tokenY.mint.decimals,
          marketPrice
        )
      ),
      false
    );
    const marketPriceBinArrayIndex = binIdToBinArrayIndex(
      new BN13(marketPriceBinId)
    );
    const swapForY = marketPriceBinId < activeBinId;
    const toBinArrayIndex = findNextBinArrayIndexWithLiquidity(
      swapForY,
      new BN13(activeBinId),
      this.lbPair,
      this.binArrayBitmapExtension?.account ?? null
    );
    if (toBinArrayIndex === null)
      return true;
    return swapForY ? marketPriceBinArrayIndex.gt(toBinArrayIndex) : marketPriceBinArrayIndex.lt(toBinArrayIndex);
  }
  /**
   * The `syncWithMarketPrice` function is used to sync the liquidity pool with the market price.
   * @param
   *    - `marketPrice`: The market price to sync with.
   *    - `owner`: The public key of the owner of the liquidity pool.
   * @returns {Promise<Transaction>}
   */
  async syncWithMarketPrice(marketPrice, owner) {
    const marketPriceBinId = this.getBinIdFromPrice(
      Number(
        DLMM.getPricePerLamport(
          this.tokenX.mint.decimals,
          this.tokenY.mint.decimals,
          marketPrice
        )
      ),
      false
    );
    const activeBin = await this.getActiveBin();
    const activeBinId = activeBin.binId;
    if (!this.canSyncWithMarketPrice(marketPrice, activeBinId)) {
      throw new Error(
        "Unable to sync with market price due to bin with liquidity between current and market price bin"
      );
    }
    const fromBinArrayIndex = binIdToBinArrayIndex(new BN13(activeBinId));
    const swapForY = marketPriceBinId < activeBinId;
    const toBinArrayIndex = findNextBinArrayIndexWithLiquidity(
      swapForY,
      new BN13(activeBinId),
      this.lbPair,
      this.binArrayBitmapExtension?.account ?? null
    );
    const marketPriceBinArrayIndex = binIdToBinArrayIndex(
      new BN13(marketPriceBinId)
    );
    const accountsToFetch = [];
    const binArrayBitMapExtensionPubkey = isOverflowDefaultBinArrayBitmap(
      new BN13(marketPriceBinArrayIndex)
    ) ? deriveBinArrayBitmapExtension(this.pubkey, this.program.programId)[0] : null;
    binArrayBitMapExtensionPubkey && accountsToFetch.push(binArrayBitMapExtensionPubkey);
    const [fromBinArrayPubkey] = deriveBinArray(
      this.pubkey,
      fromBinArrayIndex,
      this.program.programId
    );
    accountsToFetch.push(fromBinArrayPubkey);
    const toBinArrayPubkey = (() => {
      if (!toBinArrayIndex)
        return null;
      const [toBinArrayPubkey2] = deriveBinArray(
        this.pubkey,
        toBinArrayIndex,
        this.program.programId
      );
      accountsToFetch.push(toBinArrayPubkey2);
      return toBinArrayPubkey2;
    })();
    const binArrayAccounts = await this.program.provider.connection.getMultipleAccountsInfo(
      accountsToFetch
    );
    const preInstructions = [];
    let fromBinArray = null;
    let toBinArray = null;
    let binArrayBitmapExtension = null;
    if (binArrayBitMapExtensionPubkey) {
      binArrayBitmapExtension = binArrayBitMapExtensionPubkey;
      if (!binArrayAccounts?.[0]) {
        const initializeBitmapExtensionIx = await this.program.methods.initializeBinArrayBitmapExtension().accounts({
          binArrayBitmapExtension: binArrayBitMapExtensionPubkey,
          funder: owner,
          lbPair: this.pubkey
        }).instruction();
        preInstructions.push(initializeBitmapExtensionIx);
      }
    }
    if (!!binArrayAccounts?.[1]) {
      fromBinArray = fromBinArrayPubkey;
    }
    if (!!binArrayAccounts?.[2] && !!toBinArrayIndex) {
      toBinArray = toBinArrayPubkey;
    }
    const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
    const syncWithMarketPriceTx = await this.program.methods.goToABin(marketPriceBinId).accounts({
      lbPair: this.pubkey,
      binArrayBitmapExtension,
      fromBinArray,
      toBinArray
    }).preInstructions(preInstructions).transaction();
    return new Transaction({
      feePayer: owner,
      blockhash,
      lastValidBlockHeight
    }).add(syncWithMarketPriceTx);
  }
  async getMaxPriceInBinArrays(binArrayAccounts) {
    const sortedBinArrays = [...binArrayAccounts].sort(
      ({ account: { index: indexA } }, { account: { index: indexB } }) => indexA.toNumber() - indexB.toNumber()
    );
    let count = sortedBinArrays.length - 1;
    let binPriceWithLastLiquidity;
    while (count >= 0) {
      const binArray = sortedBinArrays[count];
      if (binArray) {
        const bins = binArray.account.bins;
        if (bins.every(({ amountX }) => amountX.isZero())) {
          count--;
        } else {
          const lastBinWithLiquidityIndex = bins.findLastIndex(
            ({ amountX }) => !amountX.isZero()
          );
          binPriceWithLastLiquidity = bins[lastBinWithLiquidityIndex].price.toString();
          count = -1;
        }
      }
    }
    return this.fromPricePerLamport(
      Number(binPriceWithLastLiquidity) / (2 ** 64 - 1)
    );
  }
  /**
   *
   * @param swapInitiator Address of the swap initiator
   * @returns
   */
  isSwapDisabled(swapInitiator) {
    if (this.lbPair.status == 1 /* Disabled */) {
      return true;
    }
    if (this.lbPair.pairType == 1 /* Permissioned */) {
      const currentPoint = this.lbPair.activationType == 0 /* Slot */ ? this.clock.slot : this.clock.unixTimestamp;
      const preActivationSwapPoint = this.lbPair.activationPoint.sub(
        this.lbPair.preActivationDuration
      );
      const activationPoint = !this.lbPair.preActivationSwapAddress.equals(PublicKey9.default) && this.lbPair.preActivationSwapAddress.equals(swapInitiator) ? preActivationSwapPoint : this.lbPair.activationPoint;
      if (currentPoint < activationPoint) {
        return true;
      }
    }
    return false;
  }
  /** Private static method */
  static async getBinArrays(program, lbPairPubkey) {
    return program.account.binArray.all([binArrayLbPairFilter(lbPairPubkey)]);
  }
  static async processPosition(program, lbPair, clock, position, baseMint, quoteMint, rewardMint0, rewardMint1, binArrayMap) {
    const lbPairKey = position.lbPair();
    const lowerBinId = position.lowerBinId();
    const upperBinId = position.upperBinId();
    const posShares = position.liquidityShares();
    const lastUpdatedAt = position.lastUpdatedAt();
    const feeInfos = position.feeInfos();
    const totalClaimedFeeXAmount = position.totalClaimedFeeXAmount();
    const totalClaimedFeeYAmount = position.totalClaimedFeeYAmount();
    const positionRewardInfos = position.rewardInfos();
    const feeOwner = position.feeOwner();
    const bins = this.getBinsBetweenLowerAndUpperBound(
      lbPairKey,
      lbPair,
      lowerBinId.toNumber(),
      upperBinId.toNumber(),
      baseMint.decimals,
      quoteMint.decimals,
      binArrayMap,
      program.programId
    );
    if (!bins.length)
      return null;
    const positionData = [];
    let totalXAmount = new Decimal5(0);
    let totalYAmount = new Decimal5(0);
    const ZERO = new BN13(0);
    let feeX = ZERO;
    let feeY = ZERO;
    let rewards = [ZERO, ZERO];
    bins.forEach((bin, idx) => {
      const binSupply = bin.supply;
      const posShare = posShares[idx];
      const posBinRewardInfo = positionRewardInfos[idx];
      const positionXAmount = binSupply.eq(ZERO) ? ZERO : posShare.mul(bin.xAmount).div(binSupply);
      const positionYAmount = binSupply.eq(ZERO) ? ZERO : posShare.mul(bin.yAmount).div(binSupply);
      totalXAmount = totalXAmount.add(new Decimal5(positionXAmount.toString()));
      totalYAmount = totalYAmount.add(new Decimal5(positionYAmount.toString()));
      const feeInfo = feeInfos[idx];
      const newFeeX = mulShr(
        posShares[idx].shrn(SCALE_OFFSET),
        bin.feeAmountXPerTokenStored.sub(feeInfo.feeXPerTokenComplete),
        SCALE_OFFSET,
        1 /* Down */
      );
      const newFeeY = mulShr(
        posShares[idx].shrn(SCALE_OFFSET),
        bin.feeAmountYPerTokenStored.sub(feeInfo.feeYPerTokenComplete),
        SCALE_OFFSET,
        1 /* Down */
      );
      const claimableFeeX = newFeeX.add(feeInfo.feeXPending);
      const claimableFeeY = newFeeY.add(feeInfo.feeYPending);
      feeX = feeX.add(claimableFeeX);
      feeY = feeY.add(claimableFeeY);
      const claimableRewardsInBin = [new BN13(0), new BN13(0)];
      for (let j = 0; j < claimableRewardsInBin.length; j++) {
        const pairRewardInfo = lbPair.rewardInfos[j];
        if (!pairRewardInfo.mint.equals(PublicKey9.default)) {
          let rewardPerTokenStored = bin.rewardPerTokenStored[j];
          if (bin.binId == lbPair.activeId && !bin.supply.isZero()) {
            const currentTime = new BN13(
              Math.min(
                clock.unixTimestamp.toNumber(),
                pairRewardInfo.rewardDurationEnd.toNumber()
              )
            );
            const delta2 = currentTime.sub(pairRewardInfo.lastUpdateTime);
            const liquiditySupply = bin.supply.shrn(SCALE_OFFSET);
            const rewardPerTokenStoredDelta = pairRewardInfo.rewardRate.mul(delta2).div(new BN13(15)).div(liquiditySupply);
            rewardPerTokenStored = rewardPerTokenStored.add(
              rewardPerTokenStoredDelta
            );
          }
          const delta = rewardPerTokenStored.sub(
            posBinRewardInfo.rewardPerTokenCompletes[j]
          );
          const newReward = mulShr(
            delta,
            posShares[idx].shrn(SCALE_OFFSET),
            SCALE_OFFSET,
            1 /* Down */
          );
          const claimableReward = newReward.add(
            posBinRewardInfo.rewardPendings[j]
          );
          claimableRewardsInBin[j] = claimableRewardsInBin[j].add(claimableReward);
          rewards[j] = rewards[j].add(claimableReward);
        }
      }
      positionData.push({
        binId: bin.binId,
        price: bin.price,
        pricePerToken: bin.pricePerToken,
        binXAmount: bin.xAmount.toString(),
        binYAmount: bin.yAmount.toString(),
        binLiquidity: binSupply.toString(),
        positionLiquidity: posShare.toString(),
        positionXAmount: positionXAmount.toString(),
        positionYAmount: positionYAmount.toString(),
        positionFeeXAmount: claimableFeeX.toString(),
        positionFeeYAmount: claimableFeeY.toString(),
        positionRewardAmount: claimableRewardsInBin.map(
          (amount) => amount.toString()
        )
      });
    });
    const currentEpoch = clock.epoch.toNumber();
    const feeXExcludeTransferFee = calculateTransferFeeExcludedAmount(
      feeX,
      baseMint,
      currentEpoch
    ).amount;
    const feeYExcludeTransferFee = calculateTransferFeeExcludedAmount(
      feeY,
      quoteMint,
      currentEpoch
    ).amount;
    const rewardOne = rewards[0];
    const rewardTwo = rewards[1];
    let rewardOneExcludeTransferFee = new BN13(0);
    let rewardTwoExcludeTransferFee = new BN13(0);
    if (rewardMint0) {
      rewardOneExcludeTransferFee = calculateTransferFeeExcludedAmount(
        rewardOne,
        rewardMint0,
        currentEpoch
      ).amount;
    }
    if (rewardMint1) {
      rewardTwoExcludeTransferFee = calculateTransferFeeExcludedAmount(
        rewardTwo,
        rewardMint1,
        currentEpoch
      ).amount;
    }
    const totalXAmountExcludeTransferFee = calculateTransferFeeExcludedAmount(
      new BN13(totalXAmount.floor().toString()),
      baseMint,
      currentEpoch
    ).amount;
    const totalYAmountExcludeTransferFee = calculateTransferFeeExcludedAmount(
      new BN13(totalYAmount.floor().toString()),
      quoteMint,
      currentEpoch
    ).amount;
    return {
      totalXAmount: totalXAmount.toString(),
      totalYAmount: totalYAmount.toString(),
      positionBinData: positionData,
      lastUpdatedAt,
      lowerBinId: lowerBinId.toNumber(),
      upperBinId: upperBinId.toNumber(),
      feeX,
      feeY,
      rewardOne,
      rewardTwo,
      feeOwner,
      totalClaimedFeeXAmount,
      totalClaimedFeeYAmount,
      totalXAmountExcludeTransferFee,
      totalYAmountExcludeTransferFee,
      rewardOneExcludeTransferFee,
      rewardTwoExcludeTransferFee,
      feeXExcludeTransferFee,
      feeYExcludeTransferFee,
      owner: position.owner()
    };
  }
  static getBinsBetweenLowerAndUpperBound(lbPairKey, lbPair, lowerBinId, upperBinId, baseTokenDecimal, quoteTokenDecimal, binArrayMap, programId) {
    const lowerBinArrayIndex = binIdToBinArrayIndex(new BN13(lowerBinId));
    const upperBinArrayIndex = binIdToBinArrayIndex(new BN13(upperBinId));
    let bins = [];
    const ZERO = new BN13(0);
    for (let binArrayIndex = lowerBinArrayIndex.toNumber(); binArrayIndex <= upperBinArrayIndex.toNumber(); binArrayIndex++) {
      const binArrayIndexBN = new BN13(binArrayIndex);
      const binArrayKey = deriveBinArray(
        lbPairKey,
        binArrayIndexBN,
        programId
      )[0];
      const [lowerBinIdForBinArray] = getBinArrayLowerUpperBinId(binArrayIndexBN);
      const binArray = binArrayMap.get(binArrayKey.toBase58());
      for (let i = 0; i < MAX_BIN_ARRAY_SIZE.toNumber(); i++) {
        const binId = lowerBinIdForBinArray.toNumber() + i;
        if (binId >= lowerBinId && binId <= upperBinId) {
          const pricePerLamport = getPriceOfBinByBinId(
            binId,
            lbPair.binStep
          ).toString();
          if (!binArray) {
            bins.push({
              binId,
              xAmount: ZERO,
              yAmount: ZERO,
              supply: ZERO,
              feeAmountXPerTokenStored: ZERO,
              feeAmountYPerTokenStored: ZERO,
              rewardPerTokenStored: [ZERO, ZERO],
              price: pricePerLamport,
              version: binArray.version,
              pricePerToken: new Decimal5(pricePerLamport).mul(new Decimal5(10 ** (baseTokenDecimal - quoteTokenDecimal))).toString()
            });
          } else {
            const bin = binArray.bins[i];
            bins.push({
              binId,
              xAmount: bin.amountX,
              yAmount: bin.amountY,
              supply: bin.liquiditySupply,
              feeAmountXPerTokenStored: bin.feeAmountXPerTokenStored,
              feeAmountYPerTokenStored: bin.feeAmountYPerTokenStored,
              rewardPerTokenStored: bin.rewardPerTokenStored,
              price: pricePerLamport,
              version: binArray.version,
              pricePerToken: new Decimal5(pricePerLamport).mul(new Decimal5(10 ** (baseTokenDecimal - quoteTokenDecimal))).toString()
            });
          }
        }
      }
    }
    return bins;
  }
  /** Private method */
  processXYAmountDistribution(xYAmountDistribution) {
    let currentBinId = null;
    const xAmountDistribution = [];
    const yAmountDistribution = [];
    const binIds = [];
    xYAmountDistribution.forEach((binAndAmount) => {
      xAmountDistribution.push(binAndAmount.xAmountBpsOfTotal);
      yAmountDistribution.push(binAndAmount.yAmountBpsOfTotal);
      binIds.push(binAndAmount.binId);
      if (currentBinId && binAndAmount.binId !== currentBinId + 1) {
        throw new Error("Discontinuous Bin ID");
      } else {
        currentBinId = binAndAmount.binId;
      }
    });
    return {
      lowerBinId: xYAmountDistribution[0].binId,
      upperBinId: xYAmountDistribution[xYAmountDistribution.length - 1].binId,
      xAmountDistribution,
      yAmountDistribution,
      binIds
    };
  }
  async getBins(lbPairPubKey, lowerBinId, upperBinId, baseTokenDecimal, quoteTokenDecimal, lowerBinArray, upperBinArray) {
    const lowerBinArrayIndex = binIdToBinArrayIndex(new BN13(lowerBinId));
    const upperBinArrayIndex = binIdToBinArrayIndex(new BN13(upperBinId));
    const hasCachedLowerBinArray = lowerBinArray != null;
    const hasCachedUpperBinArray = upperBinArray != null;
    const isSingleBinArray = lowerBinArrayIndex.eq(upperBinArrayIndex);
    const lowerBinArrayIndexOffset = hasCachedLowerBinArray ? 1 : 0;
    const upperBinArrayIndexOffset = hasCachedUpperBinArray ? -1 : 0;
    const binArrayPubkeys = range(
      lowerBinArrayIndex.toNumber() + lowerBinArrayIndexOffset,
      upperBinArrayIndex.toNumber() + upperBinArrayIndexOffset,
      (i) => deriveBinArray(lbPairPubKey, new BN13(i), this.program.programId)[0]
    );
    const fetchedBinArrays = binArrayPubkeys.length !== 0 ? await this.program.account.binArray.fetchMultiple(binArrayPubkeys) : [];
    const binArrays = [
      ...hasCachedLowerBinArray ? [lowerBinArray] : [],
      ...fetchedBinArrays,
      ...hasCachedUpperBinArray && !isSingleBinArray ? [upperBinArray] : []
    ];
    const binsById = new Map(
      binArrays.filter((x) => x != null).flatMap(({ bins, index }) => {
        const [lowerBinId2] = getBinArrayLowerUpperBinId(index);
        return bins.map(
          (b, i) => [lowerBinId2.toNumber() + i, b]
        );
      })
    );
    const version = binArrays.find((binArray) => binArray != null)?.version ?? 1;
    return Array.from(
      enumerateBins(
        binsById,
        lowerBinId,
        upperBinId,
        this.lbPair.binStep,
        baseTokenDecimal,
        quoteTokenDecimal,
        version
      )
    );
  }
  async binArraysToBeCreate(lowerBinArrayIndex, upperBinArrayIndex) {
    const binArrayIndexes = Array.from(
      { length: upperBinArrayIndex.sub(lowerBinArrayIndex).toNumber() + 1 },
      (_, index) => index + lowerBinArrayIndex.toNumber()
    ).map((idx) => new BN13(idx));
    const binArrays = [];
    for (const idx of binArrayIndexes) {
      const [binArrayPubKey] = deriveBinArray(
        this.pubkey,
        idx,
        this.program.programId
      );
      binArrays.push(binArrayPubKey);
    }
    const binArrayAccounts = await this.program.provider.connection.getMultipleAccountsInfo(binArrays);
    return binArrayAccounts.filter((binArray) => binArray === null).map((_, index) => binArrays[index]);
  }
  async createBinArraysIfNeeded(binArrayIndexes, funder) {
    const ixs = [];
    for (const idx of binArrayIndexes) {
      const [binArrayKey] = deriveBinArray(
        this.pubkey,
        idx,
        this.program.programId
      );
      const binArrayAccount = await this.program.provider.connection.getAccountInfo(binArrayKey);
      if (binArrayAccount === null) {
        ixs.push(
          await this.program.methods.initializeBinArray(idx).accounts({
            binArray: binArrayKey,
            funder,
            lbPair: this.pubkey
          }).instruction()
        );
      }
    }
    return ixs;
  }
  updateVolatilityAccumulator(vParameter, sParameter, activeId) {
    const deltaId = Math.abs(vParameter.indexReference - activeId);
    const newVolatilityAccumulator = vParameter.volatilityReference + deltaId * BASIS_POINT_MAX;
    vParameter.volatilityAccumulator = Math.min(
      newVolatilityAccumulator,
      sParameter.maxVolatilityAccumulator
    );
  }
  updateReference(activeId, vParameter, sParameter, currentTimestamp) {
    const elapsed = currentTimestamp - vParameter.lastUpdateTimestamp.toNumber();
    if (elapsed >= sParameter.filterPeriod) {
      vParameter.indexReference = activeId;
      if (elapsed < sParameter.decayPeriod) {
        const decayedVolatilityReference = Math.floor(
          vParameter.volatilityAccumulator * sParameter.reductionFactor / BASIS_POINT_MAX
        );
        vParameter.volatilityReference = decayedVolatilityReference;
      } else {
        vParameter.volatilityReference = 0;
      }
    }
  }
  async createClaimBuildMethod({
    owner,
    position
  }) {
    const maybeClaimableBinRange = getPositionLowerUpperBinIdWithLiquidity(
      position.positionData
    );
    if (!maybeClaimableBinRange)
      return;
    const { lowerBinId, upperBinId } = maybeClaimableBinRange;
    const binArrayAccountsMeta = getBinArrayAccountMetasCoverage(
      lowerBinId,
      upperBinId,
      this.pubkey,
      this.program.programId
    );
    const claimTransactions = [];
    for (let i = 0; i < 2; i++) {
      const rewardInfo = this.lbPair.rewardInfos[i];
      if (!rewardInfo || rewardInfo.mint.equals(PublicKey9.default))
        continue;
      const preInstructions = [];
      const { ataPubKey, ix } = await getOrCreateATAInstruction(
        this.program.provider.connection,
        rewardInfo.mint,
        owner,
        this.rewards[i].owner
      );
      ix && preInstructions.push(ix);
      const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(1 /* Reward */, i);
      const claimTransaction = await this.program.methods.claimReward2(new BN13(i), lowerBinId.toNumber(), upperBinId.toNumber(), {
        slices
      }).accounts({
        lbPair: this.pubkey,
        sender: owner,
        position: position.publicKey,
        rewardVault: rewardInfo.vault,
        rewardMint: rewardInfo.mint,
        tokenProgram: this.rewards[i].owner,
        userTokenAccount: ataPubKey,
        memoProgram: MEMO_PROGRAM_ID
      }).remainingAccounts(transferHookAccounts).remainingAccounts(binArrayAccountsMeta).preInstructions(preInstructions).transaction();
      claimTransactions.push(claimTransaction);
    }
    return claimTransactions;
  }
  async createClaimSwapFeeMethod({
    owner,
    position
  }) {
    const maybeClaimableBinRange = getPositionLowerUpperBinIdWithLiquidity(
      position.positionData
    );
    if (!maybeClaimableBinRange)
      return;
    const { lowerBinId, upperBinId } = maybeClaimableBinRange;
    const binArrayAccountsMeta = getBinArrayAccountMetasCoverage(
      lowerBinId,
      upperBinId,
      this.pubkey,
      this.program.programId
    );
    const { feeOwner } = position.positionData;
    const walletToReceiveFee = feeOwner.equals(PublicKey9.default) ? owner : feeOwner;
    const preInstructions = [];
    const [
      { ataPubKey: userTokenX, ix: createInTokenAccountIx },
      { ataPubKey: userTokenY, ix: createOutTokenAccountIx }
    ] = await Promise.all([
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenX.publicKey,
        walletToReceiveFee,
        this.tokenX.owner,
        owner
      ),
      getOrCreateATAInstruction(
        this.program.provider.connection,
        this.tokenY.publicKey,
        walletToReceiveFee,
        this.tokenY.owner,
        owner
      )
    ]);
    createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
    createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
    const postInstructions = [];
    if ([
      this.tokenX.publicKey.toBase58(),
      this.tokenY.publicKey.toBase58()
    ].includes(NATIVE_MINT2.toBase58())) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(owner);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }
    const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(0 /* Liquidity */);
    const claimFeeTx = await this.program.methods.claimFee2(lowerBinId.toNumber(), upperBinId.toNumber(), {
      slices
    }).accounts({
      lbPair: this.pubkey,
      sender: owner,
      position: position.publicKey,
      reserveX: this.lbPair.reserveX,
      reserveY: this.lbPair.reserveY,
      tokenProgramX: this.tokenX.owner,
      tokenProgramY: this.tokenY.owner,
      tokenXMint: this.tokenX.publicKey,
      tokenYMint: this.tokenY.publicKey,
      userTokenX,
      userTokenY,
      memoProgram: MEMO_PROGRAM_ID
    }).remainingAccounts(transferHookAccounts).remainingAccounts(binArrayAccountsMeta).preInstructions(preInstructions).postInstructions(postInstructions).transaction();
    return claimFeeTx;
  }
  getPotentialToken2022IxDataAndAccounts(actionType, rewardIndex) {
    if (actionType == 0 /* Liquidity */) {
      return {
        slices: [
          {
            accountsType: {
              transferHookX: {}
            },
            length: this.tokenX.transferHookAccountMetas.length
          },
          {
            accountsType: {
              transferHookY: {}
            },
            length: this.tokenY.transferHookAccountMetas.length
          }
        ],
        accounts: this.tokenX.transferHookAccountMetas.concat(
          this.tokenY.transferHookAccountMetas
        )
      };
    }
    return {
      slices: [
        {
          accountsType: {
            transferHookReward: {}
          },
          length: this.rewards[rewardIndex].transferHookAccountMetas.length
        }
      ],
      accounts: this.rewards[rewardIndex].transferHookAccountMetas
    };
  }
};

// src/index.ts
var src_default = DLMM;
export {
  ADMIN,
  ActionType,
  ActivationType,
  BASIS_POINT_MAX,
  BIN_ARRAY_BITMAP_SIZE,
  BIN_ARRAY_FEE,
  BinLiquidity,
  BitmapType,
  ClockLayout,
  DLMMError,
  DlmmSdkError,
  EXTENSION_BINARRAY_BITMAP_SIZE,
  FEE_PRECISION,
  IDL,
  ILM_BASE,
  LBCLMM_PROGRAM_IDS,
  MAX_ACTIVE_BIN_SLIPPAGE,
  MAX_BIN_ARRAY_SIZE,
  MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX,
  MAX_BIN_PER_POSITION,
  MAX_BIN_PER_TX,
  MAX_CLAIM_ALL_ALLOWED,
  MAX_EXTRA_BIN_ARRAYS,
  MAX_FEE_RATE,
  MEMO_PROGRAM_ID,
  Network,
  POSITION_FEE,
  POSITION_V2_DISC,
  PRECISION,
  PairStatus,
  PairType,
  PositionVersion,
  SCALE,
  SCALE_OFFSET,
  SIMULATION_USER,
  Strategy,
  StrategyType,
  U64_MAX,
  autoFillXByStrategy,
  autoFillXByWeight,
  autoFillYByStrategy,
  autoFillYByWeight,
  binIdToBinArrayIndex,
  calculateBidAskDistribution,
  calculateNormalDistribution,
  calculateSpotDistribution,
  chunkedFetchMultipleBinArrayBitmapExtensionAccount,
  chunkedFetchMultiplePoolAccount,
  chunkedGetMultipleAccountInfos,
  chunks,
  computeFee,
  computeFeeFromAmount,
  computeProtocolFee,
  src_default as default,
  deriveBinArray,
  deriveBinArrayBitmapExtension,
  deriveCustomizablePermissionlessLbPair,
  deriveEventAuthority,
  deriveLbPair,
  deriveLbPair2,
  deriveLbPairWithPresetParamWithIndexKey,
  deriveOracle,
  derivePermissionLbPair,
  derivePosition,
  derivePresetParameter,
  derivePresetParameter2,
  derivePresetParameterWithIndex,
  deriveReserve,
  deriveRewardVault,
  deriveTokenBadge,
  enumerateBins,
  findNextBinArrayIndexWithLiquidity,
  findNextBinArrayWithLiquidity,
  fromWeightDistributionToAmount,
  fromWeightDistributionToAmountOneSide,
  getBaseFee,
  getBinArrayLowerUpperBinId,
  getBinArraysRequiredByPositionRange,
  getBinFromBinArray,
  getEstimatedComputeUnitIxWithBuffer,
  getEstimatedComputeUnitUsageWithBuffer,
  getOrCreateATAInstruction,
  getOutAmount,
  getPriceOfBinByBinId,
  getTokenBalance,
  getTokenDecimals,
  getTokenProgramId,
  getTokensMintFromPoolAddress,
  getTotalFee,
  getVariableFee,
  isBinIdWithinBinArray,
  isOverflowDefaultBinArrayBitmap,
  parseLogs,
  range,
  swapExactInQuoteAtBin,
  swapExactOutQuoteAtBin,
  toAmountAskSide,
  toAmountBidSide,
  toAmountBothSide,
  toAmountsBothSideByStrategy,
  toStrategyParameters,
  toWeightDistribution,
  unwrapSOLInstruction,
  wrapSOLInstruction
};
//# sourceMappingURL=index.mjs.map