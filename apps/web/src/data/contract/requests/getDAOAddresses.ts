import { readContract } from 'wagmi/actions'

import { NULL_ADDRESS, PUBLIC_MANAGER_ADDRESS } from 'src/constants/addresses'
import { AddressType, CHAIN_ID } from 'src/typings'
import { unpackOptionalArray } from 'src/utils/helpers'

import { managerAbi } from '../abis'
import { getDaoMultiSig } from './getDAOMultisig'

const getDAOAddresses = async (chainId: CHAIN_ID, tokenAddress: AddressType) => {
  const addresses = await readContract({
    abi: managerAbi,
    address: PUBLIC_MANAGER_ADDRESS[chainId],
    functionName: 'getAddresses',
    args: [tokenAddress],
    chainId,
  })

  const [metadata, auction, treasury, governor] = unpackOptionalArray(addresses, 4)

  const multiSig = await getDaoMultiSig(governor as AddressType, chainId)

  const hasMissingAddresses = Object.values(addresses).includes(NULL_ADDRESS)
  if (hasMissingAddresses) return null

  console.log({
    token: tokenAddress,
    auction,
    governor,
    metadata,
    treasury,
    multiSig,
  })

  return {
    token: tokenAddress,
    auction,
    governor,
    metadata,
    treasury,
    multiSig,
  }
}

export default getDAOAddresses
