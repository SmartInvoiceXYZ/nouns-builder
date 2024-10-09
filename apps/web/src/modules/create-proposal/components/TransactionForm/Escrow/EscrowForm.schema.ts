import * as yup from 'yup'

import { AddressType } from 'src/typings'
import { addressValidationSchema } from 'src/utils/yup'

export interface Milestone {
  amount: number
  title: string
  deliveryDate: Date | number
  media: string
  description: string
}

export interface EscrowFormValues {
  clientAddress: string | AddressType
  recipientAddress: string | AddressType
  safetyValveDate: Date | number
  milestones: Array<Milestone>
  startDate: Date | number
  endDate: Date | number
  arbitrationProvider: string | AddressType
  arbitrationCourt: number
}

const MilestoneSchema = yup.object({
  amount: yup
    .number()
    .min(0.01, 'Amount must be at least 0.01')
    .required('Amount is required'),
  title: yup.string().required('Title is required'),
  deliveryDate: yup.date().required('Delivery date is required'),
  media: yup.string().url('Must be a valid URL').required('Media URL is required'),
  description: yup.string().required('Description is required'),
})

const EscrowFormSchema = yup.object({
  clientAddress: addressValidationSchema,
  recipientAddress: addressValidationSchema,
  safetyValveDate: yup.date().required('Safety valve date is required'),
  milestones: yup
    .array()
    .of(MilestoneSchema)
    .min(1, 'At least one milestone is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  arbitrationProvider: addressValidationSchema,
  arbitrationCourt: yup.number().required('Arbitration court is required'),
})

export { MilestoneSchema, EscrowFormSchema }
