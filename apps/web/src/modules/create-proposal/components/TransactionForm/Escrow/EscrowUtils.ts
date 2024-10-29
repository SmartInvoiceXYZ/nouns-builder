import { decode, encode } from 'bs58'
import { Address, Hex, encodeAbiParameters } from 'viem'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { EscrowFormState, EscrowFormValues } from './EscrowForm.schema'

const KLEROS_ARBITRATION_PROVIDER =
  '0x18542245cA523DFF96AF766047fE9423E0BED3C0' as Address

export function convertIpfsCidV0ToByte32(cid: string) {
  return `0x${Buffer.from(decode(cid).slice(2)).toString('hex')}`
}

export function convertByte32ToIpfsCidV0(str: Hex) {
  let newStr: string = str
  if (str.indexOf('0x') === 0) {
    newStr = str.slice(2)
  }
  return encode(Buffer.from(`1220${newStr}`, 'hex'))
}

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
      return '0x8F9999B2d5C8DC0Eea10753E76c225843ffFc4b3' as Address
    // case 8453: // base
    //   return '0xe0D0d4927Af5cEed02146e3905bA016301194D43' as Address
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
}

function createEscrowData(
  values: EscrowFormValues,
  ipfsCID: string,
  chainId: string | number
) {
  const warappedTokenAddress = getWrappedTokenAddress(chainId)
  const terminationTime = new Date(values.safetyValveDate).getTime() / 1000
  const ipfsBytesCid = convertIpfsCidV0ToByte32(ipfsCID)

  // encode abi parameters to create escrowData
  const encodedParams = encodeAbiParameters(
    ['address', 'address', 'address', 'uint256', 'bytes32', 'address', 'address'].map(
      (type) => ({ type })
    ),
    [
      values.clientAddress,
      KLEROS_ARBITRATION_PROVIDER,
      warappedTokenAddress,
      terminationTime,
      ipfsBytesCid,
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

const initialState: EscrowFormValues = {
  clientAddress: '',
  recipientAddress: '',
  milestones: [
    {
      amount: 0.5,
      title: 'Milestone 1',
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10)
        .toISOString()
        .split('T')[0] as never,
      mediaUrl: '',
      mediaType: undefined,
      mediaFileName: '',
      description: 'About Milestone 1',
    },
  ],
  safetyValveDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    .toISOString()
    .split('T')[0],
}

const useEscrowFormStore = create(
  persist<EscrowFormState>(
    (set) => ({
      formValues: initialState,
      setFormValues: (values) => set({ formValues: values }),
      resetForm: () => set({ formValues: initialState }),
    }),
    {
      name: 'escrow-form-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export {
  createEscrowData,
  getEscrowBundler,
  KLEROS_ARBITRATION_PROVIDER,
  deployEscrowAbi,
  useEscrowFormStore,
}
