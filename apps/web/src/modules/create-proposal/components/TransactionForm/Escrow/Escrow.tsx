import { Stack, Text } from '@zoralabs/zord'

import EscrowForm from './EscrowForm'

export const Escrow: React.FC = () => {
  const handleEscrowTransaction = () => {
    console.log('escrow')
  }
  return (
    <Stack data-testid="escrow">
      <Stack>
        <EscrowForm onSubmit={handleEscrowTransaction} disabled={false} />
      </Stack>
    </Stack>
  )
}
