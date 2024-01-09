import { AddressType, CHAIN_ID } from 'src/typings'

export type L2ChainType =
  | CHAIN_ID.OPTIMISM
  | CHAIN_ID.OPTIMISM_GOERLI
  | CHAIN_ID.BASE
  | CHAIN_ID.BASE_GOERLI
  | CHAIN_ID.ZORA
  | CHAIN_ID.ZORA_GOERLI

export const PUBLIC_MANAGER_ADDRESS = {
  [CHAIN_ID.ETHEREUM]: '0xd310a3041dfcf14def5ccbc508668974b5da7174' as AddressType,
  [CHAIN_ID.OPTIMISM]: '0x3ac0E64Fe2931f8e082C6Bb29283540DE9b5371C' as AddressType,
  [CHAIN_ID.GOERLI]: '0x0E9F3382Cf2508E3bc83248B5b4707FbA86D7Ee0' as AddressType,
  [CHAIN_ID.OPTIMISM_GOERLI]: '0x5f9c1e7E31875beAa6ba6B0AB573a4AbEcC95d67' as AddressType,
  [CHAIN_ID.BASE]: '0x3ac0e64fe2931f8e082c6bb29283540de9b5371c' as AddressType,
  [CHAIN_ID.BASE_GOERLI]: '0xcce64c2b4c51c2894fe5df0dda3e34e4d850b699' as AddressType,
  [CHAIN_ID.ZORA]: '0x3ac0E64Fe2931f8e082C6Bb29283540DE9b5371C' as AddressType,
  [CHAIN_ID.ZORA_GOERLI]: '0xc521f85613985b7e417fccd5b348f64263d79397' as AddressType,
  [CHAIN_ID.FOUNDRY]: '0xd310a3041dfcf14def5ccbc508668974b5da7174' as AddressType,
}

export const PUBLIC_L1_BRIDGE_ADDRESS = {
  [CHAIN_ID.OPTIMISM]: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed' as AddressType,
  [CHAIN_ID.OPTIMISM_GOERLI]: '0x5b47E1A08Ea6d985D6649300584e6722Ec4B1383' as AddressType,
  [CHAIN_ID.BASE]: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e' as AddressType,
  [CHAIN_ID.BASE_GOERLI]: '0xe93c8cD0D409341205A592f8c4Ac1A5fe5585cfA' as AddressType,
  [CHAIN_ID.ZORA]: '0x1a0ad011913A150f69f6A19DF447A0CfD9551054' as AddressType,
  [CHAIN_ID.ZORA_GOERLI]: '0xDb9F51790365e7dc196e7D072728df39Be958ACe' as AddressType,
}

export const PUBLIC_BUILDER_ADDRESS = {
  [CHAIN_ID.ETHEREUM]: '0xDC9b96Ea4966d063Dd5c8dbaf08fe59062091B6D' as AddressType, // builder treasury address
  [CHAIN_ID.GOERLI]: '0xc2fff40D3e3468fD85dca6B09e41961edd9381cD' as AddressType,
}

export const PUBLIC_NOUNS_ADDRESS = {
  [CHAIN_ID.ETHEREUM]: '0x0BC3807Ec262cB779b38D65b38158acC3bfedE10' as AddressType, // nouns treasury address
  [CHAIN_ID.GOERLI]: '0x0BC3807Ec262cB779b38D65b38158acC3bfedE10' as AddressType,
}

export const PUBLIC_ZORA_NFT_CREATOR = {
  [CHAIN_ID.ETHEREUM]: '0xF74B146ce44CC162b601deC3BE331784DB111DC1' as AddressType,
  [CHAIN_ID.OPTIMISM]: '0x7d1a46c6e614A0091c39E102F2798C27c1fA8892' as AddressType,
  [CHAIN_ID.GOERLI]: '0xb9583D05Ba9ba8f7F14CCEe3Da10D2bc0A72f519' as AddressType,
  [CHAIN_ID.OPTIMISM_GOERLI]: '0x3C1ebcF36Ca9DD9371c9aA99c274e4988906c6E3' as AddressType,
  [CHAIN_ID.BASE]: '0x58C3ccB2dcb9384E5AB9111CD1a5DEA916B0f33c' as AddressType,
  [CHAIN_ID.BASE_GOERLI]: '0x87cfd516c5ea86e50b950678CA970a8a28de27ac' as AddressType,
  [CHAIN_ID.ZORA]: '0xA2c2A96A232113Dd4993E8b048EEbc3371AE8d85' as AddressType,
  [CHAIN_ID.ZORA_GOERLI]: '0xeB29A4e5b84fef428c072debA2444e93c080CE87' as AddressType,
  [CHAIN_ID.FOUNDRY]: '0xF74B146ce44CC162b601deC3BE331784DB111DC1' as AddressType,
}

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000' as AddressType

export const MERKLE_RESERVE_MINTER =
  '0xa09790dba70fdad041c0901604c09a5c9efe2a9c' as AddressType

export const MERKLE_METADATA_RENDERER =
  '0xc422f3f254a86ee369066007bb3c5751cc29c95c' as AddressType

export const L2_MIGRATION_DEPLOYER =
  '0xed98171590dba48f6596f4743c2b7300a7091f9e' as AddressType

export const L1_MESSENGERS = {
  [CHAIN_ID.ETHEREUM]: '0x0000000000000000000000000000000000000000' as AddressType,
  [CHAIN_ID.GOERLI]: '0x0000000000000000000000000000000000000000' as AddressType,
  [CHAIN_ID.BASE]: '0x866E82a600A1414e583f7F13623F1aC5d58b0Afa' as AddressType,
  [CHAIN_ID.BASE_GOERLI]: '0x8e5693140eA606bcEB98761d9beB1BC87383706D' as AddressType,
  [CHAIN_ID.OPTIMISM]: '0xDa2332D0a7608919Cd331B1304Cd179129a90495' as AddressType,
  [CHAIN_ID.OPTIMISM_GOERLI]: '0xDa2332D0a7608919Cd331B1304Cd179129a90495' as AddressType,
  [CHAIN_ID.ZORA]: '0x363B4B1ADa52E50353f746999bd9E94395190d2C' as AddressType,
  [CHAIN_ID.ZORA_GOERLI]: '0x9779A9D2f3B66A4F4d27cB99Ab6cC1266b3Ca9af' as AddressType,
  [CHAIN_ID.FOUNDRY]: '0x0000000000000000000000000000000000000000' as AddressType,
}
