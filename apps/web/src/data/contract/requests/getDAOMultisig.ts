import axios from 'axios'
import { checksumAddress, isAddress } from 'viem'

import { CHAIN_ID } from 'src/typings'

interface AttestationResponse {
  data: {
    attestations: Array<{
      attester: string
      recipient: string
      decodedDataJson: string
    }>
  }
}

interface DecodedData {
  name: string
  type: string
  value: {
    type: string
    value: string
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
  // Input validation
  if (!daoAddress || !isAddress(daoAddress)) {
    return null
  }

  const attestationUrl = ATTESTATION_URL[chainId]
  if (!attestationUrl) {
    return null
  }

  const query = `
    query Attestations {
      attestations(
        where: {
          schemaId: { equals: "${ATTESTATION_SCHEMA_UID}" }
          attester: { equals: "${checksumAddress(ATTESTATION_ISSUER)}" }
          recipient: { equals: "${checksumAddress(daoAddress)}" }
        }
      ) {
        attester
        recipient
        decodedDataJson
      }
    }
  `

  try {
    const response = await axios.post<AttestationResponse>(
      attestationUrl,
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const attestations = response?.data?.data?.attestations
    if (!attestations?.length) {
      return null
    }

    try {
      const decodedData = JSON.parse(attestations[0].decodedDataJson) as DecodedData[]

      const multisigAddress = decodedData[0]?.value?.value
      if (!multisigAddress || !isAddress(multisigAddress)) {
        return null
      }

      return multisigAddress
    } catch (parseError) {
      console.error('Error parsing attestation data:', parseError)
      return null
    }
  } catch (error) {
    console.error('Error fetching attestations:', error)
    return null
  }
}
