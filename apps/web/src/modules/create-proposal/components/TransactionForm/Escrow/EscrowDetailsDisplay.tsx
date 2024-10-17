import { Box, Stack, Text } from '@zoralabs/zord'
import { useFormikContext } from 'formik'

import { EscrowFormValues } from './EscrowForm.schema'

export default function EscrowDetailsDisplay() {
  const { values } = useFormikContext<EscrowFormValues>()

  const totalEscrowAmount = values?.milestones
    .map((x) => x.amount)
    .reduce((acc, x) => acc + x, 0)
  return (
    <Box
      position={'absolute'}
      style={{ height: '100%', maxWidth: '50%' }}
      top={'x0'}
      right={'x0'}
    >
      <Stack position={'sticky'} top={'x20'} right={'x0'} gap={'x5'}>
        <Box>
          <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
            Total Escrow Amount
          </Text>
          <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
            {totalEscrowAmount.toPrecision(5) || '0.00'} ETH
          </Text>
        </Box>
        <Box>
          <Text fontSize={12} color="text4" style={{ fontWeight: 'bold' }}>
            Arbitration Provider
          </Text>
          <Text variant="heading-sm" style={{ fontWeight: 'bold' }}>
            Kleros
          </Text>
        </Box>
      </Stack>
    </Box>
  )
}
