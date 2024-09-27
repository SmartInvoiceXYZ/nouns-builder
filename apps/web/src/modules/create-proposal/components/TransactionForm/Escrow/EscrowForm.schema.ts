import * as yup from 'yup'

import type { AddressType } from 'src/typings'
import { addressValidationSchema } from 'src/utils/yup'

export interface EscrowFormValues {
  recipientAddress?: string | AddressType
  amount?: number
}

const EscrowFormSchema = yup.object({
  recipientAddress: addressValidationSchema,
  amount: yup.number().min(1, 'Must be at least 1 token').required(),
})

export default EscrowFormSchema
