import { Stack } from '@zoralabs/zord'
import { useCallback } from 'hono/jsx'
import { uploadFile } from 'ipfs-service'
import { useRouter } from 'next/router'
import { useState } from 'react'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'

import SWR_KEYS from 'src/constants/swrKeys'
import { ProposalsResponse } from 'src/data/subgraph/requests/proposalsQuery'
import { getProposals } from 'src/data/subgraph/requests/proposalsQuery'
import { TransactionType } from 'src/modules/create-proposal/constants'
import { useProposalStore } from 'src/modules/create-proposal/stores'
import { getChainFromLocalStorage } from 'src/utils/getChainFromLocalStorage'

import EscrowForm from './EscrowForm'
import { EscrowFormValues } from './EscrowForm.schema'
import { useEscrowFormStore } from './EscrowUtils'
import {
  KLEROS_ARBITRATION_PROVIDER,
  createEscrowData,
  deployEscrowAbi,
  getEscrowBundler,
} from './EscrowUtils'

export const Escrow: React.FC = () => {
  const [isIPFSUploading, setIsIPFSUploading] = useState(false)
  const [ipfsUploadError, setIpfsUploadError] = useState<Error | null>(null)
  const [ipfsCID, setIpfsCID] = useState('')

  const { query, isReady } = useRouter()

  const { id: chainId } = getChainFromLocalStorage()

  const addTransaction = useProposalStore((state) => state.addTransaction)
  const removeTransactions = useProposalStore((state) => state.removeAllTransactions)

  const { data } = useSWR<ProposalsResponse>(
    isReady ? [SWR_KEYS.PROPOSALS, chainId, query.token, '0'] : null,
    (_, chainId, token, page) => getProposals(chainId, token, 1, Number(0))
  )

  const lastProposalId = data?.proposals?.[0]?.proposalNumber ?? 0

  const { formValues } = useEscrowFormStore()

  const handleEscrowTransaction = useCallback(
    async (values: EscrowFormValues) => {
      // Allow only single escrow transaction
      removeTransactions()

      const ipfsDataToUpload = {
        title: 'Proposal #' + (lastProposalId + 1),
        description: window?.location.href.replace(
          '/proposal/create',
          '/vote/' + lastProposalId + 1
        ),
        endDate: new Date(
          values.milestones[values.milestones.length - 1].endDate
        ).getTime(),
        milestones: values.milestones.map((x, index) => ({
          id: 'milestone-00' + index,
          title: x.title,
          description: x.description,
          endDate: new Date(x.endDate).getTime() / 1000, // in seconds
          createdAt: Date.now() / 1000, // in seconds
          startDate: Date.now() + 7 * 86400, // set start date 7 days from submission in seconds
          resolverType: 'kleros',
          totalAmount: values.milestones.reduce((acc, x) => acc + x.amount, 0),
          klerosCourt: 1,
          arbitrationProvider: KLEROS_ARBITRATION_PROVIDER,
          ...(x.mediaType && x.mediaUrl
            ? {
                documents: [
                  {
                    id: 'doc-001',
                    type: 'ipfs',
                    src: x.mediaUrl,
                    mimeType: x.mediaType,
                    createdAt: new Date().getTime() / 1000,
                  },
                ],
              }
            : {}),
        })),
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

      // add 1s delay here
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // create bundler transaction data
      const escrowData = createEscrowData(values, ipfsCID, chainId)
      const milestoneAmounts = values.milestones.map((x) => x.amount * 10 ** 18)
      const fundAmount = milestoneAmounts.reduce((acc, x) => acc + x, 0)

      const escrow = {
        target: getEscrowBundler(chainId),
        functionSignature: 'deployEscrow()',
        calldata: encodeFunctionData({
          abi: deployEscrowAbi,
          functionName: 'deployEscrow',
          args: [milestoneAmounts, escrowData, fundAmount],
        }),
        value: Number(fundAmount * 10 ** -18).toString(),
      }

      // add to queue
      addTransaction({
        type: TransactionType.ESCROW,
        summary: `Create and fund new Escrow with ${Number(
          fundAmount * 10 ** -18 || 0
        )?.toPrecision(5)} ETH`,
        transactions: [escrow],
      })

      setIsIPFSUploading(false)
    },
    [formValues]
  )

  return (
    <Stack>
      <EscrowForm
        onSubmit={handleEscrowTransaction}
        isFormSubmitting={isIPFSUploading}
        escrowFormDataIpfsCID={ipfsCID}
      />
      {ipfsUploadError?.message && <div>Error: {ipfsUploadError.message}</div>}
    </Stack>
  )
}
