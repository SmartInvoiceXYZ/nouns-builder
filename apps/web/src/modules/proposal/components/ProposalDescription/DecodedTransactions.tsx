import { Box, Flex, Stack, Text, atoms } from '@zoralabs/zord'
import axios from 'axios'
import { toLower } from 'lodash'
import { get } from 'lodash'
import React, { Fragment } from 'react'
import useSWR from 'swr'
import { decodeAbiParameters, formatEther, parseAbiParameters } from 'viem'

import { ETHERSCAN_BASE_URL } from 'src/constants/etherscan'
import SWR_KEYS from 'src/constants/swrKeys'
import { getEscrowBundler } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { useChainStore } from 'src/stores/useChainStore'
import { CHAIN_ID } from 'src/typings'
import { walletSnippet } from 'src/utils/helpers'

interface DecodedTransactionProps {
  targets: string[]
  calldatas: string[]
  values: string[]
  setDecodedTxnData: React.Dispatch<React.SetStateAction<any>>
}

export const DecodedTransactions: React.FC<DecodedTransactionProps> = ({
  targets,
  calldatas,
  values,
  setDecodedTxnData,
}) => {
  const chain = useChainStore((x) => x.chain)
  const isEscrow = targets.includes(toLower(getEscrowBundler(chain.id)))

  const formatSendEth = (value: string) => {
    const amount = formatEther(BigInt(value))
    return {
      functionName: 'Transfer',
      name: 'Transfer',
      args: {
        ['Transfer']: { name: `value`, value: `${amount} ETH` },
      },
    }
  }

  const decodeTransaction = async (
    chainId: CHAIN_ID,
    target: string,
    calldata: string,
    value: string
  ) => {
    const isTransfer = calldata === '0x'

    if (isTransfer) {
      return formatSendEth(value)
    }

    try {
      const decoded = await axios.post('/api/decode', {
        calldata: calldata,
        contract: target,
        chain: chainId,
      })

      if (decoded?.data?.statusCode) throw new Error('Decode failed')

      return decoded.data
    } catch (err) {
      console.log('err', err)

      if (value.length && parseInt(value)) return formatSendEth(value)

      return calldata
    }
  }

  const { data: decodedTransactions } = useSWR(
    targets && calldatas && values
      ? [SWR_KEYS.PROPOSALS_TRANSACTIONS, targets, calldatas, values]
      : null,
    async (_, targets, calldatas, values) => {
      return await Promise.all(
        targets.map(async (target, i) => {
          const transaction = await decodeTransaction(
            chain.id,
            target,
            calldatas[i],
            values[i]
          )

          setDecodedTxnData(transaction?.args)

          return {
            target,
            transaction,
            isNotDecoded: transaction === calldatas[i],
          }
        })
      )
    },
    { revalidateOnFocus: false }
  )

  const renderArgument = (arg: any) => {
    if (arg?.name === '_escrowData') {
      // Decode escrow data
      const decodedAbiData = decodeAbiParameters(
        parseAbiParameters([
          'address client',
          'address resolver',
          'uint8 resolverType',
          'address token',
          'uint256 terminationTime',
          'bytes32 details',
          'address provider',
          'address providerReceiver',
          'bool requireVerification',
          'bytes32 escrowType',
        ]),
        arg.value
      )

      return (
        <Stack pl={'x2'} gap={'x1'}>
          <Flex>client/signer: {get(decodedAbiData, '[0]', '')}</Flex>
          <Flex>resolver: {get(decodedAbiData, '[1]', '')}</Flex>
          <Flex>
            Safety Valve Date:{' '}
            {new Date(Number(get(decodedAbiData, '[4]', 0)) * 1000).toLocaleString()}
          </Flex>
          <Flex>Service Provider: {get(decodedAbiData, '[6]', '')}</Flex>
        </Stack>
      )
    }

    return (
      <Flex key={arg?.name}>
        {arg?.name}:{' '}
        {arg?.name === '_milestoneAmounts'
          ? arg.value
              .split(',')
              .map((amt: string) => `${formatEther(BigInt(amt))} ETH`)
              .join(', ')
          : arg?.name === '_fundAmount'
          ? formatEther(BigInt(arg?.value)) + ' ETH'
          : arg?.value}
      </Flex>
    )
  }

  return (
    <Stack style={{ maxWidth: 600, wordBreak: 'break-word' }}>
      <ol>
        {decodedTransactions?.map((decoded, i) => (
          <Fragment key={`${decoded.target}-${i}`}>
            {decoded.isNotDecoded ? (
              <li className={atoms({ paddingBottom: 'x4' })}>{decoded.transaction}</li>
            ) : (
              <li className={atoms({ paddingBottom: 'x4' })}>
                <Stack>
                  <Stack gap={'x1'}>
                    <Box
                      color={'secondary'}
                      fontWeight={'heading'}
                      className={atoms({ textDecoration: 'underline' })}
                    >
                      <a
                        href={`${ETHERSCAN_BASE_URL[chain.id]}/address/${
                          decoded?.target
                        }`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Text display={{ '@initial': 'flex', '@768': 'none' }}>
                          {walletSnippet(decoded?.target)}
                        </Text>
                        <Text display={{ '@initial': 'none', '@768': 'flex' }}>
                          {decoded?.target}
                        </Text>
                      </a>
                    </Box>
                    <Flex pl={'x2'}>
                      {`.${
                        !isEscrow ? decoded?.transaction?.functionName : 'deployEscrow'
                      }(`}
                      {!decoded?.transaction?.args &&
                        !decoded.transaction?.decoded?.length &&
                        `)`}
                    </Flex>

                    <Stack pl={'x4'} gap={'x1'}>
                      {(decoded?.transaction?.args &&
                        Object?.values(decoded?.transaction?.args).map((arg: any) =>
                          renderArgument(arg)
                        )) ||
                        (decoded?.transaction?.decoded &&
                          decoded?.transaction?.decoded?.map((arg: any) => (
                            <Flex key={arg}>{arg}</Flex>
                          )))}
                    </Stack>

                    {(!!decoded?.transaction?.args ||
                      !!decoded?.transaction?.decoded?.length) &&
                      `)`}
                  </Stack>
                </Stack>
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </Stack>
  )
}
