import { Box, Button, Flex, Paragraph, Stack } from '@zoralabs/zord'
import { FieldArray, Form, Formik } from 'formik'
import type { FormikHelpers } from 'formik'
import { useFormikContext } from 'formik'
import React, { useCallback, useState } from 'react'

import DatePicker from 'src/components/Fields/Date'
import SmartInput from 'src/components/Fields/SmartInput'
import TextArea from 'src/components/Fields/TextArea'
import { NUMBER, TEXT, TEXTAREA } from 'src/components/Fields/types'
import Accordion from 'src/components/Home/accordian'
import { Icon } from 'src/components/Icon'
import Input from 'src/components/Input/Input'
import SingleMediaUpload from 'src/components/SingleMediaUpload/SingleMediaUpload'
import { useLayoutStore } from 'src/stores'

import EscrowDetailsDisplay from './EscrowDetailsDisplay'
import { EscrowFormSchema, EscrowFormValues, Milestone } from './EscrowForm.schema'

export interface EscrowFormProps {
  onSubmit: (values: EscrowFormValues, actions: FormikHelpers<EscrowFormValues>) => void
  isFormSubmitting: boolean
  escrowFormDataIpfsCID: string
}

const MilestoneForm: React.FC<{
  index: number
  setIsMediaUploading: React.Dispatch<React.SetStateAction<boolean>>
  removeMilestone: () => void
}> = ({ index, removeMilestone, setIsMediaUploading }) => {
  const formik = useFormikContext<EscrowFormValues>()

  const handleRemoveMilestone = useCallback(() => {
    removeMilestone()
  }, [removeMilestone])

  // TODO: Remove logging
  React.useEffect(() => {
    console.log(formik.values)
  }, [formik.values])

  const handleMediaUploadStart = useCallback((media: File) => {
    formik.setFieldValue(`milestones.${index}.mediaType`, media.type)
    formik.setFieldValue(`milestones.${index}.mediaFileName`, media.name)
    setIsMediaUploading(true)
  }, [])

  return (
    <Stack gap={'x4'}>
      <SmartInput
        {...formik.getFieldProps(`milestones.${index}.amount`)}
        inputLabel="Amount"
        id={`milestones.${index}.amount`}
        type={NUMBER}
        placeholder={'1.0 ETH'}
        errorMessage={
          (formik.touched?.milestones as any)?.[index]?.amount &&
          (formik.errors?.milestones as any)?.[index]?.amount
            ? (formik.errors?.milestones as any)?.[index]?.amount
            : undefined
        }
      />
      <SmartInput
        {...formik.getFieldProps(`milestones.${index}.title`)}
        id={`milestones.${index}.title`}
        inputLabel="Title"
        type={'text'}
        placeholder={'Milestone Title'}
        errorMessage={(formik.errors?.milestones as any)?.[index]?.title ?? undefined}
      />

      <SmartInput
        {...formik.getFieldProps(`milestones.${index}.description`)}
        type={TEXTAREA}
        formik={formik}
        id={`milestones.${index}.description`}
        value={formik.values?.milestones[index]?.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        inputLabel="Description"
        placeholder={'Milestone description is highly encouraged'}
      />

      <DatePicker
        {...formik.getFieldProps(`milestones.${index}.deliveryDate`)}
        formik={formik}
        id={`milestones.${index}.deliveryDate`}
        inputLabel={'Delivery Date'}
        placeholder={'yyyy-mm-dd'}
        dateFormat="Y-m-d"
        errorMessage={
          (formik.errors?.milestones as any)?.[index]?.deliveryDate ?? undefined
        }
      />

      <SingleMediaUpload
        {...formik.getFieldProps('media')}
        formik={formik}
        value={formik.values.milestones[index].mediaFileName}
        id={`milestones.${index}.mediaUrl`}
        inputLabel={'Media'}
        onUploadStart={handleMediaUploadStart}
        onUploadSettled={() => setIsMediaUploading(false)}
      />

      <Flex
        style={{
          justifyContent: 'flex-end',
        }}
      >
        {formik.values.milestones.length > 1 && (
          <Button variant="outline" width={'auto'} onClick={handleRemoveMilestone}>
            <Icon id="trash" />
          </Button>
        )}
      </Flex>
    </Stack>
  )
}

const EscrowForm: React.FC<EscrowFormProps> = ({
  onSubmit,
  isFormSubmitting,
  escrowFormDataIpfsCID,
}) => {
  const isMobile = useLayoutStore((x) => x.isMobile)

  const [isMediaUploading, setIsMediaUploading] = useState(false)
  const initialValues: EscrowFormValues = {
    clientAddress: '',
    recipientAddress: '',
    milestones: [
      {
        amount: 0,
        title: 'Milestone 1',
        deliveryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10)
          .toISOString()
          .split('T')[0],
        mediaUrl: '',
        mediaType: undefined,
        mediaFileName: '',
        description: 'About Milestone 1',
      },
    ],
    safetyValveDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      .toISOString()
      .split('T')[0],
  }

  const handleSubmit = useCallback(
    (values: EscrowFormValues, actions: FormikHelpers<EscrowFormValues>) => {
      onSubmit?.(values, actions)
    },
    [onSubmit]
  )

  const handleAddMilestone = useCallback(
    (push: (obj: Milestone) => void, previousMilestoneDate: any) => {
      push({
        amount: 0.5,
        title: 'New Milestone',
        deliveryDate: new Date(Date.parse(previousMilestoneDate) + 864000000)
          .toISOString()
          .slice(0, 10), // adds 10 days to previous milestone
        mediaUrl: '',
        mediaType: undefined,
        mediaFileName: '',
        description: '',
      })
    },
    []
  )

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        validationSchema={EscrowFormSchema}
        onSubmit={handleSubmit}
        validateOnMount={false}
        validateOnChange={false}
        validateOnBlur={true}
      >
        {(formik) => (
          <Box
            data-testid="Escrow-form"
            as={'fieldset'}
            disabled={formik.isValidating || isFormSubmitting}
            style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
          >
            <Form>
              {!isMobile && <EscrowDetailsDisplay />}
              <Stack gap={'x5'}>
                <SmartInput
                  type={TEXT}
                  formik={formik}
                  {...formik.getFieldProps('recipientAddress')}
                  id="recipientAddress"
                  inputLabel={'Recipient'}
                  placeholder={'0x... or .eth'}
                  isAddress={true}
                  errorMessage={
                    formik.touched.recipientAddress && formik.errors.recipientAddress
                      ? formik.errors.recipientAddress
                      : undefined
                  }
                  helperText={
                    'The wallet address to which funds will be released on milestone completions.'
                  }
                />
                <SmartInput
                  type={TEXT}
                  formik={formik}
                  {...formik.getFieldProps('clientAddress')}
                  id="clientAddress"
                  inputLabel={'Client'}
                  placeholder={'0x... or .eth'}
                  isAddress={true}
                  errorMessage={
                    formik.touched.clientAddress && formik.errors.clientAddress
                      ? formik.errors.clientAddress
                      : undefined
                  }
                  helperText={
                    'This is the wallet address that will control the escrow for releasing funds. This can be DAO or multisig of working group within the DAO.'
                  }
                />

                <DatePicker
                  {...formik.getFieldProps('safetyValveDate')}
                  formik={formik}
                  id="safetyValveDate"
                  inputLabel={'Safety Valve Date'}
                  placeholder={'yyyy-mm-dd'}
                  dateFormat="Y-m-d"
                  errorMessage={
                    formik.touched.safetyValveDate && formik.errors.safetyValveDate
                      ? formik.errors.safetyValveDate
                      : undefined
                  }
                />
                <Box mt={'x5'}>
                  <FieldArray name="milestones">
                    {({ push, remove }) => (
                      <>
                        <Accordion
                          items={formik.values.milestones.map((_, index) => ({
                            title: formik.values.milestones[index].title,
                            description: (
                              <MilestoneForm
                                key={index}
                                index={index}
                                setIsMediaUploading={setIsMediaUploading}
                                removeMilestone={() => index > 0 && remove(index)}
                              />
                            ),
                          }))}
                        />
                        <Flex align="center" justify="center">
                          <Button
                            variant="secondary"
                            width={'auto'}
                            onClick={() =>
                              handleAddMilestone(
                                push,
                                formik.values?.milestones[
                                  formik.values?.milestones.length - 1
                                ]?.deliveryDate
                              )
                            }
                          >
                            <Icon id="plus" />
                            Create Milestone
                          </Button>
                        </Flex>
                      </>
                    )}
                  </FieldArray>
                </Box>
                <Button
                  mt={'x9'}
                  variant={'outline'}
                  borderRadius={'curved'}
                  type="submit"
                  disabled={
                    !formik.isValid ||
                    isFormSubmitting ||
                    isMediaUploading ||
                    formik.values?.milestones?.length === 0
                  }
                >
                  {isFormSubmitting
                    ? 'Adding Transaction to Queue'
                    : !escrowFormDataIpfsCID
                    ? 'Add Transaction to Queue'
                    : 'Update Transaction Data'}
                </Button>
              </Stack>
            </Form>
          </Box>
        )}
      </Formik>
    </Box>
  )
}

export default EscrowForm
