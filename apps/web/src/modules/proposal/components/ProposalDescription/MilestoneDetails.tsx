import { Button, Stack, Text } from '@zoralabs/zord'
import axios from 'axios'
import useSWR from 'swr'
import { Hex, decodeAbiParameters, formatEther, parseAbiParameters } from 'viem'
import { useContractRead } from 'wagmi'

import Accordion from 'src/components/Home/accordian'
import { Icon } from 'src/components/Icon'
import { OptionalLink } from 'src/components/OptionalLink'
import SWR_KEYS from 'src/constants/swrKeys'
import { IpfsMilestone } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowForm.schema'
import { convertByte32ToIpfsCidV0 } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { useChainStore } from 'src/stores/useChainStore'

import { DecodedTransaction } from './ProposalDescription'

export const MilestoneDetails = ({
  decodedTxnData,
  executionTransactionHash,
}: {
  decodedTxnData: DecodedTransaction
  executionTransactionHash?: string
}) => {
  // Decode Calldata to get ipfs CID
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

  const { chain: invoiceChain } = useChainStore()

  console.log({ executionTransactionHash })

  const invoiceAddress = `0x39f74e876f4c5c8a8e16ad2f543a3e89c3f7d784` // TODO: Get this dynamically from execution txn hash
  const invoiceCid = convertByte32ToIpfsCidV0((decodedAbiData as never)?.[4])

  const { data: invoiceData } = useSWR(
    invoiceCid ? [SWR_KEYS.IPFS, invoiceCid] : null,
    () => axios.get(`https://ipfs.io/ipfs/${invoiceCid}`).then((x) => x.data),
    {
      revalidateOnFocus: false,
    }
  )

  const milestoneAmount = decodedTxnData['_milestoneAmounts']['value']
    .split(',')
    .map((x) => formatEther(BigInt(x)))

  const milestones: IpfsMilestone[] = invoiceData?.milestones

  const { data: numOfMilestonesReleased, isSuccess } = useContractRead({
    address: invoiceAddress,
    abi: [
      {
        inputs: [],
        name: 'released',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'released',
    chainId: invoiceChain.id,
  })

  const handleReleaseMilestone = async (index: number) => {
    // TODO: Implement release milestone
    console.log(`Milestone ${index} release attempted`)
  }

  const milestonesDetails = milestones?.map((milestone, index) => {
    return {
      title: (
        <Text>
          {index + 1}. {milestone.title}
        </Text>
      ),
      description: (
        <Stack gap={'x5'}>
          <Stack direction={'row'} align={'center'} justify={'space-between'}>
            <Text variant="label-xs" color="tertiary">
              {'Amount: ' + milestoneAmount[index] + ' ETH'}
            </Text>
            <Text variant="label-xs" color="tertiary">
              {'Due by: ' + new Date(milestone?.endDate as number).toLocaleDateString()}
            </Text>
          </Stack>
          <Text>{milestone.description || 'No Description'}</Text>
          <Stack>
            {milestone.documents?.map((doc, index) => {
              if (doc.src) {
                return (
                  <OptionalLink
                    enabled={true}
                    href={doc?.src.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                  >
                    {doc.type === 'ipfs'
                      ? doc?.src.replace('ipfs://', 'https://ipfs.io/ipfs/')
                      : doc.src}
                  </OptionalLink>
                )
              }
            })}
          </Stack>
          {/* TODO: implement create new release proposal when client is DAO */}
          {/* TODO: Open in Safe / Redirect to SI app when multisig is client */}
          {Number(numOfMilestonesReleased?.toString()) === index ? (
            <Button>Release Milestone</Button>
          ) : (
            <Button variant="secondary" disabled>
              <Icon id="check" /> Milestone Released
            </Button>
          )}
        </Stack>
      ),
    }
  })

  return <Accordion items={milestonesDetails} />
}
