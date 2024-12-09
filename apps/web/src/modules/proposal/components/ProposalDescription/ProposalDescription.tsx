import { Box, Flex, Paragraph, Text, atoms } from '@zoralabs/zord'
import { useEffect } from 'hono/jsx'
import { toLower } from 'lodash'
import Image from 'next/image'
import React, { ReactNode } from 'react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import useSWR from 'swr'

import SWR_KEYS from 'src/constants/swrKeys'
import { SDK } from 'src/data/subgraph/client'
import { Proposal } from 'src/data/subgraph/requests/proposalQuery'
import { OrderDirection, Token_OrderBy } from 'src/data/subgraph/sdk.generated'
import { useEnsData } from 'src/hooks/useEnsData'
import { getEscrowBundler } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { useChainStore } from 'src/stores/useChainStore'
import { propPageWrapper } from 'src/styles/Proposals.css'

import { DecodedTransactions } from './DecodedTransactions'
import { MilestoneDetails } from './MilestoneDetails'
import { proposalDescription } from './ProposalDescription.css'

const Section = ({ children, title }: { children: ReactNode; title: string }) => (
  <Box mb={{ '@initial': 'x6', '@768': 'x13' }}>
    <Box fontSize={20} mb={{ '@initial': 'x4', '@768': 'x5' }} fontWeight={'display'}>
      {title}
    </Box>
    {children}
  </Box>
)

type ProposalDescriptionProps = {
  proposal: Proposal
  collection: string
}

interface DecodedArguments {
  name: string
  value: string
  type: string
}

export interface DecodedTransaction {
  [key: string]: DecodedArguments
}

export const ProposalDescription: React.FC<ProposalDescriptionProps> = ({
  proposal,
  collection,
}) => {
  const { description, proposer, calldatas, values, targets, executionTransactionHash } =
    proposal

  const { displayName } = useEnsData(proposer)
  const chain = useChainStore((x) => x.chain)

  const [decodedTxnData, setDecodedTxnData] = useState<DecodedTransaction>()

  const isEscrow = targets.includes(toLower(getEscrowBundler(chain.id)))

  const { data: tokenImage, error } = useSWR(
    !!collection && !!proposer
      ? [SWR_KEYS.TOKEN_IMAGE, chain.id, collection, proposer]
      : null,
    async (_, chainId, collection, proposer) => {
      const data = await SDK.connect(chainId).tokens({
        where: { owner: proposer.toLowerCase(), tokenContract: collection.toLowerCase() },
        first: 1,
        orderBy: Token_OrderBy.MintedAt,
        orderDirection: OrderDirection.Asc,
      })
      return data?.tokens?.[0]?.image
    },
    { revalidateOnFocus: false }
  )

  useEffect(() => {
    setDecodedTxnData(decodedTxnData)
  }, [decodedTxnData])

  return (
    <Flex className={propPageWrapper}>
      <Flex direction={'column'} mt={{ '@initial': 'x6', '@768': 'x13' }}>
        <Section title="Description">
          <Paragraph overflow={'auto'}>
            {description && (
              <ReactMarkdown
                className={proposalDescription}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                remarkPlugins={[remarkGfm]}
              >
                {description}
              </ReactMarkdown>
            )}
          </Paragraph>
        </Section>

        {isEscrow && decodedTxnData && (
          <Section title="Escrow Milestones">
            {executionTransactionHash ? (
              <MilestoneDetails
                decodedTxnData={decodedTxnData}
                executionTransactionHash={executionTransactionHash}
              />
            ) : !decodedTxnData?._escrowData?.value ? (
              <Text variant="code" color="negative">
                Error Decoding Escrow Milestones
              </Text>
            ) : null}
          </Section>
        )}

        <Section title="Proposer">
          <Flex direction={'row'} placeItems={'center'}>
            <Box
              backgroundColor="background2"
              width={'x8'}
              height={'x8'}
              mr={'x2'}
              borderRadius={'small'}
              position="relative"
            >
              {!!tokenImage && !error && (
                <Image
                  alt="proposer"
                  src={tokenImage}
                  quality={50}
                  width={128}
                  height={128}
                  className={atoms({ borderRadius: 'small' })}
                />
              )}
            </Box>

            <Box>{displayName}</Box>
          </Flex>
        </Section>

        <Section title="Proposed Transactions">
          <DecodedTransactions
            targets={targets}
            calldatas={calldatas}
            values={values}
            setDecodedTxnData={setDecodedTxnData}
          />
        </Section>
      </Flex>
    </Flex>
  )
}
