import * as _coral_xyz_anchor from '@coral-xyz/anchor';
import { BN, Program, IdlAccounts, ProgramAccount, IdlTypes, EventParser } from '@coral-xyz/anchor';
import * as _solana_web3_js from '@solana/web3.js';
import { PublicKey, AccountMeta, TransactionInstruction, Connection, Transaction, Cluster } from '@solana/web3.js';
import Decimal from 'decimal.js';
import { Mint } from '@solana/spl-token';

type LbClmm = {
    "version": "0.9.0";
    "name": "lb_clmm";
    "constants": [
        {
            "name": "BASIS_POINT_MAX";
            "type": "i32";
            "value": "10000";
        },
        {
            "name": "MAX_BIN_PER_ARRAY";
            "type": {
                "defined": "usize";
            };
            "value": "70";
        },
        {
            "name": "MAX_BIN_PER_POSITION";
            "type": {
                "defined": "usize";
            };
            "value": "70";
        },
        {
            "name": "MAX_RESIZE_LENGTH";
            "type": {
                "defined": "usize";
            };
            "value": "70";
        },
        {
            "name": "POSITION_MAX_LENGTH";
            "type": {
                "defined": "usize";
            };
            "value": "1400";
        },
        {
            "name": "MIN_BIN_ID";
            "type": "i32";
            "value": "- 443636";
        },
        {
            "name": "MAX_BIN_ID";
            "type": "i32";
            "value": "443636";
        },
        {
            "name": "MAX_FEE_RATE";
            "type": "u64";
            "value": "100_000_000";
        },
        {
            "name": "FEE_PRECISION";
            "type": "u64";
            "value": "1_000_000_000";
        },
        {
            "name": "MAX_PROTOCOL_SHARE";
            "type": "u16";
            "value": "2_500";
        },
        {
            "name": "HOST_FEE_BPS";
            "type": "u16";
            "value": "2_000";
        },
        {
            "name": "NUM_REWARDS";
            "type": {
                "defined": "usize";
            };
            "value": "2";
        },
        {
            "name": "MIN_REWARD_DURATION";
            "type": "u64";
            "value": "1";
        },
        {
            "name": "MAX_REWARD_DURATION";
            "type": "u64";
            "value": "31536000";
        },
        {
            "name": "EXTENSION_BINARRAY_BITMAP_SIZE";
            "type": {
                "defined": "usize";
            };
            "value": "12";
        },
        {
            "name": "BIN_ARRAY_BITMAP_SIZE";
            "type": "i32";
            "value": "512";
        },
        {
            "name": "MAX_REWARD_BIN_SPLIT";
            "type": {
                "defined": "usize";
            };
            "value": "15";
        },
        {
            "name": "ILM_PROTOCOL_SHARE";
            "type": "u16";
            "value": "2000";
        },
        {
            "name": "PROTOCOL_SHARE";
            "type": "u16";
            "value": "500";
        },
        {
            "name": "MAX_BIN_STEP";
            "type": "u16";
            "value": "400";
        },
        {
            "name": "MAX_BASE_FEE";
            "type": "u128";
            "value": "100_000_000";
        },
        {
            "name": "MIN_BASE_FEE";
            "type": "u128";
            "value": "100_000";
        },
        {
            "name": "MINIMUM_LIQUIDITY";
            "type": "u128";
            "value": "1_000_000";
        },
        {
            "name": "BIN_ARRAY";
            "type": "bytes";
            "value": "[98, 105, 110, 95, 97, 114, 114, 97, 121]";
        },
        {
            "name": "ORACLE";
            "type": "bytes";
            "value": "[111, 114, 97, 99, 108, 101]";
        },
        {
            "name": "BIN_ARRAY_BITMAP_SEED";
            "type": "bytes";
            "value": "[98, 105, 116, 109, 97, 112]";
        },
        {
            "name": "PRESET_PARAMETER";
            "type": "bytes";
            "value": "[112, 114, 101, 115, 101, 116, 95, 112, 97, 114, 97, 109, 101, 116, 101, 114]";
        },
        {
            "name": "PRESET_PARAMETER2";
            "type": "bytes";
            "value": "[112, 114, 101, 115, 101, 116, 95, 112, 97, 114, 97, 109, 101, 116, 101, 114, 50]";
        },
        {
            "name": "POSITION";
            "type": "bytes";
            "value": "[112, 111, 115, 105, 116, 105, 111, 110]";
        },
        {
            "name": "CLAIM_PROTOCOL_FEE_OPERATOR";
            "type": "bytes";
            "value": "[99, 102, 95, 111, 112, 101, 114, 97, 116, 111, 114]";
        }
    ];
    "instructions": [
        {
            "name": "initializeLbPair";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenMintX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenMintY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "presetParameter";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "funder";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "rent";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "activeId";
                    "type": "i32";
                },
                {
                    "name": "binStep";
                    "type": "u16";
                }
            ];
        },
        {
            "name": "initializePermissionLbPair";
            "accounts": [
                {
                    "name": "base";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenMintX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenMintY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "tokenBadgeX";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenBadgeY";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenProgramX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgramY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "rent";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "ixData";
                    "type": {
                        "defined": "InitPermissionPairIx";
                    };
                }
            ];
        },
        {
            "name": "initializeCustomizablePermissionlessLbPair";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenMintX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenMintY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "funder";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "params";
                    "type": {
                        "defined": "CustomizableParams";
                    };
                }
            ];
        },
        {
            "name": "initializeBinArrayBitmapExtension";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "docs": [
                        "Initialize an account to store if a bin array is initialized."
                    ];
                },
                {
                    "name": "funder";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "rent";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "initializeBinArray";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArray";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "funder";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "index";
                    "type": "i64";
                }
            ];
        },
        {
            "name": "addLiquidity";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "liquidityParameter";
                    "type": {
                        "defined": "LiquidityParameter";
                    };
                }
            ];
        },
        {
            "name": "addLiquidityByWeight";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "liquidityParameter";
                    "type": {
                        "defined": "LiquidityParameterByWeight";
                    };
                }
            ];
        },
        {
            "name": "addLiquidityByStrategy";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "liquidityParameter";
                    "type": {
                        "defined": "LiquidityParameterByStrategy";
                    };
                }
            ];
        },
        {
            "name": "addLiquidityByStrategyOneSide";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userToken";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserve";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "liquidityParameter";
                    "type": {
                        "defined": "LiquidityParameterByStrategyOneSide";
                    };
                }
            ];
        },
        {
            "name": "addLiquidityOneSide";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userToken";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserve";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "liquidityParameter";
                    "type": {
                        "defined": "LiquidityOneSideParameter";
                    };
                }
            ];
        },
        {
            "name": "removeLiquidity";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "binLiquidityRemoval";
                    "type": {
                        "vec": {
                            "defined": "BinLiquidityReduction";
                        };
                    };
                }
            ];
        },
        {
            "name": "initializePosition";
            "accounts": [
                {
                    "name": "payer";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "lbPair";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "owner";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "rent";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "lowerBinId";
                    "type": "i32";
                },
                {
                    "name": "width";
                    "type": "i32";
                }
            ];
        },
        {
            "name": "initializePositionPda";
            "accounts": [
                {
                    "name": "payer";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "base";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "owner";
                    "isMut": false;
                    "isSigner": true;
                    "docs": [
                        "owner"
                    ];
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "rent";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "lowerBinId";
                    "type": "i32";
                },
                {
                    "name": "width";
                    "type": "i32";
                }
            ];
        },
        {
            "name": "initializePositionByOperator";
            "accounts": [
                {
                    "name": "payer";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "base";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "owner";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "operator";
                    "isMut": false;
                    "isSigner": true;
                    "docs": [
                        "operator"
                    ];
                },
                {
                    "name": "operatorTokenX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "ownerTokenX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "lowerBinId";
                    "type": "i32";
                },
                {
                    "name": "width";
                    "type": "i32";
                },
                {
                    "name": "feeOwner";
                    "type": "publicKey";
                },
                {
                    "name": "lockReleasePoint";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "updatePositionOperator";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "owner";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "operator";
                    "type": "publicKey";
                }
            ];
        },
        {
            "name": "swap";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenIn";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenOut";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "hostFeeIn";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "user";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "amountIn";
                    "type": "u64";
                },
                {
                    "name": "minAmountOut";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "swapExactOut";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenIn";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenOut";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "hostFeeIn";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "user";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "maxInAmount";
                    "type": "u64";
                },
                {
                    "name": "outAmount";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "swapWithPriceImpact";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenIn";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenOut";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "hostFeeIn";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "user";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "amountIn";
                    "type": "u64";
                },
                {
                    "name": "activeId";
                    "type": {
                        "option": "i32";
                    };
                },
                {
                    "name": "maxPriceImpactBps";
                    "type": "u16";
                }
            ];
        },
        {
            "name": "withdrawProtocolFee";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "receiverTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "receiverTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "claimFeeOperator";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "operator";
                    "isMut": false;
                    "isSigner": true;
                    "docs": [
                        "operator"
                    ];
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "memoProgram";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "amountX";
                    "type": "u64";
                },
                {
                    "name": "amountY";
                    "type": "u64";
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "initializeReward";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "rewardVault";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "rewardMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenBadge";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "admin";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "rent";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "rewardIndex";
                    "type": "u64";
                },
                {
                    "name": "rewardDuration";
                    "type": "u64";
                },
                {
                    "name": "funder";
                    "type": "publicKey";
                }
            ];
        },
        {
            "name": "fundReward";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "rewardVault";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "rewardMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "funderTokenAccount";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "funder";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "binArray";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "rewardIndex";
                    "type": "u64";
                },
                {
                    "name": "amount";
                    "type": "u64";
                },
                {
                    "name": "carryForward";
                    "type": "bool";
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "updateRewardFunder";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "rewardIndex";
                    "type": "u64";
                },
                {
                    "name": "newFunder";
                    "type": "publicKey";
                }
            ];
        },
        {
            "name": "updateRewardDuration";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "binArray";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "rewardIndex";
                    "type": "u64";
                },
                {
                    "name": "newDuration";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "claimReward";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "rewardVault";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "rewardMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "userTokenAccount";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "rewardIndex";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "claimFee";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "closePosition";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "rentReceiver";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "updateBaseFeeParameters";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "feeParameter";
                    "type": {
                        "defined": "BaseFeeParameter";
                    };
                }
            ];
        },
        {
            "name": "updateDynamicFeeParameters";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "feeParameter";
                    "type": {
                        "defined": "DynamicFeeParameter";
                    };
                }
            ];
        },
        {
            "name": "increaseOracleLength";
            "accounts": [
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "funder";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "lengthToAdd";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "initializePresetParameter";
            "accounts": [
                {
                    "name": "presetParameter";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "rent";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "ix";
                    "type": {
                        "defined": "InitPresetParametersIx";
                    };
                }
            ];
        },
        {
            "name": "closePresetParameter";
            "accounts": [
                {
                    "name": "presetParameter";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "rentReceiver";
                    "isMut": true;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "closePresetParameter2";
            "accounts": [
                {
                    "name": "presetParameter";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "rentReceiver";
                    "isMut": true;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "removeAllLiquidity";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "setPairStatus";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": false;
                    "isSigner": true;
                }
            ];
            "args": [
                {
                    "name": "status";
                    "type": "u8";
                }
            ];
        },
        {
            "name": "migratePosition";
            "accounts": [
                {
                    "name": "positionV2";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "positionV1";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "owner";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "rentReceiver";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "migrateBinArray";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "updateFeesAndRewards";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "owner";
                    "isMut": false;
                    "isSigner": true;
                }
            ];
            "args": [];
        },
        {
            "name": "withdrawIneligibleReward";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "rewardVault";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "rewardMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "funderTokenAccount";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "funder";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "binArray";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "memoProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "rewardIndex";
                    "type": "u64";
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "setActivationPoint";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": true;
                    "isSigner": true;
                }
            ];
            "args": [
                {
                    "name": "activationPoint";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "removeLiquidityByRange";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "fromBinId";
                    "type": "i32";
                },
                {
                    "name": "toBinId";
                    "type": "i32";
                },
                {
                    "name": "bpsToRemove";
                    "type": "u16";
                }
            ];
        },
        {
            "name": "addLiquidityOneSidePrecise";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userToken";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserve";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "binArrayLower";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayUpper";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "parameter";
                    "type": {
                        "defined": "AddLiquiditySingleSidePreciseParameter";
                    };
                }
            ];
        },
        {
            "name": "goToABin";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "fromBinArray";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "toBinArray";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "binId";
                    "type": "i32";
                }
            ];
        },
        {
            "name": "setPreActivationDuration";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "creator";
                    "isMut": false;
                    "isSigner": true;
                }
            ];
            "args": [
                {
                    "name": "preActivationDuration";
                    "type": "u64";
                }
            ];
        },
        {
            "name": "setPreActivationSwapAddress";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "creator";
                    "isMut": false;
                    "isSigner": true;
                }
            ];
            "args": [
                {
                    "name": "preActivationSwapAddress";
                    "type": "publicKey";
                }
            ];
        },
        {
            "name": "setPairStatusPermissionless";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "creator";
                    "isMut": false;
                    "isSigner": true;
                }
            ];
            "args": [
                {
                    "name": "status";
                    "type": "u8";
                }
            ];
        },
        {
            "name": "initializeTokenBadge";
            "accounts": [
                {
                    "name": "tokenMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenBadge";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "createClaimProtocolFeeOperator";
            "accounts": [
                {
                    "name": "claimFeeOperator";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "operator";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "closeClaimProtocolFeeOperator";
            "accounts": [
                {
                    "name": "claimFeeOperator";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "rentReceiver";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": false;
                    "isSigner": true;
                }
            ];
            "args": [];
        },
        {
            "name": "initializePresetParameter2";
            "accounts": [
                {
                    "name": "presetParameter";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "admin";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "ix";
                    "type": {
                        "defined": "InitPresetParameters2Ix";
                    };
                }
            ];
        },
        {
            "name": "initializeLbPair2";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenMintX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenMintY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "presetParameter";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "funder";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "tokenBadgeX";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenBadgeY";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenProgramX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgramY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "params";
                    "type": {
                        "defined": "InitializeLbPair2Params";
                    };
                }
            ];
        },
        {
            "name": "initializeCustomizablePermissionlessLbPair2";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenMintX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenMintY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "funder";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "tokenBadgeX";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenBadgeY";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "tokenProgramX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgramY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "systemProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "params";
                    "type": {
                        "defined": "CustomizableParams";
                    };
                }
            ];
        },
        {
            "name": "claimFee2";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgramX";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgramY";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "memoProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "minBinId";
                    "type": "i32";
                },
                {
                    "name": "maxBinId";
                    "type": "i32";
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "claimReward2";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "rewardVault";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "rewardMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "userTokenAccount";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "memoProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "rewardIndex";
                    "type": "u64";
                },
                {
                    "name": "minBinId";
                    "type": "i32";
                },
                {
                    "name": "maxBinId";
                    "type": "i32";
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "addLiquidity2";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "liquidityParameter";
                    "type": {
                        "defined": "LiquidityParameter";
                    };
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "addLiquidityByStrategy2";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "liquidityParameter";
                    "type": {
                        "defined": "LiquidityParameterByStrategy";
                    };
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "addLiquidityOneSidePrecise2";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userToken";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserve";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "liquidityParameter";
                    "type": {
                        "defined": "AddLiquiditySingleSidePreciseParameter2";
                    };
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "removeLiquidity2";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "memoProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "binLiquidityRemoval";
                    "type": {
                        "vec": {
                            "defined": "BinLiquidityReduction";
                        };
                    };
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "removeLiquidityByRange2";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "userTokenX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "memoProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "fromBinId";
                    "type": "i32";
                },
                {
                    "name": "toBinId";
                    "type": "i32";
                },
                {
                    "name": "bpsToRemove";
                    "type": "u16";
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "swap2";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenIn";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenOut";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "hostFeeIn";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "user";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "memoProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "amountIn";
                    "type": "u64";
                },
                {
                    "name": "minAmountOut";
                    "type": "u64";
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "swapExactOut2";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenIn";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenOut";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "hostFeeIn";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "user";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "memoProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "maxInAmount";
                    "type": "u64";
                },
                {
                    "name": "outAmount";
                    "type": "u64";
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "swapWithPriceImpact2";
            "accounts": [
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "binArrayBitmapExtension";
                    "isMut": false;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "reserveX";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "reserveY";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenIn";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "userTokenOut";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenXMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYMint";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "oracle";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "hostFeeIn";
                    "isMut": true;
                    "isSigner": false;
                    "isOptional": true;
                },
                {
                    "name": "user";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "tokenXProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "tokenYProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "memoProgram";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "amountIn";
                    "type": "u64";
                },
                {
                    "name": "activeId";
                    "type": {
                        "option": "i32";
                    };
                },
                {
                    "name": "maxPriceImpactBps";
                    "type": "u16";
                },
                {
                    "name": "remainingAccountsInfo";
                    "type": {
                        "defined": "RemainingAccountsInfo";
                    };
                }
            ];
        },
        {
            "name": "closePosition2";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "rentReceiver";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "updateFeesAndReward2";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "lbPair";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "owner";
                    "isMut": false;
                    "isSigner": true;
                }
            ];
            "args": [
                {
                    "name": "minBinId";
                    "type": "i32";
                },
                {
                    "name": "maxBinId";
                    "type": "i32";
                }
            ];
        },
        {
            "name": "closePositionIfEmpty";
            "accounts": [
                {
                    "name": "position";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "sender";
                    "isMut": false;
                    "isSigner": true;
                },
                {
                    "name": "rentReceiver";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "eventAuthority";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "program";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        }
    ];
    "accounts": [
        {
            "name": "binArrayBitmapExtension";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "lbPair";
                        "type": "publicKey";
                    },
                    {
                        "name": "positiveBinArrayBitmap";
                        "docs": [
                            "Packed initialized bin array state for start_bin_index is positive"
                        ];
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u64",
                                        8
                                    ];
                                },
                                12
                            ];
                        };
                    },
                    {
                        "name": "negativeBinArrayBitmap";
                        "docs": [
                            "Packed initialized bin array state for start_bin_index is negative"
                        ];
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u64",
                                        8
                                    ];
                                },
                                12
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "binArray";
            "docs": [
                "An account to contain a range of bin. For example: Bin 100 <-> 200.",
                "For example:",
                "BinArray index: 0 contains bin 0 <-> 599",
                "index: 2 contains bin 600 <-> 1199, ..."
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "index";
                        "type": "i64";
                    },
                    {
                        "name": "version";
                        "docs": [
                            "Version of binArray"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "padding";
                        "type": {
                            "array": [
                                "u8",
                                7
                            ];
                        };
                    },
                    {
                        "name": "lbPair";
                        "type": "publicKey";
                    },
                    {
                        "name": "bins";
                        "type": {
                            "array": [
                                {
                                    "defined": "Bin";
                                },
                                70
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "claimFeeOperator";
            "docs": [
                "Parameter that set by the protocol"
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "operator";
                        "docs": [
                            "operator"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "padding";
                        "docs": [
                            "Reserve"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                128
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "lbPair";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "parameters";
                        "type": {
                            "defined": "StaticParameters";
                        };
                    },
                    {
                        "name": "vParameters";
                        "type": {
                            "defined": "VariableParameters";
                        };
                    },
                    {
                        "name": "bumpSeed";
                        "type": {
                            "array": [
                                "u8",
                                1
                            ];
                        };
                    },
                    {
                        "name": "binStepSeed";
                        "docs": [
                            "Bin step signer seed"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                2
                            ];
                        };
                    },
                    {
                        "name": "pairType";
                        "docs": [
                            "Type of the pair"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "activeId";
                        "docs": [
                            "Active bin id"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "binStep";
                        "docs": [
                            "Bin step. Represent the price increment / decrement."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "status";
                        "docs": [
                            "Status of the pair. Check PairStatus enum."
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "requireBaseFactorSeed";
                        "docs": [
                            "Require base factor seed"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "baseFactorSeed";
                        "docs": [
                            "Base factor seed"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                2
                            ];
                        };
                    },
                    {
                        "name": "activationType";
                        "docs": [
                            "Activation type"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "creatorPoolOnOffControl";
                        "docs": [
                            "Allow pool creator to enable/disable pool with restricted validation. Only applicable for customizable permissionless pair type."
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "tokenXMint";
                        "docs": [
                            "Token X mint"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "tokenYMint";
                        "docs": [
                            "Token Y mint"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "reserveX";
                        "docs": [
                            "LB token X vault"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "reserveY";
                        "docs": [
                            "LB token Y vault"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "protocolFee";
                        "docs": [
                            "Uncollected protocol fee"
                        ];
                        "type": {
                            "defined": "ProtocolFee";
                        };
                    },
                    {
                        "name": "padding1";
                        "docs": [
                            "_padding_1, previous Fee owner, BE CAREFUL FOR TOMBSTONE WHEN REUSE !!"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "rewardInfos";
                        "docs": [
                            "Farming reward information"
                        ];
                        "type": {
                            "array": [
                                {
                                    "defined": "RewardInfo";
                                },
                                2
                            ];
                        };
                    },
                    {
                        "name": "oracle";
                        "docs": [
                            "Oracle pubkey"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "binArrayBitmap";
                        "docs": [
                            "Packed initialized bin array state"
                        ];
                        "type": {
                            "array": [
                                "u64",
                                16
                            ];
                        };
                    },
                    {
                        "name": "lastUpdatedAt";
                        "docs": [
                            "Last time the pool fee parameter was updated"
                        ];
                        "type": "i64";
                    },
                    {
                        "name": "padding2";
                        "docs": [
                            "_padding_2, previous whitelisted_wallet, BE CAREFUL FOR TOMBSTONE WHEN REUSE !!"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "preActivationSwapAddress";
                        "docs": [
                            "Address allowed to swap when the current point is greater than or equal to the pre-activation point. The pre-activation point is calculated as `activation_point - pre_activation_duration`."
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "baseKey";
                        "docs": [
                            "Base keypair. Only required for permission pair"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "activationPoint";
                        "docs": [
                            "Time point to enable the pair. Only applicable for permission pair."
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "preActivationDuration";
                        "docs": [
                            "Duration before activation activation_point. Used to calculate pre-activation time point for pre_activation_swap_address"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "padding3";
                        "docs": [
                            "_padding 3 is reclaimed free space from swap_cap_deactivate_point and swap_cap_amount before, BE CAREFUL FOR TOMBSTONE WHEN REUSE !!"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                8
                            ];
                        };
                    },
                    {
                        "name": "padding4";
                        "docs": [
                            "_padding_4, previous lock_duration, BE CAREFUL FOR TOMBSTONE WHEN REUSE !!"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "creator";
                        "docs": [
                            "Pool creator"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "tokenMintXProgramFlag";
                        "docs": [
                            "token_mint_x_program_flag"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "tokenMintYProgramFlag";
                        "docs": [
                            "token_mint_y_program_flag"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "reserved";
                        "docs": [
                            "Reserved space for future use"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                22
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "oracle";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "idx";
                        "docs": [
                            "Index of latest observation"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "activeSize";
                        "docs": [
                            "Size of active sample. Active sample is initialized observation."
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "length";
                        "docs": [
                            "Number of observations"
                        ];
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "position";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "lbPair";
                        "docs": [
                            "The LB pair of this position"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "owner";
                        "docs": [
                            "Owner of the position. Client rely on this to to fetch their positions."
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "liquidityShares";
                        "docs": [
                            "Liquidity shares of this position in bins (lower_bin_id <-> upper_bin_id). This is the same as LP concept."
                        ];
                        "type": {
                            "array": [
                                "u64",
                                70
                            ];
                        };
                    },
                    {
                        "name": "rewardInfos";
                        "docs": [
                            "Farming reward information"
                        ];
                        "type": {
                            "array": [
                                {
                                    "defined": "UserRewardInfo";
                                },
                                70
                            ];
                        };
                    },
                    {
                        "name": "feeInfos";
                        "docs": [
                            "Swap fee to claim information"
                        ];
                        "type": {
                            "array": [
                                {
                                    "defined": "FeeInfo";
                                },
                                70
                            ];
                        };
                    },
                    {
                        "name": "lowerBinId";
                        "docs": [
                            "Lower bin ID"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "upperBinId";
                        "docs": [
                            "Upper bin ID"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "lastUpdatedAt";
                        "docs": [
                            "Last updated timestamp"
                        ];
                        "type": "i64";
                    },
                    {
                        "name": "totalClaimedFeeXAmount";
                        "docs": [
                            "Total claimed token fee X"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "totalClaimedFeeYAmount";
                        "docs": [
                            "Total claimed token fee Y"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "totalClaimedRewards";
                        "docs": [
                            "Total claimed rewards"
                        ];
                        "type": {
                            "array": [
                                "u64",
                                2
                            ];
                        };
                    },
                    {
                        "name": "reserved";
                        "docs": [
                            "Reserved space for future use"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                160
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "positionV2";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "lbPair";
                        "docs": [
                            "The LB pair of this position"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "owner";
                        "docs": [
                            "Owner of the position. Client rely on this to to fetch their positions."
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "liquidityShares";
                        "docs": [
                            "Liquidity shares of this position in bins (lower_bin_id <-> upper_bin_id). This is the same as LP concept."
                        ];
                        "type": {
                            "array": [
                                "u128",
                                70
                            ];
                        };
                    },
                    {
                        "name": "rewardInfos";
                        "docs": [
                            "Farming reward information"
                        ];
                        "type": {
                            "array": [
                                {
                                    "defined": "UserRewardInfo";
                                },
                                70
                            ];
                        };
                    },
                    {
                        "name": "feeInfos";
                        "docs": [
                            "Swap fee to claim information"
                        ];
                        "type": {
                            "array": [
                                {
                                    "defined": "FeeInfo";
                                },
                                70
                            ];
                        };
                    },
                    {
                        "name": "lowerBinId";
                        "docs": [
                            "Lower bin ID"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "upperBinId";
                        "docs": [
                            "Upper bin ID"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "lastUpdatedAt";
                        "docs": [
                            "Last updated timestamp"
                        ];
                        "type": "i64";
                    },
                    {
                        "name": "totalClaimedFeeXAmount";
                        "docs": [
                            "Total claimed token fee X"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "totalClaimedFeeYAmount";
                        "docs": [
                            "Total claimed token fee Y"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "totalClaimedRewards";
                        "docs": [
                            "Total claimed rewards"
                        ];
                        "type": {
                            "array": [
                                "u64",
                                2
                            ];
                        };
                    },
                    {
                        "name": "operator";
                        "docs": [
                            "Operator of position"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "lockReleasePoint";
                        "docs": [
                            "Time point which the locked liquidity can be withdraw"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "padding0";
                        "docs": [
                            "_padding_0, previous subjected_to_bootstrap_liquidity_locking, BE CAREFUL FOR TOMBSTONE WHEN REUSE !!"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "feeOwner";
                        "docs": [
                            "Address is able to claim fee in this position, only valid for bootstrap_liquidity_position"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "reserved";
                        "docs": [
                            "Reserved space for future use"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                87
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "presetParameter2";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "binStep";
                        "docs": [
                            "Bin step. Represent the price increment / decrement."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "baseFactor";
                        "docs": [
                            "Used for base fee calculation. base_fee_rate = base_factor * bin_step * 10 * 10^base_fee_power_factor"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "filterPeriod";
                        "docs": [
                            "Filter period determine high frequency trading time window."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "decayPeriod";
                        "docs": [
                            "Decay period determine when the volatile fee start decay / decrease."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "variableFeeControl";
                        "docs": [
                            "Used to scale the variable fee component depending on the dynamic of the market"
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "maxVolatilityAccumulator";
                        "docs": [
                            "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "reductionFactor";
                        "docs": [
                            "Reduction factor controls the volatile fee rate decrement rate."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "protocolShare";
                        "docs": [
                            "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "index";
                        "docs": [
                            "index"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "baseFeePowerFactor";
                        "docs": [
                            "Base fee power factor"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "padding0";
                        "docs": [
                            "Padding 0 for future use"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "padding1";
                        "docs": [
                            "Padding 1 for future use"
                        ];
                        "type": {
                            "array": [
                                "u64",
                                20
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "presetParameter";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "binStep";
                        "docs": [
                            "Bin step. Represent the price increment / decrement."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "baseFactor";
                        "docs": [
                            "Used for base fee calculation. base_fee_rate = base_factor * bin_step * 10 * 10^base_fee_power_factor"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "filterPeriod";
                        "docs": [
                            "Filter period determine high frequency trading time window."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "decayPeriod";
                        "docs": [
                            "Decay period determine when the volatile fee start decay / decrease."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "reductionFactor";
                        "docs": [
                            "Reduction factor controls the volatile fee rate decrement rate."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "variableFeeControl";
                        "docs": [
                            "Used to scale the variable fee component depending on the dynamic of the market"
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "maxVolatilityAccumulator";
                        "docs": [
                            "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "minBinId";
                        "docs": [
                            "Min bin id supported by the pool based on the configured bin step."
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "maxBinId";
                        "docs": [
                            "Max bin id supported by the pool based on the configured bin step."
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "protocolShare";
                        "docs": [
                            "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
                        ];
                        "type": "u16";
                    }
                ];
            };
        },
        {
            "name": "tokenBadge";
            "docs": [
                "Parameter that set by the protocol"
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "tokenMint";
                        "docs": [
                            "token mint"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "padding";
                        "docs": [
                            "Reserve"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                128
                            ];
                        };
                    }
                ];
            };
        }
    ];
    "types": [
        {
            "name": "InitPresetParameters2Ix";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "index";
                        "type": "u16";
                    },
                    {
                        "name": "binStep";
                        "docs": [
                            "Bin step. Represent the price increment / decrement."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "baseFactor";
                        "docs": [
                            "Used for base fee calculation. base_fee_rate = base_factor * bin_step * 10 * 10^base_fee_power_factor"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "filterPeriod";
                        "docs": [
                            "Filter period determine high frequency trading time window."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "decayPeriod";
                        "docs": [
                            "Decay period determine when the volatile fee start decay / decrease."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "reductionFactor";
                        "docs": [
                            "Reduction factor controls the volatile fee rate decrement rate."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "variableFeeControl";
                        "docs": [
                            "Used to scale the variable fee component depending on the dynamic of the market"
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "maxVolatilityAccumulator";
                        "docs": [
                            "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "protocolShare";
                        "docs": [
                            "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "baseFeePowerFactor";
                        "docs": [
                            "Base fee power factor"
                        ];
                        "type": "u8";
                    }
                ];
            };
        },
        {
            "name": "InitPresetParametersIx";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "binStep";
                        "docs": [
                            "Bin step. Represent the price increment / decrement."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "baseFactor";
                        "docs": [
                            "Used for base fee calculation. base_fee_rate = base_factor * bin_step * 10 * 10^base_fee_power_factor"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "filterPeriod";
                        "docs": [
                            "Filter period determine high frequency trading time window."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "decayPeriod";
                        "docs": [
                            "Decay period determine when the volatile fee start decay / decrease."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "reductionFactor";
                        "docs": [
                            "Reduction factor controls the volatile fee rate decrement rate."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "variableFeeControl";
                        "docs": [
                            "Used to scale the variable fee component depending on the dynamic of the market"
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "maxVolatilityAccumulator";
                        "docs": [
                            "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "protocolShare";
                        "docs": [
                            "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
                        ];
                        "type": "u16";
                    }
                ];
            };
        },
        {
            "name": "BaseFeeParameter";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "protocolShare";
                        "docs": [
                            "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "baseFactor";
                        "docs": [
                            "Base factor for base fee rate"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "baseFeePowerFactor";
                        "docs": [
                            "Base fee power factor"
                        ];
                        "type": "u8";
                    }
                ];
            };
        },
        {
            "name": "DynamicFeeParameter";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "filterPeriod";
                        "docs": [
                            "Filter period determine high frequency trading time window."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "decayPeriod";
                        "docs": [
                            "Decay period determine when the volatile fee start decay / decrease."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "reductionFactor";
                        "docs": [
                            "Reduction factor controls the volatile fee rate decrement rate."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "variableFeeControl";
                        "docs": [
                            "Used to scale the variable fee component depending on the dynamic of the market"
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "maxVolatilityAccumulator";
                        "docs": [
                            "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
                        ];
                        "type": "u32";
                    }
                ];
            };
        },
        {
            "name": "LiquidityParameterByStrategyOneSide";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "amount";
                        "docs": [
                            "Amount of X token or Y token to deposit"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "activeId";
                        "docs": [
                            "Active bin that integrator observe off-chain"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "maxActiveBinSlippage";
                        "docs": [
                            "max active bin slippage allowed"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "strategyParameters";
                        "docs": [
                            "strategy parameters"
                        ];
                        "type": {
                            "defined": "StrategyParameters";
                        };
                    }
                ];
            };
        },
        {
            "name": "LiquidityParameterByStrategy";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "amountX";
                        "docs": [
                            "Amount of X token to deposit"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "amountY";
                        "docs": [
                            "Amount of Y token to deposit"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "activeId";
                        "docs": [
                            "Active bin that integrator observe off-chain"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "maxActiveBinSlippage";
                        "docs": [
                            "max active bin slippage allowed"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "strategyParameters";
                        "docs": [
                            "strategy parameters"
                        ];
                        "type": {
                            "defined": "StrategyParameters";
                        };
                    }
                ];
            };
        },
        {
            "name": "StrategyParameters";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "minBinId";
                        "docs": [
                            "min bin id"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "maxBinId";
                        "docs": [
                            "max bin id"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "strategyType";
                        "docs": [
                            "strategy type"
                        ];
                        "type": {
                            "defined": "StrategyType";
                        };
                    },
                    {
                        "name": "parameteres";
                        "docs": [
                            "parameters"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                64
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "LiquidityOneSideParameter";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "amount";
                        "docs": [
                            "Amount of X token or Y token to deposit"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "activeId";
                        "docs": [
                            "Active bin that integrator observe off-chain"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "maxActiveBinSlippage";
                        "docs": [
                            "max active bin slippage allowed"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "binLiquidityDist";
                        "docs": [
                            "Liquidity distribution to each bins"
                        ];
                        "type": {
                            "vec": {
                                "defined": "BinLiquidityDistributionByWeight";
                            };
                        };
                    }
                ];
            };
        },
        {
            "name": "BinLiquidityDistributionByWeight";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "binId";
                        "docs": [
                            "Define the bin ID wish to deposit to."
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "weight";
                        "docs": [
                            "weight of liquidity distributed for this bin id"
                        ];
                        "type": "u16";
                    }
                ];
            };
        },
        {
            "name": "LiquidityParameterByWeight";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "amountX";
                        "docs": [
                            "Amount of X token to deposit"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "amountY";
                        "docs": [
                            "Amount of Y token to deposit"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "activeId";
                        "docs": [
                            "Active bin that integrator observe off-chain"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "maxActiveBinSlippage";
                        "docs": [
                            "max active bin slippage allowed"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "binLiquidityDist";
                        "docs": [
                            "Liquidity distribution to each bins"
                        ];
                        "type": {
                            "vec": {
                                "defined": "BinLiquidityDistributionByWeight";
                            };
                        };
                    }
                ];
            };
        },
        {
            "name": "AddLiquiditySingleSidePreciseParameter";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "bins";
                        "type": {
                            "vec": {
                                "defined": "CompressedBinDepositAmount";
                            };
                        };
                    },
                    {
                        "name": "decompressMultiplier";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "CompressedBinDepositAmount";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "binId";
                        "type": "i32";
                    },
                    {
                        "name": "amount";
                        "type": "u32";
                    }
                ];
            };
        },
        {
            "name": "BinLiquidityDistribution";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "binId";
                        "docs": [
                            "Define the bin ID wish to deposit to."
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "distributionX";
                        "docs": [
                            "DistributionX (or distributionY) is the percentages of amountX (or amountY) you want to add to each bin."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "distributionY";
                        "docs": [
                            "DistributionX (or distributionY) is the percentages of amountX (or amountY) you want to add to each bin."
                        ];
                        "type": "u16";
                    }
                ];
            };
        },
        {
            "name": "LiquidityParameter";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "amountX";
                        "docs": [
                            "Amount of X token to deposit"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "amountY";
                        "docs": [
                            "Amount of Y token to deposit"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "binLiquidityDist";
                        "docs": [
                            "Liquidity distribution to each bins"
                        ];
                        "type": {
                            "vec": {
                                "defined": "BinLiquidityDistribution";
                            };
                        };
                    }
                ];
            };
        },
        {
            "name": "CustomizableParams";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "activeId";
                        "docs": [
                            "Pool price"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "binStep";
                        "docs": [
                            "Bin step"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "baseFactor";
                        "docs": [
                            "Base factor"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "activationType";
                        "docs": [
                            "Activation type. 0 = Slot, 1 = Time. Check ActivationType enum"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "hasAlphaVault";
                        "docs": [
                            "Whether the pool has an alpha vault"
                        ];
                        "type": "bool";
                    },
                    {
                        "name": "activationPoint";
                        "docs": [
                            "Decide when does the pool start trade. None = Now"
                        ];
                        "type": {
                            "option": "u64";
                        };
                    },
                    {
                        "name": "creatorPoolOnOffControl";
                        "docs": [
                            "Pool creator have permission to enable/disable pool with restricted program validation. Only applicable for customizable permissionless pool."
                        ];
                        "type": "bool";
                    },
                    {
                        "name": "baseFeePowerFactor";
                        "docs": [
                            "Base fee power factor"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "padding";
                        "docs": [
                            "Padding, for future use"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                62
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "InitPermissionPairIx";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "activeId";
                        "type": "i32";
                    },
                    {
                        "name": "binStep";
                        "type": "u16";
                    },
                    {
                        "name": "baseFactor";
                        "type": "u16";
                    },
                    {
                        "name": "baseFeePowerFactor";
                        "type": "u8";
                    },
                    {
                        "name": "activationType";
                        "type": "u8";
                    },
                    {
                        "name": "protocolShare";
                        "type": "u16";
                    }
                ];
            };
        },
        {
            "name": "AddLiquiditySingleSidePreciseParameter2";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "bins";
                        "type": {
                            "vec": {
                                "defined": "CompressedBinDepositAmount";
                            };
                        };
                    },
                    {
                        "name": "decompressMultiplier";
                        "type": "u64";
                    },
                    {
                        "name": "maxAmount";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "CompressedBinDepositAmount2";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "binId";
                        "type": "i32";
                    },
                    {
                        "name": "amount";
                        "type": "u32";
                    }
                ];
            };
        },
        {
            "name": "InitializeLbPair2Params";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "activeId";
                        "docs": [
                            "Pool price"
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "padding";
                        "docs": [
                            "Padding, for future use"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                96
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "BinLiquidityReduction";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "binId";
                        "type": "i32";
                    },
                    {
                        "name": "bpsToRemove";
                        "type": "u16";
                    }
                ];
            };
        },
        {
            "name": "Bin";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "amountX";
                        "docs": [
                            "Amount of token X in the bin. This already excluded protocol fees."
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "amountY";
                        "docs": [
                            "Amount of token Y in the bin. This already excluded protocol fees."
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "price";
                        "docs": [
                            "Bin price"
                        ];
                        "type": "u128";
                    },
                    {
                        "name": "liquiditySupply";
                        "docs": [
                            "Liquidities of the bin. This is the same as LP mint supply. q-number"
                        ];
                        "type": "u128";
                    },
                    {
                        "name": "rewardPerTokenStored";
                        "docs": [
                            "reward_a_per_token_stored"
                        ];
                        "type": {
                            "array": [
                                "u128",
                                2
                            ];
                        };
                    },
                    {
                        "name": "feeAmountXPerTokenStored";
                        "docs": [
                            "Swap fee amount of token X per liquidity deposited."
                        ];
                        "type": "u128";
                    },
                    {
                        "name": "feeAmountYPerTokenStored";
                        "docs": [
                            "Swap fee amount of token Y per liquidity deposited."
                        ];
                        "type": "u128";
                    },
                    {
                        "name": "amountXIn";
                        "docs": [
                            "Total token X swap into the bin. Only used for tracking purpose."
                        ];
                        "type": "u128";
                    },
                    {
                        "name": "amountYIn";
                        "docs": [
                            "Total token Y swap into he bin. Only used for tracking purpose."
                        ];
                        "type": "u128";
                    }
                ];
            };
        },
        {
            "name": "ProtocolFee";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "amountX";
                        "type": "u64";
                    },
                    {
                        "name": "amountY";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "RewardInfo";
            "docs": [
                "Stores the state relevant for tracking liquidity mining rewards"
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "mint";
                        "docs": [
                            "Reward token mint."
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "vault";
                        "docs": [
                            "Reward vault token account."
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "funder";
                        "docs": [
                            "Authority account that allows to fund rewards"
                        ];
                        "type": "publicKey";
                    },
                    {
                        "name": "rewardDuration";
                        "docs": [
                            "TODO check whether we need to store it in pool"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "rewardDurationEnd";
                        "docs": [
                            "TODO check whether we need to store it in pool"
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "rewardRate";
                        "docs": [
                            "TODO check whether we need to store it in pool"
                        ];
                        "type": "u128";
                    },
                    {
                        "name": "lastUpdateTime";
                        "docs": [
                            "The last time reward states were updated."
                        ];
                        "type": "u64";
                    },
                    {
                        "name": "cumulativeSecondsWithEmptyLiquidityReward";
                        "docs": [
                            "Accumulated seconds where when farm distribute rewards, but the bin is empty. The reward will be accumulated for next reward time window."
                        ];
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "Observation";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "cumulativeActiveBinId";
                        "docs": [
                            "Cumulative active bin ID"
                        ];
                        "type": "i128";
                    },
                    {
                        "name": "createdAt";
                        "docs": [
                            "Observation sample created timestamp"
                        ];
                        "type": "i64";
                    },
                    {
                        "name": "lastUpdatedAt";
                        "docs": [
                            "Observation sample last updated timestamp"
                        ];
                        "type": "i64";
                    }
                ];
            };
        },
        {
            "name": "StaticParameters";
            "docs": [
                "Parameter that set by the protocol"
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "baseFactor";
                        "docs": [
                            "Used for base fee calculation. base_fee_rate = base_factor * bin_step * 10 * 10^base_fee_power_factor"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "filterPeriod";
                        "docs": [
                            "Filter period determine high frequency trading time window."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "decayPeriod";
                        "docs": [
                            "Decay period determine when the volatile fee start decay / decrease."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "reductionFactor";
                        "docs": [
                            "Reduction factor controls the volatile fee rate decrement rate."
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "variableFeeControl";
                        "docs": [
                            "Used to scale the variable fee component depending on the dynamic of the market"
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "maxVolatilityAccumulator";
                        "docs": [
                            "Maximum number of bin crossed can be accumulated. Used to cap volatile fee rate."
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "minBinId";
                        "docs": [
                            "Min bin id supported by the pool based on the configured bin step."
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "maxBinId";
                        "docs": [
                            "Max bin id supported by the pool based on the configured bin step."
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "protocolShare";
                        "docs": [
                            "Portion of swap fees retained by the protocol by controlling protocol_share parameter. protocol_swap_fee = protocol_share * total_swap_fee"
                        ];
                        "type": "u16";
                    },
                    {
                        "name": "baseFeePowerFactor";
                        "docs": [
                            "Base fee power factor"
                        ];
                        "type": "u8";
                    },
                    {
                        "name": "padding";
                        "docs": [
                            "Padding for bytemuck safe alignment"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                5
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "VariableParameters";
            "docs": [
                "Parameters that changes based on dynamic of the market"
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "volatilityAccumulator";
                        "docs": [
                            "Volatility accumulator measure the number of bin crossed since reference bin ID. Normally (without filter period taken into consideration), reference bin ID is the active bin of last swap.",
                            "It affects the variable fee rate"
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "volatilityReference";
                        "docs": [
                            "Volatility reference is decayed volatility accumulator. It is always <= volatility_accumulator"
                        ];
                        "type": "u32";
                    },
                    {
                        "name": "indexReference";
                        "docs": [
                            "Active bin id of last swap."
                        ];
                        "type": "i32";
                    },
                    {
                        "name": "padding";
                        "docs": [
                            "Padding for bytemuck safe alignment"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                4
                            ];
                        };
                    },
                    {
                        "name": "lastUpdateTimestamp";
                        "docs": [
                            "Last timestamp the variable parameters was updated"
                        ];
                        "type": "i64";
                    },
                    {
                        "name": "padding1";
                        "docs": [
                            "Padding for bytemuck safe alignment"
                        ];
                        "type": {
                            "array": [
                                "u8",
                                8
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "FeeInfo";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "feeXPerTokenComplete";
                        "type": "u128";
                    },
                    {
                        "name": "feeYPerTokenComplete";
                        "type": "u128";
                    },
                    {
                        "name": "feeXPending";
                        "type": "u64";
                    },
                    {
                        "name": "feeYPending";
                        "type": "u64";
                    }
                ];
            };
        },
        {
            "name": "UserRewardInfo";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "rewardPerTokenCompletes";
                        "type": {
                            "array": [
                                "u128",
                                2
                            ];
                        };
                    },
                    {
                        "name": "rewardPendings";
                        "type": {
                            "array": [
                                "u64",
                                2
                            ];
                        };
                    }
                ];
            };
        },
        {
            "name": "RemainingAccountsSlice";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "accountsType";
                        "type": {
                            "defined": "AccountsType";
                        };
                    },
                    {
                        "name": "length";
                        "type": "u8";
                    }
                ];
            };
        },
        {
            "name": "RemainingAccountsInfo";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "slices";
                        "type": {
                            "vec": {
                                "defined": "RemainingAccountsSlice";
                            };
                        };
                    }
                ];
            };
        },
        {
            "name": "StrategyType";
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "SpotOneSide";
                    },
                    {
                        "name": "CurveOneSide";
                    },
                    {
                        "name": "BidAskOneSide";
                    },
                    {
                        "name": "SpotBalanced";
                    },
                    {
                        "name": "CurveBalanced";
                    },
                    {
                        "name": "BidAskBalanced";
                    },
                    {
                        "name": "SpotImBalanced";
                    },
                    {
                        "name": "CurveImBalanced";
                    },
                    {
                        "name": "BidAskImBalanced";
                    }
                ];
            };
        },
        {
            "name": "Rounding";
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "Up";
                    },
                    {
                        "name": "Down";
                    }
                ];
            };
        },
        {
            "name": "ActivationType";
            "docs": [
                "Type of the activation"
            ];
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "Slot";
                    },
                    {
                        "name": "Timestamp";
                    }
                ];
            };
        },
        {
            "name": "LayoutVersion";
            "docs": [
                "Layout version"
            ];
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "V0";
                    },
                    {
                        "name": "V1";
                    }
                ];
            };
        },
        {
            "name": "PairType";
            "docs": [
                "Type of the Pair. 0 = Permissionless, 1 = Permission, 2 = CustomizablePermissionless. Putting 0 as permissionless for backward compatibility."
            ];
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "Permissionless";
                    },
                    {
                        "name": "Permission";
                    },
                    {
                        "name": "CustomizablePermissionless";
                    },
                    {
                        "name": "PermissionlessV2";
                    }
                ];
            };
        },
        {
            "name": "PairStatus";
            "docs": [
                "Pair status. 0 = Enabled, 1 = Disabled. Putting 0 as enabled for backward compatibility."
            ];
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "Enabled";
                    },
                    {
                        "name": "Disabled";
                    }
                ];
            };
        },
        {
            "name": "TokenProgramFlags";
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "TokenProgram";
                    },
                    {
                        "name": "TokenProgram2022";
                    }
                ];
            };
        },
        {
            "name": "AccountsType";
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "TransferHookX";
                    },
                    {
                        "name": "TransferHookY";
                    },
                    {
                        "name": "TransferHookReward";
                    }
                ];
            };
        }
    ];
    "events": [
        {
            "name": "CompositionFee";
            "fields": [
                {
                    "name": "from";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "binId";
                    "type": "i16";
                    "index": false;
                },
                {
                    "name": "tokenXFeeAmount";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "tokenYFeeAmount";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "protocolTokenXFeeAmount";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "protocolTokenYFeeAmount";
                    "type": "u64";
                    "index": false;
                }
            ];
        },
        {
            "name": "AddLiquidity";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "from";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "position";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "amounts";
                    "type": {
                        "array": [
                            "u64",
                            2
                        ];
                    };
                    "index": false;
                },
                {
                    "name": "activeBinId";
                    "type": "i32";
                    "index": false;
                }
            ];
        },
        {
            "name": "RemoveLiquidity";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "from";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "position";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "amounts";
                    "type": {
                        "array": [
                            "u64",
                            2
                        ];
                    };
                    "index": false;
                },
                {
                    "name": "activeBinId";
                    "type": "i32";
                    "index": false;
                }
            ];
        },
        {
            "name": "Swap";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "from";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "startBinId";
                    "type": "i32";
                    "index": false;
                },
                {
                    "name": "endBinId";
                    "type": "i32";
                    "index": false;
                },
                {
                    "name": "amountIn";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "amountOut";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "swapForY";
                    "type": "bool";
                    "index": false;
                },
                {
                    "name": "fee";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "protocolFee";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "feeBps";
                    "type": "u128";
                    "index": false;
                },
                {
                    "name": "hostFee";
                    "type": "u64";
                    "index": false;
                }
            ];
        },
        {
            "name": "ClaimReward";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "position";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "owner";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "rewardIndex";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "totalReward";
                    "type": "u64";
                    "index": false;
                }
            ];
        },
        {
            "name": "FundReward";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "funder";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "rewardIndex";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "amount";
                    "type": "u64";
                    "index": false;
                }
            ];
        },
        {
            "name": "InitializeReward";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "rewardMint";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "funder";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "rewardIndex";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "rewardDuration";
                    "type": "u64";
                    "index": false;
                }
            ];
        },
        {
            "name": "UpdateRewardDuration";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "rewardIndex";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "oldRewardDuration";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "newRewardDuration";
                    "type": "u64";
                    "index": false;
                }
            ];
        },
        {
            "name": "UpdateRewardFunder";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "rewardIndex";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "oldFunder";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "newFunder";
                    "type": "publicKey";
                    "index": false;
                }
            ];
        },
        {
            "name": "PositionClose";
            "fields": [
                {
                    "name": "position";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "owner";
                    "type": "publicKey";
                    "index": false;
                }
            ];
        },
        {
            "name": "ClaimFee";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "position";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "owner";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "feeX";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "feeY";
                    "type": "u64";
                    "index": false;
                }
            ];
        },
        {
            "name": "LbPairCreate";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "binStep";
                    "type": "u16";
                    "index": false;
                },
                {
                    "name": "tokenX";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "tokenY";
                    "type": "publicKey";
                    "index": false;
                }
            ];
        },
        {
            "name": "PositionCreate";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "position";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "owner";
                    "type": "publicKey";
                    "index": false;
                }
            ];
        },
        {
            "name": "IncreasePositionLength";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "position";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "owner";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "lengthToAdd";
                    "type": "u16";
                    "index": false;
                },
                {
                    "name": "side";
                    "type": "u8";
                    "index": false;
                }
            ];
        },
        {
            "name": "DecreasePositionLength";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "position";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "owner";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "lengthToRemove";
                    "type": "u16";
                    "index": false;
                },
                {
                    "name": "side";
                    "type": "u8";
                    "index": false;
                }
            ];
        },
        {
            "name": "FeeParameterUpdate";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "protocolShare";
                    "type": "u16";
                    "index": false;
                },
                {
                    "name": "baseFactor";
                    "type": "u16";
                    "index": false;
                }
            ];
        },
        {
            "name": "DynamicFeeParameterUpdate";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "filterPeriod";
                    "type": "u16";
                    "index": false;
                },
                {
                    "name": "decayPeriod";
                    "type": "u16";
                    "index": false;
                },
                {
                    "name": "reductionFactor";
                    "type": "u16";
                    "index": false;
                },
                {
                    "name": "variableFeeControl";
                    "type": "u32";
                    "index": false;
                },
                {
                    "name": "maxVolatilityAccumulator";
                    "type": "u32";
                    "index": false;
                }
            ];
        },
        {
            "name": "IncreaseObservation";
            "fields": [
                {
                    "name": "oracle";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "newObservationLength";
                    "type": "u64";
                    "index": false;
                }
            ];
        },
        {
            "name": "WithdrawIneligibleReward";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "rewardMint";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "amount";
                    "type": "u64";
                    "index": false;
                }
            ];
        },
        {
            "name": "UpdatePositionOperator";
            "fields": [
                {
                    "name": "position";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "oldOperator";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "newOperator";
                    "type": "publicKey";
                    "index": false;
                }
            ];
        },
        {
            "name": "UpdatePositionLockReleasePoint";
            "fields": [
                {
                    "name": "position";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "currentPoint";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "newLockReleasePoint";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "oldLockReleasePoint";
                    "type": "u64";
                    "index": false;
                },
                {
                    "name": "sender";
                    "type": "publicKey";
                    "index": false;
                }
            ];
        },
        {
            "name": "GoToABin";
            "fields": [
                {
                    "name": "lbPair";
                    "type": "publicKey";
                    "index": false;
                },
                {
                    "name": "fromBinId";
                    "type": "i32";
                    "index": false;
                },
                {
                    "name": "toBinId";
                    "type": "i32";
                    "index": false;
                }
            ];
        }
    ];
    "errors": [
        {
            "code": 6000;
            "name": "InvalidStartBinIndex";
            "msg": "Invalid start bin index";
        },
        {
            "code": 6001;
            "name": "InvalidBinId";
            "msg": "Invalid bin id";
        },
        {
            "code": 6002;
            "name": "InvalidInput";
            "msg": "Invalid input data";
        },
        {
            "code": 6003;
            "name": "ExceededAmountSlippageTolerance";
            "msg": "Exceeded amount slippage tolerance";
        },
        {
            "code": 6004;
            "name": "ExceededBinSlippageTolerance";
            "msg": "Exceeded bin slippage tolerance";
        },
        {
            "code": 6005;
            "name": "CompositionFactorFlawed";
            "msg": "Composition factor flawed";
        },
        {
            "code": 6006;
            "name": "NonPresetBinStep";
            "msg": "Non preset bin step";
        },
        {
            "code": 6007;
            "name": "ZeroLiquidity";
            "msg": "Zero liquidity";
        },
        {
            "code": 6008;
            "name": "InvalidPosition";
            "msg": "Invalid position";
        },
        {
            "code": 6009;
            "name": "BinArrayNotFound";
            "msg": "Bin array not found";
        },
        {
            "code": 6010;
            "name": "InvalidTokenMint";
            "msg": "Invalid token mint";
        },
        {
            "code": 6011;
            "name": "InvalidAccountForSingleDeposit";
            "msg": "Invalid account for single deposit";
        },
        {
            "code": 6012;
            "name": "PairInsufficientLiquidity";
            "msg": "Pair insufficient liquidity";
        },
        {
            "code": 6013;
            "name": "InvalidFeeOwner";
            "msg": "Invalid fee owner";
        },
        {
            "code": 6014;
            "name": "InvalidFeeWithdrawAmount";
            "msg": "Invalid fee withdraw amount";
        },
        {
            "code": 6015;
            "name": "InvalidAdmin";
            "msg": "Invalid admin";
        },
        {
            "code": 6016;
            "name": "IdenticalFeeOwner";
            "msg": "Identical fee owner";
        },
        {
            "code": 6017;
            "name": "InvalidBps";
            "msg": "Invalid basis point";
        },
        {
            "code": 6018;
            "name": "MathOverflow";
            "msg": "Math operation overflow";
        },
        {
            "code": 6019;
            "name": "TypeCastFailed";
            "msg": "Type cast error";
        },
        {
            "code": 6020;
            "name": "InvalidRewardIndex";
            "msg": "Invalid reward index";
        },
        {
            "code": 6021;
            "name": "InvalidRewardDuration";
            "msg": "Invalid reward duration";
        },
        {
            "code": 6022;
            "name": "RewardInitialized";
            "msg": "Reward already initialized";
        },
        {
            "code": 6023;
            "name": "RewardUninitialized";
            "msg": "Reward not initialized";
        },
        {
            "code": 6024;
            "name": "IdenticalFunder";
            "msg": "Identical funder";
        },
        {
            "code": 6025;
            "name": "RewardCampaignInProgress";
            "msg": "Reward campaign in progress";
        },
        {
            "code": 6026;
            "name": "IdenticalRewardDuration";
            "msg": "Reward duration is the same";
        },
        {
            "code": 6027;
            "name": "InvalidBinArray";
            "msg": "Invalid bin array";
        },
        {
            "code": 6028;
            "name": "NonContinuousBinArrays";
            "msg": "Bin arrays must be continuous";
        },
        {
            "code": 6029;
            "name": "InvalidRewardVault";
            "msg": "Invalid reward vault";
        },
        {
            "code": 6030;
            "name": "NonEmptyPosition";
            "msg": "Position is not empty";
        },
        {
            "code": 6031;
            "name": "UnauthorizedAccess";
            "msg": "Unauthorized access";
        },
        {
            "code": 6032;
            "name": "InvalidFeeParameter";
            "msg": "Invalid fee parameter";
        },
        {
            "code": 6033;
            "name": "MissingOracle";
            "msg": "Missing oracle account";
        },
        {
            "code": 6034;
            "name": "InsufficientSample";
            "msg": "Insufficient observation sample";
        },
        {
            "code": 6035;
            "name": "InvalidLookupTimestamp";
            "msg": "Invalid lookup timestamp";
        },
        {
            "code": 6036;
            "name": "BitmapExtensionAccountIsNotProvided";
            "msg": "Bitmap extension account is not provided";
        },
        {
            "code": 6037;
            "name": "CannotFindNonZeroLiquidityBinArrayId";
            "msg": "Cannot find non-zero liquidity binArrayId";
        },
        {
            "code": 6038;
            "name": "BinIdOutOfBound";
            "msg": "Bin id out of bound";
        },
        {
            "code": 6039;
            "name": "InsufficientOutAmount";
            "msg": "Insufficient amount in for minimum out";
        },
        {
            "code": 6040;
            "name": "InvalidPositionWidth";
            "msg": "Invalid position width";
        },
        {
            "code": 6041;
            "name": "ExcessiveFeeUpdate";
            "msg": "Excessive fee update";
        },
        {
            "code": 6042;
            "name": "PoolDisabled";
            "msg": "Pool disabled";
        },
        {
            "code": 6043;
            "name": "InvalidPoolType";
            "msg": "Invalid pool type";
        },
        {
            "code": 6044;
            "name": "ExceedMaxWhitelist";
            "msg": "Whitelist for wallet is full";
        },
        {
            "code": 6045;
            "name": "InvalidIndex";
            "msg": "Invalid index";
        },
        {
            "code": 6046;
            "name": "RewardNotEnded";
            "msg": "Reward not ended";
        },
        {
            "code": 6047;
            "name": "MustWithdrawnIneligibleReward";
            "msg": "Must withdraw ineligible reward";
        },
        {
            "code": 6048;
            "name": "UnauthorizedAddress";
            "msg": "Unauthorized address";
        },
        {
            "code": 6049;
            "name": "OperatorsAreTheSame";
            "msg": "Cannot update because operators are the same";
        },
        {
            "code": 6050;
            "name": "WithdrawToWrongTokenAccount";
            "msg": "Withdraw to wrong token account";
        },
        {
            "code": 6051;
            "name": "WrongRentReceiver";
            "msg": "Wrong rent receiver";
        },
        {
            "code": 6052;
            "name": "AlreadyPassActivationPoint";
            "msg": "Already activated";
        },
        {
            "code": 6053;
            "name": "ExceedMaxSwappedAmount";
            "msg": "Swapped amount is exceeded max swapped amount";
        },
        {
            "code": 6054;
            "name": "InvalidStrategyParameters";
            "msg": "Invalid strategy parameters";
        },
        {
            "code": 6055;
            "name": "LiquidityLocked";
            "msg": "Liquidity locked";
        },
        {
            "code": 6056;
            "name": "BinRangeIsNotEmpty";
            "msg": "Bin range is not empty";
        },
        {
            "code": 6057;
            "name": "NotExactAmountOut";
            "msg": "Amount out is not matched with exact amount out";
        },
        {
            "code": 6058;
            "name": "InvalidActivationType";
            "msg": "Invalid activation type";
        },
        {
            "code": 6059;
            "name": "InvalidActivationDuration";
            "msg": "Invalid activation duration";
        },
        {
            "code": 6060;
            "name": "MissingTokenAmountAsTokenLaunchProof";
            "msg": "Missing token amount as token launch owner proof";
        },
        {
            "code": 6061;
            "name": "InvalidQuoteToken";
            "msg": "Quote token must be SOL or USDC";
        },
        {
            "code": 6062;
            "name": "InvalidBinStep";
            "msg": "Invalid bin step";
        },
        {
            "code": 6063;
            "name": "InvalidBaseFee";
            "msg": "Invalid base fee";
        },
        {
            "code": 6064;
            "name": "InvalidPreActivationDuration";
            "msg": "Invalid pre-activation duration";
        },
        {
            "code": 6065;
            "name": "AlreadyPassPreActivationSwapPoint";
            "msg": "Already pass pre-activation swap point";
        },
        {
            "code": 6066;
            "name": "InvalidStatus";
            "msg": "Invalid status";
        },
        {
            "code": 6067;
            "name": "ExceededMaxOracleLength";
            "msg": "Exceed max oracle length";
        },
        {
            "code": 6068;
            "name": "InvalidMinimumLiquidity";
            "msg": "Invalid minimum liquidity";
        },
        {
            "code": 6069;
            "name": "NotSupportMint";
            "msg": "Not support token_2022 mint extension";
        },
        {
            "code": 6070;
            "name": "UnsupportedMintExtension";
            "msg": "Unsupported mint extension";
        },
        {
            "code": 6071;
            "name": "UnsupportNativeMintToken2022";
            "msg": "Unsupported native mint token2022";
        },
        {
            "code": 6072;
            "name": "UnmatchTokenMint";
            "msg": "Unmatch token mint";
        },
        {
            "code": 6073;
            "name": "UnsupportedTokenMint";
            "msg": "Unsupported token mint";
        },
        {
            "code": 6074;
            "name": "InsufficientRemainingAccounts";
            "msg": "Insufficient remaining accounts";
        },
        {
            "code": 6075;
            "name": "InvalidRemainingAccountSlice";
            "msg": "Invalid remaining account slice";
        },
        {
            "code": 6076;
            "name": "DuplicatedRemainingAccountTypes";
            "msg": "Duplicated remaining account types";
        },
        {
            "code": 6077;
            "name": "MissingRemainingAccountForTransferHook";
            "msg": "Missing remaining account for transfer hook";
        },
        {
            "code": 6078;
            "name": "NoTransferHookProgram";
            "msg": "Remaining account was passed for transfer hook but there's no hook program";
        },
        {
            "code": 6079;
            "name": "ZeroFundedAmount";
            "msg": "Zero funded amount";
        },
        {
            "code": 6080;
            "name": "InvalidSide";
            "msg": "Invalid side";
        },
        {
            "code": 6081;
            "name": "InvalidResizeLength";
            "msg": "Invalid resize length";
        },
        {
            "code": 6082;
            "name": "NotSupportAtTheMoment";
            "msg": "Not support at the moment";
        }
    ];
};
declare const IDL: LbClmm;

interface BinAndAmount {
    binId: number;
    xAmountBpsOfTotal: BN;
    yAmountBpsOfTotal: BN;
}
interface TokenReserve {
    publicKey: PublicKey;
    reserve: PublicKey;
    mint: Mint;
    amount: bigint;
    owner: PublicKey;
    transferHookAccountMetas: AccountMeta[];
}
type ClmmProgram = Program<LbClmm>;
type LbPair = IdlAccounts<LbClmm>["lbPair"];
type LbPairAccount = ProgramAccount<IdlAccounts<LbClmm>["lbPair"]>;
type Bin = IdlTypes<LbClmm>["Bin"];
type BinArray = IdlAccounts<LbClmm>["binArray"];
type BinArrayAccount = ProgramAccount<IdlAccounts<LbClmm>["binArray"]>;
type Position = IdlAccounts<LbClmm>["position"];
type PositionV2 = IdlAccounts<LbClmm>["positionV2"];
type PresetParameter = IdlAccounts<LbClmm>["presetParameter"];
type PresetParameter2 = IdlAccounts<LbClmm>["presetParameter2"];
type vParameters = IdlAccounts<LbClmm>["lbPair"]["vParameters"];
type sParameters = IdlAccounts<LbClmm>["lbPair"]["parameters"];
type UserRewardInfo = IdlTypes<LbClmm>["UserRewardInfo"];
type UserFeeInfo = IdlTypes<LbClmm>["FeeInfo"];
type InitPermissionPairIx = IdlTypes<LbClmm>["InitPermissionPairIx"];
type InitCustomizablePermissionlessPairIx = IdlTypes<LbClmm>["CustomizableParams"];
type BinLiquidityDistribution = IdlTypes<LbClmm>["BinLiquidityDistribution"];
type BinLiquidityReduction = IdlTypes<LbClmm>["BinLiquidityReduction"];
type BinArrayBitmapExtensionAccount = ProgramAccount<IdlAccounts<LbClmm>["binArrayBitmapExtension"]>;
type BinArrayBitmapExtension = IdlAccounts<LbClmm>["binArrayBitmapExtension"];
type LiquidityParameterByWeight = IdlTypes<LbClmm>["LiquidityParameterByWeight"];
type LiquidityOneSideParameter = IdlTypes<LbClmm>["LiquidityOneSideParameter"];
type LiquidityParameterByStrategy = IdlTypes<LbClmm>["LiquidityParameterByStrategy"];
type LiquidityParameterByStrategyOneSide = IdlTypes<LbClmm>["LiquidityParameterByStrategyOneSide"];
type LiquidityParameter = IdlTypes<LbClmm>["LiquidityParameter"];
type ProgramStrategyParameter = IdlTypes<LbClmm>["StrategyParameters"];
type ProgramStrategyType = IdlTypes<LbClmm>["StrategyType"];
type RemainingAccountInfo = IdlTypes<LbClmm>["RemainingAccountsInfo"];
type RemainingAccountsInfoSlice = IdlTypes<LbClmm>["RemainingAccountsSlice"];
type CompressedBinDepositAmount = IdlTypes<LbClmm>["CompressedBinDepositAmount"];
type CompressedBinDepositAmounts = CompressedBinDepositAmount[];
declare const POSITION_V2_DISC: Buffer<ArrayBufferLike>;
interface LbPosition {
    publicKey: PublicKey;
    positionData: PositionData;
    version: PositionVersion;
}
interface PositionInfo {
    publicKey: PublicKey;
    lbPair: LbPair;
    tokenX: TokenReserve;
    tokenY: TokenReserve;
    lbPairPositionsData: Array<LbPosition>;
}
interface FeeInfo {
    baseFeeRatePercentage: Decimal;
    maxFeeRatePercentage: Decimal;
    protocolFeePercentage: Decimal;
}
interface FeeInfo {
    baseFeeRatePercentage: Decimal;
    maxFeeRatePercentage: Decimal;
    protocolFeePercentage: Decimal;
}
interface EmissionRate {
    rewardOne: Decimal | undefined;
    rewardTwo: Decimal | undefined;
}
interface SwapFee {
    feeX: BN;
    feeY: BN;
}
interface LMRewards {
    rewardOne: BN;
    rewardTwo: BN;
}
declare enum PositionVersion {
    V1 = 0,
    V2 = 1,
    V3 = 2
}
declare enum PairType {
    Permissionless = 0,
    Permissioned = 1
}
declare const Strategy: {
    SpotBalanced: {
        spotBalanced: {};
    };
    CurveBalanced: {
        curveBalanced: {};
    };
    BidAskBalanced: {
        bidAskBalanced: {};
    };
    SpotImBalanced: {
        spotImBalanced: {};
    };
    CurveImBalanced: {
        curveImBalanced: {};
    };
    BidAskImBalanced: {
        bidAskImBalanced: {};
    };
};
declare enum StrategyType {
    Spot = 0,
    Curve = 1,
    BidAsk = 2
}
declare enum ActivationType {
    Slot = 0,
    Timestamp = 1
}
interface StrategyParameters {
    maxBinId: number;
    minBinId: number;
    strategyType: StrategyType;
    singleSidedX?: boolean;
}
interface TQuoteCreatePositionParams {
    strategy: StrategyParameters;
}
interface TInitializePositionAndAddLiquidityParams {
    positionPubKey: PublicKey;
    totalXAmount: BN;
    totalYAmount: BN;
    xYAmountDistribution: BinAndAmount[];
    user: PublicKey;
    slippage?: number;
}
interface TInitializePositionAndAddLiquidityParamsByStrategy {
    positionPubKey: PublicKey;
    totalXAmount: BN;
    totalYAmount: BN;
    strategy: StrategyParameters;
    user: PublicKey;
    slippage?: number;
}
interface BinLiquidity {
    binId: number;
    xAmount: BN;
    yAmount: BN;
    supply: BN;
    version: number;
    price: string;
    pricePerToken: string;
    feeAmountXPerTokenStored: BN;
    feeAmountYPerTokenStored: BN;
    rewardPerTokenStored: BN[];
}
declare namespace BinLiquidity {
    function fromBin(bin: Bin, binId: number, binStep: number, baseTokenDecimal: number, quoteTokenDecimal: number, version: number): BinLiquidity;
    function empty(binId: number, binStep: number, baseTokenDecimal: number, quoteTokenDecimal: number, version: number): BinLiquidity;
}
interface SwapQuote {
    consumedInAmount: BN;
    outAmount: BN;
    fee: BN;
    protocolFee: BN;
    minOutAmount: BN;
    priceImpact: Decimal;
    binArraysPubkey: any[];
    endPrice: Decimal;
}
interface SwapQuoteExactOut {
    inAmount: BN;
    outAmount: BN;
    fee: BN;
    priceImpact: Decimal;
    protocolFee: BN;
    maxInAmount: BN;
    binArraysPubkey: any[];
}
interface IAccountsCache {
    binArrays: Map<String, BinArray>;
    lbPair: LbPair;
}
interface PositionBinData {
    binId: number;
    price: string;
    pricePerToken: string;
    binXAmount: string;
    binYAmount: string;
    binLiquidity: string;
    positionLiquidity: string;
    positionXAmount: string;
    positionYAmount: string;
    positionFeeXAmount: string;
    positionFeeYAmount: string;
    positionRewardAmount: string[];
}
interface PositionData {
    totalXAmount: string;
    totalYAmount: string;
    positionBinData: PositionBinData[];
    lastUpdatedAt: BN;
    upperBinId: number;
    lowerBinId: number;
    feeX: BN;
    feeY: BN;
    rewardOne: BN;
    rewardTwo: BN;
    feeOwner: PublicKey;
    totalClaimedFeeXAmount: BN;
    totalClaimedFeeYAmount: BN;
    feeXExcludeTransferFee: BN;
    feeYExcludeTransferFee: BN;
    rewardOneExcludeTransferFee: BN;
    rewardTwoExcludeTransferFee: BN;
    totalXAmountExcludeTransferFee: BN;
    totalYAmountExcludeTransferFee: BN;
    owner: PublicKey;
}
interface SwapWithPriceImpactParams {
    /**
     * mint of in token
     */
    inToken: PublicKey;
    /**
     * mint of out token
     */
    outToken: PublicKey;
    /**
     * in token amount
     */
    inAmount: BN;
    /**
     * price impact in bps
     */
    priceImpact: BN;
    /**
     * desired lbPair to swap against
     */
    lbPair: PublicKey;
    /**
     * user
     */
    user: PublicKey;
    binArraysPubkey: PublicKey[];
}
interface SwapParams {
    /**
     * mint of in token
     */
    inToken: PublicKey;
    /**
     * mint of out token
     */
    outToken: PublicKey;
    /**
     * in token amount
     */
    inAmount: BN;
    /**
     * minimum out with slippage
     */
    minOutAmount: BN;
    /**
     * desired lbPair to swap against
     */
    lbPair: PublicKey;
    /**
     * user
     */
    user: PublicKey;
    binArraysPubkey: PublicKey[];
}
interface SwapExactOutParams {
    /**
     * mint of in token
     */
    inToken: PublicKey;
    /**
     * mint of out token
     */
    outToken: PublicKey;
    /**
     * out token amount
     */
    outAmount: BN;
    /**
     * maximum in amount, also known as slippage
     */
    maxInAmount: BN;
    /**
     * desired lbPair to swap against
     */
    lbPair: PublicKey;
    /**
     * user
     */
    user: PublicKey;
    binArraysPubkey: PublicKey[];
}
interface GetOrCreateATAResponse {
    ataPubKey: PublicKey;
    ix?: TransactionInstruction;
}
declare enum BitmapType {
    U1024 = 0,
    U512 = 1
}
interface SeedLiquidityResponse {
    sendPositionOwnerTokenProveIxs: TransactionInstruction[];
    initializeBinArraysAndPositionIxs: TransactionInstruction[][];
    addLiquidityIxs: TransactionInstruction[][];
}
interface Clock {
    slot: BN;
    epochStartTimestamp: BN;
    epoch: BN;
    leaderScheduleEpoch: BN;
    unixTimestamp: BN;
}
declare const ClockLayout: any;
declare enum PairStatus {
    Enabled = 0,
    Disabled = 1
}
interface PairLockInfo {
    positions: Array<PositionLockInfo>;
}
interface PositionLockInfo {
    positionAddress: PublicKey;
    owner: PublicKey;
    tokenXAmount: string;
    tokenYAmount: string;
    lockReleasePoint: number;
}
declare enum ActionType {
    Liquidity = 0,
    Reward = 1
}
declare const MEMO_PROGRAM_ID: PublicKey;

type Opt = {
    cluster?: Cluster | "localhost";
    programId?: PublicKey;
};
declare class DLMM {
    pubkey: PublicKey;
    program: ClmmProgram;
    lbPair: LbPair;
    binArrayBitmapExtension: BinArrayBitmapExtensionAccount | null;
    tokenX: TokenReserve;
    tokenY: TokenReserve;
    rewards: Array<TokenReserve | null>;
    clock: Clock;
    private opt?;
    constructor(pubkey: PublicKey, program: ClmmProgram, lbPair: LbPair, binArrayBitmapExtension: BinArrayBitmapExtensionAccount | null, tokenX: TokenReserve, tokenY: TokenReserve, rewards: Array<TokenReserve | null>, clock: Clock, opt?: Opt);
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
    static getLbPairs(connection: Connection, opt?: Opt): Promise<LbPairAccount[]>;
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
    static getPairPubkeyIfExists(connection: Connection, tokenX: PublicKey, tokenY: PublicKey, binStep: BN, baseFactor: BN, baseFeePowerFactor: BN, opt?: Opt): Promise<PublicKey | null>;
    static getCustomizablePermissionlessLbPairIfExists(connection: Connection, tokenX: PublicKey, tokenY: PublicKey, opt?: Opt): Promise<PublicKey | null>;
    /**
     * The `create` function is a static method that creates a new instance of the `DLMM` class
     * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
     * class, which represents the connection to the Solana blockchain network.
     * @param {PublicKey} dlmm - The PublicKey of LB Pair.
     * @param {Opt} [opt] - The `opt` parameter is an optional object that can contain additional options
     * for the `create` function. It has the following properties:
     * @returns The `create` function returns a `Promise` that resolves to a `DLMM` object.
     */
    static create(connection: Connection, dlmm: PublicKey, opt?: Opt): Promise<DLMM>;
    /**
     * Similar to `create` function, but it accept multiple lbPairs to be initialized.
     * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
     * class, which represents the connection to the Solana blockchain network.
     * @param dlmmList - An Array of PublicKey of LB Pairs.
     * @param {Opt} [opt] - An optional parameter of type `Opt`.
     * @returns The function `createMultiple` returns a Promise that resolves to an array of `DLMM`
     * objects.
     */
    static createMultiple(connection: Connection, dlmmList: Array<PublicKey>, opt?: Opt): Promise<DLMM[]>;
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
    static getAllPresetParameters(connection: Connection, opt?: Opt): Promise<{
        presetParameter: _coral_xyz_anchor.ProgramAccount<{
            binStep: number;
            baseFactor: number;
            filterPeriod: number;
            decayPeriod: number;
            reductionFactor: number;
            variableFeeControl: number;
            maxVolatilityAccumulator: number;
            minBinId: number;
            maxBinId: number;
            protocolShare: number;
        }>[];
        presetParameter2: _coral_xyz_anchor.ProgramAccount<{
            binStep: number;
            baseFactor: number;
            filterPeriod: number;
            decayPeriod: number;
            variableFeeControl: number;
            maxVolatilityAccumulator: number;
            reductionFactor: number;
            protocolShare: number;
            index: number;
            baseFeePowerFactor: number;
            padding0: number;
            padding1: BN[];
        }>[];
    }>;
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
    static getAllLbPairPositionsByUser(connection: Connection, userPubKey: PublicKey, opt?: Opt): Promise<Map<string, PositionInfo>>;
    static getPricePerLamport(tokenXDecimal: number, tokenYDecimal: number, price: number): string;
    static getBinIdFromPrice(price: string | number | Decimal, binStep: number, min: boolean): number;
    /**
     * The function `getLbPairLockInfo` retrieves all pair positions that has locked liquidity.
     * @param {number} [lockDurationOpt] - An optional value indicating the minimum position lock duration that the function should return.
     * Depending on the lbPair activationType, the param should be a number of seconds or a number of slots.
     * @returns The function `getLbPairLockInfo` returns a `Promise` that resolves to a `PairLockInfo`
     * object. The `PairLockInfo` object contains an array of `PositionLockInfo` objects.
     */
    getLbPairLockInfo(lockDurationOpt?: number): Promise<PairLockInfo>;
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
    static createCustomizablePermissionlessLbPair2(connection: Connection, binStep: BN, tokenX: PublicKey, tokenY: PublicKey, activeId: BN, feeBps: BN, activationType: ActivationType, hasAlphaVault: boolean, creatorKey: PublicKey, activationPoint?: BN, creatorPoolOnOffControl?: boolean, opt?: Opt): Promise<Transaction>;
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
    static createCustomizablePermissionlessLbPair(connection: Connection, binStep: BN, tokenX: PublicKey, tokenY: PublicKey, activeId: BN, feeBps: BN, activationType: ActivationType, hasAlphaVault: boolean, creatorKey: PublicKey, activationPoint?: BN, creatorPoolOnOffControl?: boolean, opt?: Opt): Promise<Transaction>;
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
    static createLbPair(connection: Connection, funder: PublicKey, tokenX: PublicKey, tokenY: PublicKey, binStep: BN, baseFactor: BN, presetParameter: PublicKey, activeId: BN, opt?: Opt): Promise<Transaction>;
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
    static createLbPair2(connection: Connection, funder: PublicKey, tokenX: PublicKey, tokenY: PublicKey, presetParameter: PublicKey, activeId: BN, opt?: Opt): Promise<Transaction>;
    /**
     * The function `refetchStates` retrieves and updates various states and data related to bin arrays
     * and lb pairs.
     */
    refetchStates(): Promise<void>;
    /**
     * Set the status of a permissionless LB pair to either enabled or disabled. This require pool field `creator_pool_on_off_control` to be true and type `CustomizablePermissionless`.
     * Pool creator can enable/disable the pair anytime before the pool is opened / activated. Once the pool activation time is passed, the pool creator can only enable the pair.
     * Useful for token launches which do not have fixed activation time.
     * @param enable If true, the pair will be enabled. If false, the pair will be disabled.
     * @param creator The public key of the pool creator.
     * @returns a Promise that resolves to the transaction.
     */
    setPairStatusPermissionless(enable: boolean, creator: PublicKey): Promise<Transaction>;
    /**
     * The function `getBinArrays` returns an array of `BinArrayAccount` objects
     * @returns a Promise that resolves to an array of BinArrayAccount objects.
     */
    getBinArrays(): Promise<BinArrayAccount[]>;
    /**
     * The function `getBinArrayAroundActiveBin` retrieves a specified number of `BinArrayAccount`
     * objects from the blockchain, based on the active bin and its surrounding bin arrays.
     * @param
     *    swapForY - The `swapForY` parameter is a boolean value that indicates whether the swap is using quote token as input.
     *    [count=4] - The `count` parameter is the number of bin arrays to retrieve on left and right respectively. By default, it is set to 4.
     * @returns an array of `BinArrayAccount` objects.
     */
    getBinArrayForSwap(swapForY: any, count?: number): Promise<BinArrayAccount[]>;
    /**
     * The function `calculateFeeInfo` calculates the base fee rate percentage and maximum fee rate percentage
     * given the base factor, bin step, and optional base fee power factor.
     * @param baseFactor - The base factor of the pair.
     * @param binStep - The bin step of the pair.
     * @param baseFeePowerFactor - Optional parameter to allow small bin step to have bigger fee rate. Default to 0.
     * @returns an object of type `Omit<FeeInfo, "protocolFeePercentage">` with the following properties: baseFeeRatePercentage and maxFeeRatePercentage.
     */
    static calculateFeeInfo(baseFactor: number | string, binStep: number | string, baseFeePowerFactor?: number | string): Omit<FeeInfo, "protocolFeePercentage">;
    /**
     * The function `getFeeInfo` calculates and returns the base fee rate percentage, maximum fee rate
     * percentage, and protocol fee percentage.
     * @returns an object of type `FeeInfo` with the following properties: baseFeeRatePercentage, maxFeeRatePercentage, and protocolFeePercentage.
     */
    getFeeInfo(): FeeInfo;
    /**
     * The function calculates and returns a dynamic fee
     * @returns a Decimal value representing the dynamic fee.
     */
    getDynamicFee(): Decimal;
    /**
     * The function `getEmissionRate` returns the emission rates for two rewards.
     * @returns an object of type `EmissionRate`. The object has two properties: `rewardOne` and
     * `rewardTwo`, both of which are of type `Decimal`.
     */
    getEmissionRate(): EmissionRate;
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
    getBinsAroundActiveBin(numberOfBinsToTheLeft: number, numberOfBinsToTheRight: number): Promise<{
        activeBin: number;
        bins: BinLiquidity[];
    }>;
    /**
     * The function `getBinsBetweenMinAndMaxPrice` retrieves a list of bins within a specified price
     * range.
     * @param {number} minPrice - The minimum price value for filtering the bins.
     * @param {number} maxPrice - The `maxPrice` parameter is the maximum price value that you want to
     * use for filtering the bins.
     * @returns an object with two properties: "activeBin" and "bins". The value of "activeBin" is the
     * active bin ID of the lbPair, and the value of "bins" is an array of BinLiquidity objects.
     */
    getBinsBetweenMinAndMaxPrice(minPrice: number, maxPrice: number): Promise<{
        activeBin: number;
        bins: BinLiquidity[];
    }>;
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
    getBinsBetweenLowerAndUpperBound(lowerBinId: number, upperBinId: number, lowerBinArray?: BinArray, upperBinArray?: BinArray): Promise<{
        activeBin: number;
        bins: BinLiquidity[];
    }>;
    /**
     * The function converts a real price of bin to a lamport value
     * @param {number} price - The `price` parameter is a number representing the price of a token.
     * @returns {string} price per Lamport of bin
     */
    toPricePerLamport(price: number): string;
    /**
     * The function converts a price per lamport value to a real price of bin
     * @param {number} pricePerLamport - The parameter `pricePerLamport` is a number representing the
     * price per lamport.
     * @returns {string} real price of bin
     */
    fromPricePerLamport(pricePerLamport: number): string;
    /**
     * The function retrieves the active bin ID and its corresponding price.
     * @returns an object with two properties: "binId" which is a number, and "price" which is a string.
     */
    getActiveBin(): Promise<BinLiquidity>;
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
    getBinIdFromPrice(price: number, min: boolean): number;
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
    getPositionsByUserAndLbPair(userPubKey?: PublicKey): Promise<{
        activeBin: BinLiquidity;
        userPositions: Array<LbPosition>;
    }>;
    quoteCreatePosition({ strategy }: TQuoteCreatePositionParams): Promise<{
        binArraysCount: number;
        binArrayCost: number;
        positionCount: number;
        positionCost: number;
    }>;
    /**
     * Creates an empty position and initializes the corresponding bin arrays if needed.
     * @param param0 The settings of the requested new position.
     * @returns A promise that resolves into a transaction for creating the requested position.
     */
    createEmptyPosition({ positionPubKey, minBinId, maxBinId, user, }: {
        positionPubKey: PublicKey;
        minBinId: number;
        maxBinId: number;
        user: PublicKey;
    }): Promise<Transaction>;
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
    getPosition(positionPubKey: PublicKey): Promise<LbPosition>;
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
    initializePositionAndAddLiquidityByStrategy({ positionPubKey, totalXAmount, totalYAmount, strategy, user, slippage, }: TInitializePositionAndAddLiquidityParamsByStrategy): Promise<Transaction>;
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
    initializePositionAndAddLiquidityByWeight({ positionPubKey, totalXAmount, totalYAmount, xYAmountDistribution, user, slippage, }: TInitializePositionAndAddLiquidityParams): Promise<Transaction | Transaction[]>;
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
    addLiquidityByStrategy({ positionPubKey, totalXAmount, totalYAmount, strategy, user, slippage, }: TInitializePositionAndAddLiquidityParamsByStrategy): Promise<Transaction>;
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
    addLiquidityByWeight({ positionPubKey, totalXAmount, totalYAmount, xYAmountDistribution, user, slippage, }: TInitializePositionAndAddLiquidityParams): Promise<Transaction | Transaction[]>;
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
    removeLiquidity({ user, position, fromBinId, toBinId, bps, shouldClaimAndClose, }: {
        user: PublicKey;
        position: PublicKey;
        fromBinId: number;
        toBinId: number;
        bps: BN;
        shouldClaimAndClose?: boolean;
    }): Promise<Transaction | Transaction[]>;
    /**
     * The `closePositionIfEmpty` function closes a position if it is empty. Else, it does nothing.
     */
    closePositionIfEmpty({ owner, position, }: {
        owner: PublicKey;
        position: LbPosition;
    }): Promise<Transaction>;
    /**
     * The `closePosition` function closes a position
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     * @returns {Promise<Transaction>}
     */
    closePosition({ owner, position, }: {
        owner: PublicKey;
        position: LbPosition;
    }): Promise<Transaction>;
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
    swapQuoteExactOut(outAmount: BN, swapForY: boolean, allowedSlippage: BN, binArrays: BinArrayAccount[], maxExtraBinArrays?: number): SwapQuoteExactOut;
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
    swapQuote(inAmount: BN, swapForY: boolean, allowedSlippage: BN, binArrays: BinArrayAccount[], isPartialFill?: boolean, maxExtraBinArrays?: number): SwapQuote;
    swapExactOut({ inToken, outToken, outAmount, maxInAmount, lbPair, user, binArraysPubkey, }: SwapExactOutParams): Promise<Transaction>;
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
    swapWithPriceImpact({ inToken, outToken, inAmount, lbPair, user, priceImpact, binArraysPubkey, }: SwapWithPriceImpactParams): Promise<Transaction>;
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
    swap({ inToken, outToken, inAmount, minOutAmount, lbPair, user, binArraysPubkey, }: SwapParams): Promise<Transaction>;
    /**
     * The claimLMReward function is used to claim rewards for a specific position owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     * @returns {Promise<Transaction>} Claim LM reward transactions.
     */
    claimLMReward({ owner, position, }: {
        owner: PublicKey;
        position: LbPosition;
    }): Promise<Transaction>;
    /**
     * The `claimAllLMRewards` function is used to claim all liquidity mining rewards for a given owner
     * and their positions.
     * @param
     *    - `owner`: The public key of the owner of the positions.
     *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim rewards from.
     * @returns {Promise<Transaction[]>} Array of claim LM reward and fees transactions.
     */
    claimAllLMRewards({ owner, positions, }: {
        owner: PublicKey;
        positions: LbPosition[];
    }): Promise<Transaction[]>;
    setActivationPoint(activationPoint: BN): Promise<Transaction>;
    setPairStatus(enabled: boolean): Promise<Transaction>;
    /**
     * The function `claimSwapFee` is used to claim swap fees for a specific position owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     *    - `binRange`: The bin range to claim swap fees for. If not provided, the function claim swap fees for full range.
     * @returns {Promise<Transaction>} Claim swap fee transactions.
     */
    claimSwapFee({ owner, position, }: {
        owner: PublicKey;
        position: LbPosition;
    }): Promise<Transaction>;
    /**
     * The `claimAllSwapFee` function to claim swap fees for multiple positions owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the positions.
     *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim swap fees from.
     * @returns {Promise<Transaction[]>} Array of claim swap fee transactions.
     */
    claimAllSwapFee({ owner, positions, }: {
        owner: PublicKey;
        positions: LbPosition[];
    }): Promise<Transaction[]>;
    /**
     * The function `claimAllRewardsByPosition` allows a user to claim all rewards for a specific
     * position.
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     * @returns {Promise<Transaction[]>} Array of claim reward transactions.
     */
    claimAllRewardsByPosition({ owner, position, }: {
        owner: PublicKey;
        position: LbPosition;
    }): Promise<Transaction[]>;
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
    seedLiquidity(owner: PublicKey, seedAmount: BN, curvature: number, minPrice: number, maxPrice: number, base: PublicKey, payer: PublicKey, feeOwner: PublicKey, operator: PublicKey, lockReleasePoint: BN, shouldSeedPositionOwner?: boolean): Promise<SeedLiquidityResponse>;
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
    seedLiquiditySingleBin(payer: PublicKey, base: PublicKey, seedAmount: BN, price: number, roundingUp: boolean, positionOwner: PublicKey, feeOwner: PublicKey, operator: PublicKey, lockReleasePoint: BN, shouldSeedPositionOwner?: boolean): Promise<TransactionInstruction[]>;
    /**
     * Initializes bin arrays for the given bin array indexes if it wasn't initialized.
     *
     * @param {BN[]} binArrayIndexes - An array of bin array indexes to initialize.
     * @param {PublicKey} funder - The public key of the funder.
     * @return {Promise<TransactionInstruction[]>} An array of transaction instructions to initialize the bin arrays.
     */
    initializeBinArrays(binArrayIndexes: BN[], funder: PublicKey): Promise<TransactionInstruction[]>;
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
    initializePositionByOperator({ lowerBinId, positionWidth, owner, feeOwner, base, operator, payer, lockReleasePoint, }: {
        lowerBinId: BN;
        positionWidth: BN;
        owner: PublicKey;
        feeOwner: PublicKey;
        operator: PublicKey;
        payer: PublicKey;
        base: PublicKey;
        lockReleasePoint: BN;
    }): Promise<Transaction>;
    /**
     * The `claimAllRewards` function to claim swap fees and LM rewards for multiple positions owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the positions.
     *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim swap fees and LM rewards from.
     * @returns {Promise<Transaction[]>} Array of claim swap fee and LM reward transactions.
     */
    claimAllRewards({ owner, positions, }: {
        owner: PublicKey;
        positions: LbPosition[];
    }): Promise<Transaction[]>;
    canSyncWithMarketPrice(marketPrice: number, activeBinId: number): boolean;
    /**
     * The `syncWithMarketPrice` function is used to sync the liquidity pool with the market price.
     * @param
     *    - `marketPrice`: The market price to sync with.
     *    - `owner`: The public key of the owner of the liquidity pool.
     * @returns {Promise<Transaction>}
     */
    syncWithMarketPrice(marketPrice: number, owner: PublicKey): Promise<Transaction>;
    getMaxPriceInBinArrays(binArrayAccounts: BinArrayAccount[]): Promise<string>;
    /**
     *
     * @param swapInitiator Address of the swap initiator
     * @returns
     */
    isSwapDisabled(swapInitiator: PublicKey): boolean;
    /** Private static method */
    private static getBinArrays;
    private static processPosition;
    private static getBinsBetweenLowerAndUpperBound;
    /** Private method */
    private processXYAmountDistribution;
    private getBins;
    private binArraysToBeCreate;
    private createBinArraysIfNeeded;
    private updateVolatilityAccumulator;
    private updateReference;
    private createClaimBuildMethod;
    private createClaimSwapFeeMethod;
    private getPotentialToken2022IxDataAndAccounts;
}

/** private */
declare function derivePresetParameterWithIndex(index: BN, programId: PublicKey): [PublicKey, number];
declare function deriveLbPairWithPresetParamWithIndexKey(presetParameterKey: PublicKey, tokenX: PublicKey, tokenY: PublicKey, programId: PublicKey): [PublicKey, number];
/**
 *
 * @deprecated Use derivePresetParameter2
 */
declare function derivePresetParameter(binStep: BN, programId: PublicKey): [PublicKey, number];
declare function derivePresetParameter2(binStep: BN, baseFactor: BN, programId: PublicKey): [PublicKey, number];
declare function deriveLbPair2(tokenX: PublicKey, tokenY: PublicKey, binStep: BN, baseFactor: BN, programId: PublicKey): [PublicKey, number];
/**
 *
 * @deprecated Use deriveLbPair2
 */
declare function deriveLbPair(tokenX: PublicKey, tokenY: PublicKey, binStep: BN, programId: PublicKey): [PublicKey, number];
declare function deriveCustomizablePermissionlessLbPair(tokenX: PublicKey, tokenY: PublicKey, programId: PublicKey): [PublicKey, number];
declare function derivePermissionLbPair(baseKey: PublicKey, tokenX: PublicKey, tokenY: PublicKey, binStep: BN, programId: PublicKey): [PublicKey, number];
declare function deriveOracle(lbPair: PublicKey, programId: PublicKey): [PublicKey, number];
declare function derivePosition(lbPair: PublicKey, base: PublicKey, lowerBinId: BN, width: BN, programId: PublicKey): [PublicKey, number];
declare function deriveBinArray(lbPair: PublicKey, index: BN, programId: PublicKey): [PublicKey, number];
declare function deriveReserve(token: PublicKey, lbPair: PublicKey, programId: PublicKey): [PublicKey, number];
declare function deriveTokenBadge(mint: PublicKey, programId: PublicKey): [PublicKey, number];
declare function deriveEventAuthority(programId: PublicKey): [PublicKey, number];
declare function deriveRewardVault(lbPair: PublicKey, rewardIndex: BN, programId: PublicKey): [PublicKey, number];

/** private */
declare function isOverflowDefaultBinArrayBitmap(binArrayIndex: BN): boolean;
declare function deriveBinArrayBitmapExtension(lbPair: PublicKey, programId: PublicKey): [PublicKey, number];
declare function binIdToBinArrayIndex(binId: BN): BN;
declare function getBinArrayLowerUpperBinId(binArrayIndex: BN): BN[];
declare function isBinIdWithinBinArray(activeId: BN, binArrayIndex: BN): boolean;
declare function getBinFromBinArray(binId: number, binArray: BinArray): Bin;
declare function findNextBinArrayIndexWithLiquidity(swapForY: boolean, activeId: BN, lbPairState: LbPair, binArrayBitmapExtension: BinArrayBitmapExtension | null): BN | null;
declare function findNextBinArrayWithLiquidity(swapForY: boolean, activeBinId: BN, lbPairState: LbPair, binArrayBitmapExtension: BinArrayBitmapExtension | null, binArrays: BinArrayAccount[]): BinArrayAccount | null;
/**
 * Retrieves the bin arrays required to initialize multiple positions in continuous range.
 *
 * @param {PublicKey} pair - The public key of the pair.
 * @param {BN} fromBinId - The starting bin ID.
 * @param {BN} toBinId - The ending bin ID.
 * @return {[{key: PublicKey, index: BN }]} An array of bin arrays required for the given position range.
 */
declare function getBinArraysRequiredByPositionRange(pair: PublicKey, fromBinId: BN, toBinId: BN, programId: PublicKey): {
    key: PublicKey;
    index: BN;
}[];
declare function enumerateBins(binsById: Map<number, Bin>, lowerBinId: number, upperBinId: number, binStep: number, baseTokenDecimal: number, quoteTokenDecimal: number, version: number): Generator<BinLiquidity, void, unknown>;

declare function getPriceOfBinByBinId(binId: number, binStep: number): Decimal;
/** private */
declare function toWeightDistribution(amountX: BN, amountY: BN, distributions: {
    binId: number;
    xAmountBpsOfTotal: BN;
    yAmountBpsOfTotal: BN;
}[], binStep: number): {
    binId: number;
    weight: number;
}[];
declare function calculateSpotDistribution(activeBin: number, binIds: number[]): {
    binId: number;
    xAmountBpsOfTotal: BN;
    yAmountBpsOfTotal: BN;
}[];
declare function calculateBidAskDistribution(activeBin: number, binIds: number[]): {
    binId: number;
    xAmountBpsOfTotal: BN;
    yAmountBpsOfTotal: BN;
}[];
declare function calculateNormalDistribution(activeBin: number, binIds: number[]): {
    binId: number;
    xAmountBpsOfTotal: BN;
    yAmountBpsOfTotal: BN;
}[];
/**
 * Converts a weight distribution into token amounts for one side (either bid or ask).
 *
 * @param amount - The total amount of liquidity to distribute.
 * @param distributions - The array of weight distributions for each bin.
 * @param binStep - The step interval between bin ids.
 * @param activeId - The id of the active bin.
 * @param depositForY - Flag indicating if the deposit is for token Y (bid side).
 * @param mint - Mint information for the token. Mint Y if depositForY is true, else Mint X. Get from DLMM instance.
 * @param clock - Clock instance for the current epoch. Get from DLMM instance.
 * @returns An array of objects containing binId and amount for each bin.
 */
declare function fromWeightDistributionToAmountOneSide(amount: BN, distributions: {
    binId: number;
    weight: number;
}[], binStep: number, activeId: number, depositForY: boolean, mint: Mint, clock: Clock): {
    binId: number;
    amount: BN;
}[];
/**
 * Converts a weight distribution into token amounts for both bid and ask sides.
 *
 * @param amountX - The total amount of token X to distribute.
 * @param amountY - The total amount of token Y to distribute.
 * @param distributions - The array of weight distributions for each bin.
 * @param binStep - The step interval between bin ids.
 * @param activeId - The id of the active bin.
 * @param amountXInActiveBin - The amount of token X in the active bin.
 * @param amountYInActiveBin - The amount of token Y in the active bin.
 * @param mintX - Mint information for token X. Get from DLMM instance.
 * @param mintY - Mint information for token Y. Get from DLMM instance.
 * @param clock - Clock instance for the current epoch. Get from DLMM instance.
 * @returns An array of objects containing binId, amountX, and amountY for each bin.
 */
declare function fromWeightDistributionToAmount(amountX: BN, amountY: BN, distributions: {
    binId: number;
    weight: number;
}[], binStep: number, activeId: number, amountXInActiveBin: BN, amountYInActiveBin: BN, mintX: Mint, mintY: Mint, clock: Clock): {
    binId: number;
    amountX: BN;
    amountY: BN;
}[];

declare function getBaseFee(binStep: number, sParameter: sParameters): BN;
declare function getVariableFee(binStep: number, sParameter: sParameters, vParameter: vParameters): BN;
declare function getTotalFee(binStep: number, sParameter: sParameters, vParameter: vParameters): BN;
declare function computeFee(binStep: number, sParameter: sParameters, vParameter: vParameters, inAmount: BN): BN;
declare function computeFeeFromAmount(binStep: number, sParameter: sParameters, vParameter: vParameters, inAmountWithFees: BN): BN;
declare function computeProtocolFee(feeAmount: BN, sParameter: sParameters): BN;
declare function swapExactOutQuoteAtBin(bin: Bin, binStep: number, sParameter: sParameters, vParameter: vParameters, outAmount: BN, swapForY: boolean): {
    amountIn: BN;
    amountOut: BN;
    fee: BN;
    protocolFee: BN;
};
declare function swapExactInQuoteAtBin(bin: Bin, binStep: number, sParameter: sParameters, vParameter: vParameters, inAmount: BN, swapForY: boolean): {
    amountIn: BN;
    amountOut: BN;
    fee: BN;
    protocolFee: BN;
};

/**
 * Distribute totalAmount to all bid side bins according to given distributions.
 * @param activeId active bin id
 * @param totalAmount total amount of token Y to be distributed
 * @param distributions weight distribution of each bin
 * @param mintY mint of token Y, get from DLMM instance
 * @param clock clock of the program, for calculating transfer fee, get from DLMM instance
 * @returns array of {binId, amount} where amount is the amount of token Y in each bin
 */
declare function toAmountBidSide(activeId: number, totalAmount: BN, distributions: {
    binId: number;
    weight: number;
}[], mintY: Mint, clock: Clock): {
    binId: number;
    amount: BN;
}[];
/**
 * Distribute totalAmount to all ask side bins according to given distributions.
 * @param activeId active bin id
 * @param totalAmount total amount of token Y to be distributed
 * @param distributions weight distribution of each bin
 * @param mintX mint of token X, get from DLMM instance
 * @param clock clock of the program, for calculating transfer fee, get from DLMM instance
 * @returns array of {binId, amount} where amount is the amount of token X in each bin
 */
declare function toAmountAskSide(activeId: number, binStep: number, totalAmount: BN, distributions: {
    binId: number;
    weight: number;
}[], mintX: Mint, clock: Clock): {
    binId: number;
    amount: BN;
}[];
/**
 * Distributes the given amounts of tokens X and Y to both bid and ask side bins
 * based on the provided weight distributions.
 *
 * @param activeId - The id of the active bin.
 * @param binStep - The step interval between bin ids.
 * @param amountX - Total amount of token X to distribute.
 * @param amountY - Total amount of token Y to distribute.
 * @param amountXInActiveBin - Amount of token X already in the active bin.
 * @param amountYInActiveBin - Amount of token Y already in the active bin.
 * @param distributions - Array of bins with their respective weight distributions.
 * @param mintX - Mint information for token X. Get from DLMM instance.
 * @param mintY - Mint information for token Y. Get from DLMM instance.
 * @param clock - Clock instance. Get from DLMM instance.
 * @returns An array of objects containing binId, amountX, and amountY for each bin.
 */
declare function toAmountBothSide(activeId: number, binStep: number, amountX: BN, amountY: BN, amountXInActiveBin: BN, amountYInActiveBin: BN, distributions: {
    binId: number;
    weight: number;
}[], mintX: Mint, mintY: Mint, clock: Clock): {
    binId: number;
    amountX: BN;
    amountY: BN;
}[];
declare function autoFillYByWeight(activeId: number, binStep: number, amountX: BN, amountXInActiveBin: BN, amountYInActiveBin: BN, distributions: {
    binId: number;
    weight: number;
}[]): BN;
declare function autoFillXByWeight(activeId: number, binStep: number, amountY: BN, amountXInActiveBin: BN, amountYInActiveBin: BN, distributions: {
    binId: number;
    weight: number;
}[]): BN;

/**
 * Given a strategy type and amounts of X and Y, returns the distribution of liquidity.
 * @param activeId The bin id of the active bin.
 * @param binStep The step size of each bin.
 * @param minBinId The min bin id.
 * @param maxBinId The max bin id.
 * @param amountX The amount of X token to deposit.
 * @param amountY The amount of Y token to deposit.
 * @param amountXInActiveBin The amount of X token in the active bin.
 * @param amountYInActiveBin The amount of Y token in the active bin.
 * @param strategyType The strategy type.
 * @param mintX The mint info of X token. Get from DLMM instance.
 * @param mintY The mint info of Y token. Get from DLMM instance.
 * @param clock The clock info. Get from DLMM instance.
 * @returns The distribution of liquidity.
 */
declare function toAmountsBothSideByStrategy(activeId: number, binStep: number, minBinId: number, maxBinId: number, amountX: BN, amountY: BN, amountXInActiveBin: BN, amountYInActiveBin: BN, strategyType: StrategyType, mintX: Mint, mintY: Mint, clock: Clock): {
    binId: number;
    amountX: BN;
    amountY: BN;
}[];
declare function autoFillYByStrategy(activeId: number, binStep: number, amountX: BN, amountXInActiveBin: BN, amountYInActiveBin: BN, minBinId: number, maxBinId: number, strategyType: StrategyType): BN;
declare function autoFillXByStrategy(activeId: number, binStep: number, amountY: BN, amountXInActiveBin: BN, amountYInActiveBin: BN, minBinId: number, maxBinId: number, strategyType: StrategyType): BN;
declare function toStrategyParameters({ maxBinId, minBinId, strategyType, singleSidedX, }: StrategyParameters): {
    minBinId: number;
    maxBinId: number;
    strategyType: {
        spotImBalanced: {};
        curveImBalanced?: undefined;
        bidAskImBalanced?: undefined;
    };
    parameteres: number[];
} | {
    minBinId: number;
    maxBinId: number;
    strategyType: {
        curveImBalanced: {};
        spotImBalanced?: undefined;
        bidAskImBalanced?: undefined;
    };
    parameteres: number[];
} | {
    minBinId: number;
    maxBinId: number;
    strategyType: {
        bidAskImBalanced: {};
        spotImBalanced?: undefined;
        curveImBalanced?: undefined;
    };
    parameteres: number[];
};

/**
 * It fetches the pool account from the AMM program, and returns the mint addresses for the two tokens
 * @param {Connection} connection - Connection - The connection to the Solana cluster
 * @param {string} poolAddress - The address of the pool account.
 * @returns The tokenAMint and tokenBMint addresses for the pool.
 */
declare function getTokensMintFromPoolAddress(connection: Connection, poolAddress: string, opt?: {
    cluster?: Cluster;
    programId?: PublicKey;
}): Promise<{
    tokenXMint: PublicKey;
    tokenYMint: PublicKey;
}>;
declare function getTokenProgramId(lbPairState: LbPair): {
    tokenXProgram: PublicKey;
    tokenYProgram: PublicKey;
};

declare function chunks<T>(array: T[], size: number): T[][];
declare function range<T>(min: number, max: number, mapfn: (i: number) => T): T[];
declare function chunkedFetchMultiplePoolAccount(program: ClmmProgram, pks: PublicKey[], chunkSize?: number): Promise<{
    parameters: {
        baseFactor: number;
        filterPeriod: number;
        decayPeriod: number;
        reductionFactor: number;
        variableFeeControl: number;
        maxVolatilityAccumulator: number;
        minBinId: number;
        maxBinId: number;
        protocolShare: number;
        baseFeePowerFactor: number;
        padding: number[];
    };
    vParameters: {
        volatilityAccumulator: number;
        volatilityReference: number;
        indexReference: number;
        padding: number[];
        lastUpdateTimestamp: BN;
        padding1: number[];
    };
    bumpSeed: number[];
    binStepSeed: number[];
    pairType: number;
    activeId: number;
    binStep: number;
    status: number;
    requireBaseFactorSeed: number;
    baseFactorSeed: number[];
    activationType: number;
    creatorPoolOnOffControl: number;
    tokenXMint: PublicKey;
    tokenYMint: PublicKey;
    reserveX: PublicKey;
    reserveY: PublicKey;
    protocolFee: {
        amountX: BN;
        amountY: BN;
    };
    padding1: number[];
    rewardInfos: {
        mint: PublicKey;
        vault: PublicKey;
        funder: PublicKey;
        rewardDuration: BN;
        rewardDurationEnd: BN;
        rewardRate: BN;
        lastUpdateTime: BN;
        cumulativeSecondsWithEmptyLiquidityReward: BN;
    }[];
    oracle: PublicKey;
    binArrayBitmap: BN[];
    lastUpdatedAt: BN;
    padding2: number[];
    preActivationSwapAddress: PublicKey;
    baseKey: PublicKey;
    activationPoint: BN;
    preActivationDuration: BN;
    padding3: number[];
    padding4: BN;
    creator: PublicKey;
    tokenMintXProgramFlag: number;
    tokenMintYProgramFlag: number;
    reserved: number[];
}[]>;
declare function chunkedFetchMultipleBinArrayBitmapExtensionAccount(program: ClmmProgram, pks: PublicKey[], chunkSize?: number): Promise<{
    lbPair: PublicKey;
    positiveBinArrayBitmap: BN[][];
    negativeBinArrayBitmap: BN[][];
}[]>;
declare function getOutAmount(bin: Bin, inAmount: BN, swapForY: boolean): BN;
declare function getTokenDecimals(conn: Connection, mint: PublicKey): Promise<number>;
declare const getOrCreateATAInstruction: (connection: Connection, tokenMint: PublicKey, owner: PublicKey, programId?: PublicKey, payer?: PublicKey, allowOwnerOffCurve?: boolean) => Promise<GetOrCreateATAResponse>;
declare function getTokenBalance(conn: Connection, tokenAccount: PublicKey): Promise<bigint>;
declare const parseLogs: <T>(eventParser: EventParser, logs: string[]) => T;
declare const wrapSOLInstruction: (from: PublicKey, to: PublicKey, amount: bigint) => TransactionInstruction[];
declare const unwrapSOLInstruction: (owner: PublicKey, allowOwnerOffCurve?: boolean) => Promise<TransactionInstruction>;
declare function chunkedGetMultipleAccountInfos(connection: Connection, pks: PublicKey[], chunkSize?: number): Promise<_solana_web3_js.AccountInfo<Buffer<ArrayBufferLike>>[]>;
/**
 * Gets the estimated compute unit usage with a buffer.
 * @param connection A Solana connection object.
 * @param instructions The instructions of the transaction to simulate.
 * @param feePayer The public key of the fee payer.
 * @param buffer The buffer to add to the estimated compute unit usage. Max value is 1. Default value is 0.1 if not provided, and will be capped between 50k - 200k.
 * @returns The estimated compute unit usage with the buffer.
 */
declare const getEstimatedComputeUnitUsageWithBuffer: (connection: Connection, instructions: TransactionInstruction[], feePayer: PublicKey, buffer?: number) => Promise<number>;
/**
 * Gets the estimated compute unit usage with a buffer and converts it to a SetComputeUnitLimit instruction.
 * If the estimated compute unit usage cannot be retrieved, returns a SetComputeUnitLimit instruction with the fallback unit.
 * @param connection A Solana connection object.
 * @param instructions The instructions of the transaction to simulate.
 * @param feePayer The public key of the fee payer.
 * @param buffer The buffer to add to the estimated compute unit usage. Max value is 1. Default value is 0.1 if not provided, and will be capped between 50k - 200k.
 * @returns A SetComputeUnitLimit instruction with the estimated compute unit usage.
 */
declare const getEstimatedComputeUnitIxWithBuffer: (connection: Connection, instructions: TransactionInstruction[], feePayer: PublicKey, buffer?: number) => Promise<TransactionInstruction>;

type Codes = (typeof IDL.errors)[number]["code"];
declare class DLMMError extends Error {
    errorCode: number;
    errorName: string;
    errorMessage: string;
    constructor(error: object | Codes);
}
type ErrorName = "SWAP_QUOTE_INSUFFICIENT_LIQUIDITY" | "INVALID_MAX_EXTRA_BIN_ARRAYS";
declare class DlmmSdkError extends Error {
    name: ErrorName;
    message: string;
    constructor(name: ErrorName, message: string);
}

declare const LBCLMM_PROGRAM_IDS: {
    devnet: string;
    localhost: string;
    "mainnet-beta": string;
};
declare const ADMIN: {
    devnet: string;
    localhost: string;
};
declare enum Network {
    MAINNET = "mainnet-beta",
    TESTNET = "testnet",
    DEVNET = "devnet",
    LOCAL = "localhost"
}
declare const BASIS_POINT_MAX = 10000;
declare const SCALE_OFFSET = 64;
declare const SCALE: BN;
declare const FEE_PRECISION: BN;
declare const MAX_FEE_RATE: BN;
declare const BIN_ARRAY_FEE = 0.07054656;
declare const POSITION_FEE = 0.0565152;
declare const MAX_BIN_ARRAY_SIZE: BN;
declare const MAX_BIN_PER_POSITION: BN;
declare const BIN_ARRAY_BITMAP_SIZE: BN;
declare const EXTENSION_BINARRAY_BITMAP_SIZE: BN;
declare const SIMULATION_USER: PublicKey;
declare const PRECISION = 18446744073709552000;
declare const MAX_CLAIM_ALL_ALLOWED = 3;
declare const MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX = 26;
declare const MAX_BIN_PER_TX = 69;
declare const MAX_ACTIVE_BIN_SLIPPAGE = 3;
declare const ILM_BASE: PublicKey;
declare const MAX_EXTRA_BIN_ARRAYS = 3;
declare const U64_MAX: BN;

export { ADMIN, ActionType, ActivationType, BASIS_POINT_MAX, BIN_ARRAY_BITMAP_SIZE, BIN_ARRAY_FEE, Bin, BinAndAmount, BinArray, BinArrayAccount, BinArrayBitmapExtension, BinArrayBitmapExtensionAccount, BinLiquidity, BinLiquidityDistribution, BinLiquidityReduction, BitmapType, ClmmProgram, Clock, ClockLayout, CompressedBinDepositAmount, CompressedBinDepositAmounts, DLMMError, DlmmSdkError, EXTENSION_BINARRAY_BITMAP_SIZE, EmissionRate, FEE_PRECISION, FeeInfo, GetOrCreateATAResponse, IAccountsCache, IDL, ILM_BASE, InitCustomizablePermissionlessPairIx, InitPermissionPairIx, LBCLMM_PROGRAM_IDS, LMRewards, LbClmm, LbPair, LbPairAccount, LbPosition, LiquidityOneSideParameter, LiquidityParameter, LiquidityParameterByStrategy, LiquidityParameterByStrategyOneSide, LiquidityParameterByWeight, MAX_ACTIVE_BIN_SLIPPAGE, MAX_BIN_ARRAY_SIZE, MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX, MAX_BIN_PER_POSITION, MAX_BIN_PER_TX, MAX_CLAIM_ALL_ALLOWED, MAX_EXTRA_BIN_ARRAYS, MAX_FEE_RATE, MEMO_PROGRAM_ID, Network, POSITION_FEE, POSITION_V2_DISC, PRECISION, PairLockInfo, PairStatus, PairType, Position, PositionBinData, PositionData, PositionInfo, PositionLockInfo, PositionV2, PositionVersion, PresetParameter, PresetParameter2, ProgramStrategyParameter, ProgramStrategyType, RemainingAccountInfo, RemainingAccountsInfoSlice, SCALE, SCALE_OFFSET, SIMULATION_USER, SeedLiquidityResponse, Strategy, StrategyParameters, StrategyType, SwapExactOutParams, SwapFee, SwapParams, SwapQuote, SwapQuoteExactOut, SwapWithPriceImpactParams, TInitializePositionAndAddLiquidityParams, TInitializePositionAndAddLiquidityParamsByStrategy, TQuoteCreatePositionParams, TokenReserve, U64_MAX, UserFeeInfo, UserRewardInfo, autoFillXByStrategy, autoFillXByWeight, autoFillYByStrategy, autoFillYByWeight, binIdToBinArrayIndex, calculateBidAskDistribution, calculateNormalDistribution, calculateSpotDistribution, chunkedFetchMultipleBinArrayBitmapExtensionAccount, chunkedFetchMultiplePoolAccount, chunkedGetMultipleAccountInfos, chunks, computeFee, computeFeeFromAmount, computeProtocolFee, DLMM as default, deriveBinArray, deriveBinArrayBitmapExtension, deriveCustomizablePermissionlessLbPair, deriveEventAuthority, deriveLbPair, deriveLbPair2, deriveLbPairWithPresetParamWithIndexKey, deriveOracle, derivePermissionLbPair, derivePosition, derivePresetParameter, derivePresetParameter2, derivePresetParameterWithIndex, deriveReserve, deriveRewardVault, deriveTokenBadge, enumerateBins, findNextBinArrayIndexWithLiquidity, findNextBinArrayWithLiquidity, fromWeightDistributionToAmount, fromWeightDistributionToAmountOneSide, getBaseFee, getBinArrayLowerUpperBinId, getBinArraysRequiredByPositionRange, getBinFromBinArray, getEstimatedComputeUnitIxWithBuffer, getEstimatedComputeUnitUsageWithBuffer, getOrCreateATAInstruction, getOutAmount, getPriceOfBinByBinId, getTokenBalance, getTokenDecimals, getTokenProgramId, getTokensMintFromPoolAddress, getTotalFee, getVariableFee, isBinIdWithinBinArray, isOverflowDefaultBinArrayBitmap, parseLogs, range, sParameters, swapExactInQuoteAtBin, swapExactOutQuoteAtBin, toAmountAskSide, toAmountBidSide, toAmountBothSide, toAmountsBothSideByStrategy, toStrategyParameters, toWeightDistribution, unwrapSOLInstruction, vParameters, wrapSOLInstruction };
