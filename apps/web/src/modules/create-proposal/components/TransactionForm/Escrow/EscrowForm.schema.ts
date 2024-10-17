import { media } from '@zoralabs/zord'
import * as yup from 'yup'

import { AddressType } from 'src/typings'
import { addressValidationSchema } from 'src/utils/yup'

export interface Milestone {
  amount: number
  title: string
  deliveryDate: Date | number | string
  mediaUrl: string | undefined
  mediaType: string | undefined
  mediaFileName: string
  description: string
}

export interface EscrowFormValues {
  clientAddress: string | AddressType
  recipientAddress: string | AddressType
  safetyValveDate: Date | number | string
  milestones: Array<Milestone>
}

const MilestoneSchema = yup.object({
  amount: yup
    .number()
    .min(0.1, 'Amount must be greater than 0.1 ETH')
    .required('Amount is required'),
  title: yup.string().required('Title is required'),
  deliveryDate: yup.date().required('Delivery date is required'),
  mediaUrl: yup.string(),
  mediaType: yup
    .string()
    .oneOf([
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      undefined,
    ]),
  mediaFileName: yup.string(),
  description: yup.string(),
})

const EscrowFormSchema = yup.object({
  clientAddress: addressValidationSchema,
  recipientAddress: addressValidationSchema,
  safetyValveDate: yup
    .date()
    .required('Safety valve date must be at least 30 days from today.'),
  milestones: yup
    .array()
    .of(MilestoneSchema)
    .min(1, 'At least one milestone is required'),
})

export { MilestoneSchema, EscrowFormSchema }
