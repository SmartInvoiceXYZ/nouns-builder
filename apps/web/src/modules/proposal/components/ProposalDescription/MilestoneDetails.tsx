import { Button, Stack, Text } from '@zoralabs/zord'
import axios from 'axios'
import { IPFS_GATEWAY } from 'ipfs-service/src/gateway'
import _ from 'lodash'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { MilestoneMetadata } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowForm.schema'
import { convertByte32ToIpfsCidV0 } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { useProposalStore } from 'src/modules/create-proposal/stores'
import { useDaoStore } from 'src/modules/dao'
import { useChainStore } from 'src/stores/useChainStore'
import { AddressType } from 'src/typings'

import { DecodedTransactionData } from './useDecodedTransactions'

type DecodedTransactionArgs = DecodedTransactionData['args']

const RELEASE_FUNCTION_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_milestone', type: 'uint256' }],
    name: 'release',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const SAFE_APP_URL =
  'https://app.safe.global/share/safe-app?appUrl=https://app.smartinvoice.xyz/invoices'

const INVOICE_QUERY = `
  query GetInvoice($txHash: String!) {
    invoices(where: {
      creationTxHash: $txHash
    }) {
      address
      id
      createdAt
      network
      creationTxHash
    }
  }
`

interface MilestoneDetailsProps {
  decodedTxnArgs: DecodedTransactionArgs
  executionTransactionHash?: string
}

interface Document {
  type: string
  src: string
}

const useNetworkConfig = () => {
  const [networkConfig, setNetworkConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadNetworkConfig = async () => {
      try {
        const { NETWORK_CONFIG } = await import('@smartinvoicexyz/constants')
        setNetworkConfig(NETWORK_CONFIG)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    loadNetworkConfig()
  }, [])

  return { networkConfig, isLoading, error }
}

export const MilestoneDetails = ({
  decodedTxnArgs,
  executionTransactionHash,
}: MilestoneDetailsProps) => {
  const router = useRouter()
  const { chain: invoiceChain } = useChainStore()
  const { addresses } = useDaoStore()
  const { addTransaction } = useProposalStore()
  const { networkConfig, isLoading, error: networkConfigError } = useNetworkConfig()

  const subgraphURL = useMemo(() => {
    return networkConfig?.[invoiceChain.id]?.SUBGRAPH
  }, [networkConfig, invoiceChain.id])

  const { data: INVOICE_ADDRESS } = useSWR(
    [subgraphURL, executionTransactionHash],
    async () => {
      const response = await axios.post(subgraphURL, {
        query: INVOICE_QUERY,
        variables: {
          txHash: executionTransactionHash,
        },
      })

      return _.get(response, 'data.data.invoices[0].address')
    }
  )

  const { invoiceCid, clientAddress, milestoneAmount } = useMemo(() => {
    const decodedAbiData = decodeAbiParameters(
      parseAbiParameters([
        'address client',
        'address resolver',
        'uint8 resolverType',
        'address token',
        'uint256 terminationTime',
        'bytes32 details',
        'address provider',
        'address providerReceiver',
        'bool requireVerification',
        'bytes32 escrowType',
      ]),
      decodedTxnArgs?._escrowData?.value as Hex
    )

    return {
      invoiceCid: convertByte32ToIpfsCidV0((decodedAbiData as never)?.[5]),
      clientAddress: (decodedAbiData as never)?.[0],
      milestoneAmount: decodedTxnArgs['_milestoneAmounts']['value']
        .split(',')
        .map((x: string) => formatEther(BigInt(x))),
    }
  }, [decodedTxnArgs])

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
    }
  )

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

  const handleReleaseMilestone = useCallback(
    async (index: number) => {
      const isClientGoverner = isAddressEqual(
        clientAddress as AddressType,
        addresses.governor as AddressType
      )
      const isClientTreasury = isAddressEqual(
        clientAddress as AddressType,
        addresses.treasury as AddressType
      )

      if (!isClientGoverner && !isClientTreasury) {
        router.replace(SAFE_APP_URL)
        return
      }

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

      setTimeout(() => addTransaction(releaseEscrowTxnData), 3000)

      router.push({
        pathname: `/dao/[network]/[token]/proposal/review`,
        query: {
          network: router.query?.network,
          token: router.query?.token,
        },
      })
    },
    [router, clientAddress, addresses, addTransaction, invoiceData?.title]
  )

  const renderMilestoneButton = useCallback(
    (index: number, isReleased: boolean, isNext: boolean) => {
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
    },
    [handleReleaseMilestone]
  )

  const renderDocumentLink = useCallback((doc: Partial<Document>) => {
    if (!doc.src) return null

    const href =
      doc.type === 'ipfs' ? doc.src.replace('ipfs://', `${IPFS_GATEWAY}/ipfs/`) : doc.src

    return (
      <OptionalLink key={doc.src} enabled={true} href={href}>
        {href}
      </OptionalLink>
    )
  }, [])

  const milestonesDetails = useMemo(() => {
    return invoiceData?.milestones?.map((milestone: MilestoneMetadata, index: number) => {
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

            <Stack>{milestone.documents?.map((doc) => renderDocumentLink(doc))}</Stack>

            {!!executionTransactionHash &&
              renderMilestoneButton(index, isReleased, isNext)}
          </Stack>
        ),
      }
    })
  }, [
    invoiceData?.milestones,
    numOfMilestonesReleased,
    milestoneAmount,
    executionTransactionHash,
    renderMilestoneButton,
    renderDocumentLink,
  ])

  if (isLoading) {
    return <div>Loading network configuration...</div>
  }

  if (networkConfigError) {
    return <div>Error loading network configuration</div>
  }

  return <Accordion items={milestonesDetails || []} />
}
