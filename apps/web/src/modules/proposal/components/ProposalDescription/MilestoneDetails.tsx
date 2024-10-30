import { Button, Stack, Text } from '@zoralabs/zord'
import axios from 'axios'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import {
  Hex,
  decodeAbiParameters,
  encodeFunctionData,
  formatEther,
  isAddressEqual,
  parseAbiParameters,
} from 'viem'
import { useContractRead } from 'wagmi'

import Accordion from 'src/components/Home/accordian'
import { Icon } from 'src/components/Icon'
import { OptionalLink } from 'src/components/OptionalLink'
import SWR_KEYS from 'src/constants/swrKeys'
import { TransactionType } from 'src/modules/create-proposal'
import { IpfsMilestone } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowForm.schema'
import { convertByte32ToIpfsCidV0 } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { useProposalStore } from 'src/modules/create-proposal/stores'
import { useDaoStore } from 'src/modules/dao'
import { useChainStore } from 'src/stores/useChainStore'
import { AddressType } from 'src/typings'

import { DecodedTransaction } from './ProposalDescription'

interface MilestoneDetailsProps {
  decodedTxnData: DecodedTransaction
  executionTransactionHash?: string
}

interface Document {
  type: string
  src: string
}

const RELEASE_FUNCTION_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_milestone', type: 'uint256' }],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

// Constants
const INVOICE_ADDRESS = '0x39f74e876f4c5c8a8e16ad2f543a3e89c3f7d784' // TODO: Get dynamically from execTxnHash
const SAFE_APP_URL =
  'https://app.safe.global/share/safe-app?appUrl=https://app.smartinvoice.xyz/invoices'

export const MilestoneDetails: React.FC<MilestoneDetailsProps> = ({
  decodedTxnData,
  executionTransactionHash,
}) => {
  const router = useRouter()
  const { chain: invoiceChain } = useChainStore()
  const { addresses } = useDaoStore()
  const { removeAllTransactions, addTransaction } = useProposalStore()

  // Decode transaction data
  const decodedAbiData = decodeAbiParameters(
    parseAbiParameters([
      'address client',
      'address resolver',
      'address token',
      'uint256 terminationTime',
      'bytes32 details',
      'address provider',
      'address providerReceiver',
    ]),
    decodedTxnData?._escrowData?.value as Hex
  )

  const invoiceCid = convertByte32ToIpfsCidV0((decodedAbiData as never)?.[4])
  const clientAddress = (decodedAbiData as never)?.[0]

  // Fetch invoice data from IPFS
  const { data: invoiceData } = useSWR(
    invoiceCid ? [SWR_KEYS.IPFS, invoiceCid] : null,
    async () => {
      try {
        const response = await axios.get(`https://ipfs.io/ipfs/${invoiceCid}`)
        return response.data
      } catch (error) {
        console.error('Failed to fetch invoice data:', error)
        return null
      }
    },
    { revalidateOnFocus: false }
  )

  // Get number of released milestones
  const { data: numOfMilestonesReleased } = useContractRead({
    address: INVOICE_ADDRESS,
    abi: [
      {
        inputs: [],
        name: 'released',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'released',
    chainId: invoiceChain.id,
  })

  const milestoneAmount = decodedTxnData['_milestoneAmounts']['value']
    .split(',')
    .map((x: string) => formatEther(BigInt(x)))

  const handleReleaseMilestone = async (index: number) => {
    const isClientGoverner = isAddressEqual(
      clientAddress as AddressType,
      addresses.governor as AddressType
    )

    if (!isClientGoverner) {
      router.replace(SAFE_APP_URL)
      return
    }

    removeAllTransactions()

    const releaseMilestone = {
      target: INVOICE_ADDRESS as AddressType,
      functionSignature: 'release(_milestone)',
      calldata: encodeFunctionData({
        abi: RELEASE_FUNCTION_ABI,
        functionName: 'release',
        args: [index],
      }),
      value: '',
    }

    const releaseEscrowTxnData = {
      type: TransactionType.RELEASE_ESCROW_MILESTONE,
      summary: `Release Milestone #${index + 1} for ${invoiceData?.title}`,
      transactions: [releaseMilestone],
    }

    addTransaction(releaseEscrowTxnData)

    // Navigate to review page with release txn loaded
    router.push({
      pathname: `/dao/[network]/[token]/proposal/review`,
      query: {
        network: router.query?.network,
        token: router.query?.token,
      },
    })
  }

  const renderMilestoneButton = (index: number, isReleased: boolean, isNext: boolean) => {
    if (isReleased) {
      return (
        <Button variant="secondary" disabled>
          <Icon id="checkInCircle" />
          Milestone Released
        </Button>
      )
    }

    return (
      <Button
        variant={isNext ? 'primary' : 'secondary'}
        disabled={!isNext}
        onClick={() => isNext && handleReleaseMilestone(index)}
      >
        Release Milestone
      </Button>
    )
  }

  const renderDocumentLink = (doc: Partial<Document>) => {
    if (!doc.src) return null

    const href =
      doc.type === 'ipfs' ? doc.src.replace('ipfs://', 'https://ipfs.io/ipfs/') : doc.src

    return (
      <OptionalLink key={doc.src} enabled={true} href={href}>
        {href}
      </OptionalLink>
    )
  }

  const milestonesDetails = invoiceData?.milestones?.map(
    (milestone: IpfsMilestone, index: number) => {
      const releasedCount = Number(numOfMilestonesReleased?.toString() || 0)
      const isReleased = releasedCount - 1 >= index
      const isNext = releasedCount === index

      return {
        title: <Text>{`${index + 1}. ${milestone.title}`}</Text>,
        description: (
          <Stack gap="x5">
            <Stack direction="row" align="center" justify="space-between">
              <Text variant="label-xs" color="tertiary">
                {`Amount: ${milestoneAmount[index]} ETH`}
              </Text>
              <Text variant="label-xs" color="tertiary">
                {`Due by: ${new Date(
                  (milestone?.endDate as number) * 1000
                ).toLocaleDateString()}`}
              </Text>
            </Stack>

            <Text>{milestone.description || 'No Description'}</Text>

            <Stack>
              {milestone.documents?.map((doc, index) => renderDocumentLink(doc))}
            </Stack>

            {executionTransactionHash && renderMilestoneButton(index, isReleased, isNext)}
          </Stack>
        ),
      }
    }
  )

  return <Accordion items={milestonesDetails || []} />
}
