import { Stack, Text } from '@zoralabs/zord'

import Accordion from 'src/components/Home/accordian'
import { IpfsMilestone } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowForm.schema'

export const MilestoneDetails = () => {
  // Decode Calldata to get ipfs CID
  // Fetch ipfs data

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
