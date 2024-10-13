import { Stack } from '@zoralabs/zord'
import { uploadFile } from 'ipfs-service'
import { useState } from 'react'

import EscrowForm from './EscrowForm'
import { EscrowFormValues } from './EscrowForm.schema'

export const Escrow: React.FC = () => {
  const [isIPFSUploading, setIsIPFSUploading] = useState(false)
  const [ipfsUploadError, setIpfsUploadError] = useState<Error | null>(null)

  const handleEscrowTransaction = async (values: EscrowFormValues) => {
    console.log(values)
    const ipfsDataToUpload = {
      endDate: new Date(
        values.milestones[values.milestones.length - 1].deliveryDate
      ).getTime(),
      milestones: values.milestones.map((x) => ({
        title: x.title,
        description: x.description,
        deliveryDate: new Date(x.deliveryDate).getTime(),
        ...(x.mediaType && x.mediaUrl
          ? {
              documents: [
                {
                  type: 'ipfs',
                  src: x.mediaUrl,
                  createdAt: new Date().getTime(),
                },
              ],
            }
          : {}),
      })),
      totalAmount: values.milestones.reduce((acc, x) => acc + x.amount, 0),
      klerosCourt: 1,
      arbitrationProvider: '0x18542245cA523DFF96AF766047fE9423E0BED3C0',
    }

    const jsonDataToUpload = JSON.stringify(ipfsDataToUpload, null, 2)
    const fileToUpload = new File([jsonDataToUpload], 'escrow-data.json', {
      type: 'application/json',
    })

    try {
      console.log('Uploading to IPFS...')
      setIsIPFSUploading(true)
      const { cid, uri } = await uploadFile(fileToUpload, {
        cache: true,
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress}%`)
        },
      })
      setIsIPFSUploading(false)
      setIpfsUploadError(null)
      console.log('IPFS upload successful. CID:', cid, 'URI:', uri)
    } catch (err: any) {
      setIsIPFSUploading(false)
      setIpfsUploadError(
        new Error(
          `Sorry, there was an error with our file uploading service. ${err?.message}`
        )
      )
    }

    // create bundler transaction data
    // create bundler transaction and add to queue
  }

  return (
    <Stack data-testid="escrow">
      <EscrowForm onSubmit={handleEscrowTransaction} disabled={isIPFSUploading} />
      {isIPFSUploading && <div>Uploading to IPFS...</div>}
      {ipfsUploadError && <div>Error: {ipfsUploadError.message}</div>}
    </Stack>
  )
}
