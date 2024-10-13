import { Stack } from '@zoralabs/zord'
import { useState } from 'react'

import EscrowDetailsDisplay from './EscrowDetailsDisplay'
import EscrowForm from './EscrowForm'
import { EscrowFormValues } from './EscrowForm.schema'

export const Escrow: React.FC = () => {
  const [isIPFSUploading, setIsIPFSUploading] = useState(false)

  const handleEscrowTransaction = (values: EscrowFormValues) => {
    // transform values to upload to IPFS
    const ipfsDataToUpload = {
      endDate: new Date(
        values.milestones[values.milestones.length - 1].deliveryDate
      ).getTime(),
      milestones: values.milestones.map((x) => {
        return x.mediaType === undefined
          ? {
              title: x.title,
              description: x.description,
              deliveryDate: new Date(x.deliveryDate).getTime(),
            }
          : {
              title: x.title,
              description: x.description,
              media: x.media,
              deliveryDate: new Date(x.deliveryDate).getTime(),
            }
      }),
      totalAmount: values.milestones.reduce((acc, x) => acc + x.amount, 0),
      klerosCourt: 1, // @notice: always use kleros General Court here
      arbitrationProvider: '0x18542245cA523DFF96AF766047fE9423E0BED3C0', // @notice: always use Kleros Arbitration Provider here
    }

    // upload to IPFS

    // create bundler transaction data
    // create bundler transaction and add to queue
  }
  return (
    <Stack data-testid="escrow">
      <EscrowForm onSubmit={handleEscrowTransaction} disabled={false} />
    </Stack>
  )
}
