import axios from 'axios'
import useSWR from 'swr'
import { Address, checksumAddress, isAddress } from 'viem'

import SWR_KEYS from 'src/constants/swrKeys'
import { AddressType, CHAIN_ID } from 'src/typings'

interface AttestationResponse {
  data: {
    attestations: {
      attester: string
      recipient: string
      decodedDataJson: string
    }[]
  }
}

const ATTESTATION_SCHEMA_UID = `0x1289c5f988998891af7416d83820c40ba1c6f5ba31467f2e611172334dc53a0e`
const ATTESTATION_ISSUER = `0x503a5161D1c5D9d82BF35a4c80DA0C3Ad72d9244` // TODO: Update/ get from env post handoff

const ATTESTATION_URL: Record<CHAIN_ID, string> = {
  [CHAIN_ID.ETHEREUM]: 'https://easscan.org/graphql',
  [CHAIN_ID.OPTIMISM]: 'https://optimism.easscan.org/graphql',
  [CHAIN_ID.SEPOLIA]: 'https://sepolia.easscan.org/graphql',
  [CHAIN_ID.OPTIMISM_SEPOLIA]: 'https://optimism-sepolia.easscan.org/graphql',
  [CHAIN_ID.BASE]: 'https://base.easscan.org/graphql',
  [CHAIN_ID.BASE_SEPOLIA]: 'https://base-sepolia.easscan.org/graphql',
  [CHAIN_ID.ZORA]: '',
  [CHAIN_ID.ZORA_SEPOLIA]: '',
  [CHAIN_ID.FOUNDRY]: '',
}

export async function getDaoMultiSig(
  daoAddress: string,
  chainId: CHAIN_ID
): Promise<string | null> {
  if (
    !daoAddress ||
    !isAddress(daoAddress) ||
    !Object.keys(ATTESTATION_URL).includes(String(chainId)) ||
    !ATTESTATION_URL[chainId]
  ) {
    return null
  }

  const query = `
    query Attestations {
      attestations(where: {
        schemaId: { equals: ${ATTESTATION_SCHEMA_UID} },
        attester: { equals: ${checksumAddress(ATTESTATION_ISSUER)} },
        recipient: { equals: "${checksumAddress(daoAddress)}" }
      }) {
        attester
        recipient
        decodedDataJson
      }
    }
  `

  try {
    const response = await axios.post<AttestationResponse>(
      ATTESTATION_URL[chainId],
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const { data } = response.data

    if (!data?.attestations?.length) {
      return null
    }

    try {
      const decodedData = JSON.parse(data.attestations[0].decodedDataJson)

      // return multisig Address
      return (decodedData[0]?.value?.value as string) || null
    } catch (parseError) {
      console.error('Error parsing decodedDataJson:', parseError)
      return null
    }
  } catch (error) {
    console.error('Error fetching attestations:', error)
    return null
  }
}
