import { CHAIN_ID } from 'src/typings'

export const PUBLIC_SUBGRAPH_URL = {
  [CHAIN_ID.ETHEREUM]:
    'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-ethereum-mainnet/stable/gn',
  [CHAIN_ID.OPTIMISM]:
    'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-optimism-mainnet/stable/gn',
  [CHAIN_ID.SEPOLIA]:
    // TODO: Update to the main subgraph
    //'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-sepolia-testnet/stable/gn',
    'https://api.goldsky.com/api/public/project_cm2itwou5aapv01we2n0q698q/subgraphs/nouns-builder-sepolia/1.0.0/gn',
  [CHAIN_ID.OPTIMISM_SEPOLIA]:
    'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-optimism-sepolia/stable/gn',
  [CHAIN_ID.BASE]:
    'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-base-mainnet/stable/gn',
  [CHAIN_ID.BASE_SEPOLIA]:
    'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-base-sepolia/stable/gn',
  [CHAIN_ID.ZORA]:
    'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-zora-mainnet/stable/gn',
  [CHAIN_ID.ZORA_SEPOLIA]:
    'https://api.goldsky.com/api/public/project_clkk1ucdyf6ak38svcatie9tf/subgraphs/nouns-builder-zora-sepolia/stable/gn',
  [CHAIN_ID.FOUNDRY]:
    'https://api.thegraph.com/subgraphs/name/neokry/nouns-builder-mainnet',
}
