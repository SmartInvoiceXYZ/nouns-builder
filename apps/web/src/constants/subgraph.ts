import { CHAIN_ID } from 'src/typings'

// TODO: Update supgraphs on the main goldsky project and fix links

export const PUBLIC_SUBGRAPH_URL = {
  [CHAIN_ID.ETHEREUM]:
    // 'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-ethereum-mainnet/stable/gn',
    'https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-ethereum-mainnet/0.0.5/gn',
  [CHAIN_ID.OPTIMISM]:
    // 'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-optimism-mainnet/stable/gn',
    'https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-optimism-mainnet/0.0.5/gn',
  [CHAIN_ID.SEPOLIA]:
    //'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-sepolia-testnet/stable/gn',
    'https://api.goldsky.com/api/public/project_cm33ek8kjx6pz010i2c3w8z25/subgraphs/nouns-builder-sepolia-testnet/0.0.5/gn',
  [CHAIN_ID.OPTIMISM_SEPOLIA]:
    // 'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-optimism-sepolia/stable/gn',
    'https://api.goldsky.com/api/public/project_cm39qflfrtz7e01xibgnuczby/subgraphs/nouns-builder-optimism-sepolia/0.0.5/gn',
  [CHAIN_ID.BASE]:
    // 'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-base-mainnet/stable/gn',
    'https://api.goldsky.com/api/public/project_cm39qflfrtz7e01xibgnuczby/subgraphs/nouns-builder-base-mainnet/0.0.5/gn',
  [CHAIN_ID.BASE_SEPOLIA]:
    // 'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-base-sepolia/stable/gn',
    'https://api.goldsky.com/api/public/project_cm39qflfrtz7e01xibgnuczby/subgraphs/nouns-builder-base-sepolia/0.0.5/gn',
  [CHAIN_ID.ZORA]:
    // 'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-zora-mainnet/stable/gn',
    'https://api.goldsky.com/api/public/project_cm3av581k8wdo01vu6fgo4cmq/subgraphs/nouns-builder-zora-mainnet/0.0.5/gn',
  [CHAIN_ID.ZORA_SEPOLIA]:
    // 'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-zora-sepolia/stable/gn',
    'https://api.goldsky.com/api/public/project_cm3av581k8wdo01vu6fgo4cmq/subgraphs/nouns-builder-zora-sepolia/0.0.5/gn',
  [CHAIN_ID.FOUNDRY]:
    'https://api.thegraph.com/subgraphs/name/neokry/nouns-builder-mainnet',
}
