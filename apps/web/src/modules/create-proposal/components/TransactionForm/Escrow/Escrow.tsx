import { Stack } from '@zoralabs/zord'
import { uploadFile } from 'ipfs-service'
import { useState } from 'react'
import { encodeFunctionData } from 'viem'
import { useChainId } from 'wagmi'

import { TransactionType } from 'src/modules/create-proposal/constants'
import { useProposalStore } from 'src/modules/create-proposal/stores'

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
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const removeTransactions = useProposalStore((state) => state.removeAllTransactions)

  const handleEscrowTransaction = async (values: EscrowFormValues) => {
    removeTransactions()
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
    const fundAmount = milestoneAmounts.reduce((acc, x) => acc + x, 0)
    console.log([milestoneAmounts, escrowData, fundAmount])

    const escrow = {
      target: getEscrowBundler(chainId),
      functionSignature: 'deployEscrow()',
      calldata: encodeFunctionData({
        abi: deployEscrowAbi,
        functionName: 'deployEscrow',
        args: [milestoneAmounts, escrowData, fundAmount],
      }),
      value: fundAmount.toString(),
    }

    // add to queue
    addTransaction({
      type: TransactionType.ESCROW,
      summary: `Create and fund new Escrow`,
      transactions: [escrow],
    })

    setIsIPFSUploading(false)
  }

  return (
    <Stack data-testid="escrow">
      <EscrowForm
        onSubmit={handleEscrowTransaction}
        isFormSubmitting={isIPFSUploading}
        escrowFormDataIpfsCID={ipfsCID}
      />
      {ipfsUploadError?.message && <div>Error: {ipfsUploadError.message}</div>}
    </Stack>
  )
}
