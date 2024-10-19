import { Stack, Text } from '@zoralabs/zord'
import axios from 'axios'
import useSWR from 'swr'
import {
  Hex,
  bytesToHex,
  decodeAbiParameters,
  formatEther,
  hexToString,
  parseAbiParameters,
} from 'viem'

import Accordion from 'src/components/Home/accordian'
import { OptionalLink } from 'src/components/OptionalLink'
import SWR_KEYS from 'src/constants/swrKeys'
import { IpfsMilestone } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowForm.schema'
import { convertByte32ToIpfsCidV0 } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { ExternalLinks } from 'src/modules/dao/components/About/ExternalLinks'

import { DecodedTransaction } from './ProposalDescription'

export const MilestoneDetails = ({
  decodedTxnData,
}: {
  decodedTxnData: DecodedTransaction
}) => {
  // Decode Calldata to get ipfs CID
  const decodedAbiData: any[] = decodeAbiParameters(
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

  const invoiceCid = convertByte32ToIpfsCidV0(decodedAbiData[4])

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
        </Stack>
      ),
    }
  })

  return <Accordion items={milestonesDetails} />
}
