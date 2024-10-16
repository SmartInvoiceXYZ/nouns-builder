import { decode } from 'bs58'
import { Address, Hex, encodeAbiParameters } from 'viem'

import { EscrowFormValues } from './EscrowForm.schema'

const KLEROS_ARBITRATION_PROVIDER =
  '0x18542245cA523DFF96AF766047fE9423E0BED3C0' as Address

function getWrappedTokenAddress(chainId: number | string): Address {
  chainId = Number(chainId)
  switch (chainId) {
    case 1: // mainnet
      return '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' as Address
    case 10: // optimism
      return '0x4200000000000000000000000000000000000006' as Address
    case 11155111: // sepolia
      return '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' as Address
    case 8453: // base
      return '0x4200000000000000000000000000000000000006' as Address
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}

function getEscrowBundler(chainId: number | string): Address {
  chainId = Number(chainId)
  switch (chainId) {
    // @notice: update these when deployed
    // case 1: // mainnet
    //   return '0xe0D0d4927Af5cEed02146e3905bA016301194D43' as Address
    // case 10: // optimism
    //   return '0xe0D0d4927Af5cEed02146e3905bA016301194D43' as Address
    case 11155111: // sepolia
      return '0xe0D0d4927Af5cEed02146e3905bA016301194D43' as Address
    // case 8453: // base
    //   return '0xe0D0d4927Af5cEed02146e3905bA016301194D43' as Address
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}

function convertIpfsCidV0ToByte32(cid: string) {
  return `0x${Buffer.from(decode(cid).slice(2)).toString('hex')}` as Hex
}

function createEscrowData(
  values: EscrowFormValues,
  ipfsCID: string,
  chainId: string | number
) {
  const encodedParams = encodeAbiParameters(
    ['address', 'address', 'address', 'uint256', 'bytes32', 'address', 'address'].map(
      (type) => ({ type })
    ),
    [
      values.clientAddress,
      KLEROS_ARBITRATION_PROVIDER,
      getWrappedTokenAddress(chainId),
      new Date(values.safetyValveDate).getTime(),
      convertIpfsCidV0ToByte32(ipfsCID),
      values.recipientAddress,
      values.recipientAddress,
    ]
  )

  return encodedParams
}

const deployEscrowAbi = [
  {
    name: 'deployEscrow',
    type: 'function',
    inputs: [
      {
        name: '_milestoneAmounts',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: '_escrowData',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: '_fundAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'escrow',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
]

export {
  createEscrowData,
  getEscrowBundler,
  KLEROS_ARBITRATION_PROVIDER,
  deployEscrowAbi,
}
