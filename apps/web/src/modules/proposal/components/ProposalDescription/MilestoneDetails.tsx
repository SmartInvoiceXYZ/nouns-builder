import { Stack, Text } from '@zoralabs/zord'
import {
  Hex,
  bytesToHex,
  decodeAbiParameters,
  hexToString,
  parseAbiParameters,
} from 'viem'

import Accordion from 'src/components/Home/accordian'
import { IpfsMilestone } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowForm.schema'
import { convertByte32ToIpfsCidV0 } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'

import { DecodedTransaction } from './ProposalDescription'

export const MilestoneDetails = ({
  decodedTxnData,
}: {
  decodedTxnData: DecodedTransaction
}) => {
  // Decode Calldata to get ipfs CID
  const decodedAbiData: never[] = decodeAbiParameters(
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

  console.log(decodedAbiData)

  console.log(convertByte32ToIpfsCidV0(decodedAbiData[4]))

  const milestones: IpfsMilestone[] = [
    // sample data
    {
      title: 'Milestone 1',
      description: 'About Milestone 1',
      endDate: 1730073600000 as never,
      documents: [
        {
          type: 'ipfs',
          src: 'ipfs://QmdpYYybaAbiZDXb4Z7QtJptR3jarN1bKNQbv6jB8GBp8m',
          mimeType: 'image/png',
          createdAt: 1729243503628,
        },
      ],
    },
  ]

  const milestonesDetails = milestones.map((milestone, index) => {
    return {
      title: milestone.title as string,
      description: (
        <Stack direction={'row'} align={'center'} justify={'space-between'}>
          <Text>{milestone.title}</Text>
          {milestone.description}
        </Stack>
      ),
    }
  })

  return <Accordion items={milestonesDetails} />
}
