import * as yup from 'yup'

import type { AddressType } from 'src/typings'
import { addressValidationSchema } from 'src/utils/yup'

export interface EscrowFormValues {
  clientAddress: string | AddressType
  recipientAddress: string | AddressType
  safetyValveDate: Date
  milestones: Array<{ title: string; description: string; amount: number }>
  startDate: Date
  endDate: Date
  arbitrationProvider: string | AddressType
  arbitrationCourt: number
}

const EscrowFormSchema = yup.object({
  clientAddress: addressValidationSchema,
  recipientAddress: addressValidationSchema,
  amount: yup.number().min(0.5, 'Must be at least 0.5 eth').required(),
  safetyValveDate: yup.date().required(),
  milestones: yup.array().of(yup.object().required()),
  endDate: yup.date().required(),
  startDate: yup.date().required(),
  arbitrationProvider: addressValidationSchema,
  arbitrationCourt: yup.number().required(),
})

export default EscrowFormSchema
