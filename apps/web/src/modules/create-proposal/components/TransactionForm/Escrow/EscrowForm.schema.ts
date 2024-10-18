import { FormikHelpers } from 'formik'
import * as yup from 'yup'

import { AddressType } from 'src/typings'
import { addressValidationSchema } from 'src/utils/yup'

export interface Milestone {
  amount: number
  title: string
  endDate: number & string & Date
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

export interface EscrowFormState {
  formValues: EscrowFormValues
  setFormValues: (values: EscrowFormValues) => void
  resetForm: () => void
}

export interface EscrowFormProps {
  onSubmit: (values: EscrowFormValues, actions: FormikHelpers<EscrowFormValues>) => void
  isFormSubmitting: boolean
  escrowFormDataIpfsCID: string
}

export const MilestoneSchema = yup.object({
  amount: yup
    .number()
    .moreThan(0, 'Amount must be greater than 0')
    .required('Amount is required'),
  title: yup.string().required('Title is required'),
  endDate: yup.date().required('End date is required'),
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

export const EscrowFormSchema = yup.object({
  clientAddress: addressValidationSchema,
  recipientAddress: addressValidationSchema,
  safetyValveDate: yup
    .date()
    .required('Safety valve date is required.')
    .min(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      'Safety valve date must be at least 30 days from today.'
    ),
  milestones: yup
    .array()
    .of(MilestoneSchema)
    .min(1, 'At least one milestone is required'),
})
