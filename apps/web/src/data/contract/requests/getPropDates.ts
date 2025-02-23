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

const ATTESTATION_SCHEMA_UID = `0x9ee9a1bfbf4f8f9b977c6b30600d6131d2a56d0be8100e2238a057ea8b18be7e`

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

export async function getPropDates(
  daoTreasuryAddress: string,
  chainId: CHAIN_ID,
  propId: string
): Promise<Array<any>> {
  // Input validation
  if (!daoTreasuryAddress || !isAddress(daoTreasuryAddress)) {
    return []
  }

  const attestationUrl = ATTESTATION_URL[chainId]
  if (!attestationUrl) {
    return []
  }


  const query = `
  query Attestations {
    attestations(
      where: {
        schemaId: { equals: "${ATTESTATION_SCHEMA_UID}" }
        recipient: { equals: "${checksumAddress(daoTreasuryAddress)}" }
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
      return []
    }

    try {
      // Get decoded data from each attestation
      const decodedData = attestations.map(attestation => 
        JSON.parse(attestation.decodedDataJson) as DecodedData[]
      )

      const propDates = decodedData.map(decoded => ({
        propId: Number(decoded.find(d => d.name === 'propId')?.value.value),
        replyTo: decoded.find(d => d.name === 'replyTo')?.value.value,
        response: decoded.find(d => d.name === 'response')?.value.value,
        milestoneId: Number(decoded.find(d => d.name === 'milestoneId')?.value.value)
      }))
    
      return propDates.filter(date => Number(date.propId) == Number(propId))
    } catch (parseError) {
      console.error('Error parsing attestation data:', parseError)
      return []
    }
  } catch (error) {
    console.error('Error fetching attestations:', error)
    return []
  }
}
