import axios from 'axios'
import { Address, getAddress, pad, trim } from 'viem'

import { CHAIN_ID } from 'src/typings'

import { getProvider } from '../utils/provider'
import { BackendFailedError, InvalidRequestError, NotFoundError } from './errors'

const EIP1967_PROXY_STORAGE_SLOT =
  '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'

const getRedisKey = (chain: string, address: string) => `${chain}:${address}`

export type ContractABIResult = {
  abi: string
  address: string
  fetchedAddress: string
  source: 'fetched' | 'cache'
}

const CHAIN_API_LOOKUP: Record<CHAIN_ID, string> = {
  [CHAIN_ID.ETHEREUM]: 'mainnet',
  [CHAIN_ID.OPTIMISM]: 'optimism',
  [CHAIN_ID.SEPOLIA]: 'sepolia',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: 'optimismSepolia',
  [CHAIN_ID.BASE]: 'base',
  [CHAIN_ID.BASE_SEPOLIA]: 'baseSepolia',
  [CHAIN_ID.ZORA]: 'zora',
  [CHAIN_ID.ZORA_SEPOLIA]: 'zoraSepolia',
  [CHAIN_ID.FOUNDRY]: '',
}

const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const getContractABIByAddress = async (
  chainId: CHAIN_ID,
  addressInput?: string
): Promise<ContractABIResult> => {
  if (!addressInput) {
    throw new InvalidRequestError('Invalid address')
  }

  let address: any
  try {
    address = getAddress(addressInput)
  } catch {
    throw new InvalidRequestError('Invalid address')
  }

  if (!address) {
    throw new InvalidRequestError('Invalid address')
  }

  let fetchedAddress = address

  // Only handles EIP1967 proxy slots – does not handle minimal proxies (EIP11)
  const proxyAddress = await getProvider(chainId).getStorageAt({
    address,
    slot: EIP1967_PROXY_STORAGE_SLOT,
  })

  if (proxyAddress != ZERO_BYTES32) {
    fetchedAddress = pad(trim(proxyAddress as Address), {
      size: 20,
    }) as typeof fetchedAddress
  }

  const chainIdStr = chainId.toString()

  const abidata = await axios.get(
    `https://abidata.net/${fetchedAddress}?network=${CHAIN_API_LOOKUP[chainId]}`
  )

  if (abidata.status !== 200) {
    throw new BackendFailedError('Remote request failed')
  }

  const abi = abidata.data as { ok: boolean; abi: any }

  if (abi.ok) {
    return {
      abi: JSON.stringify(abi.abi),
      fetchedAddress,
      address,
      source: 'fetched',
    }
  } else {
    throw new NotFoundError('Not verified')
  }
}
