import { Stack } from '@zoralabs/zord'
import { uploadFile } from 'ipfs-service'
import { useState } from 'react'
import { parseAbiItem } from 'viem'
import { useChainId, usePrepareContractWrite } from 'wagmi'

import EscrowForm from './EscrowForm'
import { EscrowFormValues } from './EscrowForm.schema'
import {
  KLEROS_ARBITRATION_PROVIDER,
  createEscrowData,
  deployEscrowAbi,
  getEscrowBundler,
} from './EscrowUtils'

export const Escrow: React.FC = () => {
  const [isIPFSUploading, setIsIPFSUploading] = useState(false)
  const [ipfsUploadError, setIpfsUploadError] = useState<Error | null>(null)
  const [ipfsCID, setIpfsCID] = useState<string>('')

  const chainId = useChainId()

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
      arbitrationProvider: KLEROS_ARBITRATION_PROVIDER,
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
      setIpfsCID(cid)
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
    const escrowData = createEscrowData(values, ipfsCID, chainId)
    const milestoneAmounts = values.milestones.map((x) => x.amount * 10 ** 18)
    const fundAmount = values.milestones.reduce((acc, x) => acc + x.amount, 0) * 10 ** 18
    console.log([milestoneAmounts, escrowData, fundAmount])
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
