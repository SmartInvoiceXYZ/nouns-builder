import { Box, Button, Flex, Stack } from '@zoralabs/zord'
import { FieldArray, Form, Formik } from 'formik'
import type { FormikHelpers } from 'formik'
import { useFormikContext } from 'formik'
import React, { useCallback, useState } from 'react'

import TextArea from 'src/components/Fields/TextArea'
import Accordion from 'src/components/Home/accordian'
import { Icon } from 'src/components/Icon'
import Input from 'src/components/Input/Input'
import SingleMediaUpload from 'src/components/SingleMediaUpload/SingleMediaUpload'

import { EscrowFormSchema, EscrowFormValues, Milestone } from './EscrowForm.schema'

export interface EscrowFormProps {
  onSubmit?: (values: EscrowFormValues, actions: FormikHelpers<EscrowFormValues>) => void
  disabled?: boolean
}

const MilestoneForm: React.FC<{
  index: number
  milestone: Milestone
  removeMilestone: () => void
}> = ({ index, milestone, removeMilestone }) => {
  const {
    values,
    handleChange,
    handleBlur,
    errors,
    touched,
    setFieldValue,
    getFieldProps,
  } = useFormikContext<EscrowFormValues>()

  const formik = useFormikContext<EscrowFormValues>()

  const handleRemoveMilestone = useCallback(() => {
    removeMilestone()
  }, [removeMilestone])

  // TODO: Remove logging
  React.useEffect(() => {
    console.log(values)
  }, [values])

  const [isIPFSUploading, setIsIPFSUploading] = useState(false)

  const handleMediaUploadStart = (media: File) => {
    setIsIPFSUploading(true)
    setFieldValue(`milestones.${index}.mediaType`, media.type)
  }

  return (
    <Stack gap={'x4'}>
      <Input
        label="Amount"
        name={`milestones.${index}.amount`}
        type={'number'}
        placeholder={'0.00'}
        autoComplete={'off'}
        secondaryLabel={'ETH'}
      />
      <Input
        mb={'x3'}
        name={`milestones.${index}.title`}
        label="Title"
        type={'text'}
        placeholder={'Milestone Title'}
        autoComplete={'off'}
      />

      <TextArea
        id={`milestones.${index}.description`}
        value={values.milestones[index].description}
        onChange={handleChange}
        onBlur={handleBlur}
        inputLabel="Description"
        placeholder={'Milestone Description'}
      />

      <Input
        type="date"
        name={`milestones.${index}.deliveryDate`}
        label={'Delivery Date'}
      />

      <SingleMediaUpload
        {...getFieldProps('media')}
        formik={formik}
        id={`milestones.${index}.media`}
        inputLabel={'Media'}
        onUploadStart={handleMediaUploadStart}
        onUploadSettled={() => setIsIPFSUploading(false)}
      />

      <Flex
        style={{
          justifyContent: 'flex-end',
        }}
      >
        <Button variant="outline" width={'auto'} onClick={handleRemoveMilestone}>
          <Icon id="trash" />
        </Button>
      </Flex>
    </Stack>
  )
}

const EscrowForm: React.FC<EscrowFormProps> = ({ onSubmit, disabled }) => {
  const initialValues: EscrowFormValues = {
    clientAddress: '',
    recipientAddress: '',
    milestones: [
      {
        amount: 0,
        title: 'Milestone 1',
        deliveryDate: new Date(),
        media: '',
        mediaType: undefined,
        description: 'About Milestone 1',
      },
    ],
    safetyValveDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    arbitrationProvider: '0x18542245cA523DFF96AF766047fE9423E0BED3C0',
    arbitrationCourt: 0,
  }

  const handleSubmit = useCallback(
    (values: EscrowFormValues, actions: FormikHelpers<EscrowFormValues>) => {
      onSubmit?.(values, actions)
    },
    [onSubmit]
  )

  const handleAddMilestone = useCallback((push: (obj: Milestone) => void) => {
    push({
      amount: 0,
      title: '',
      deliveryDate: new Date(),
      media: '',
      mediaType: undefined,
      description: '',
    })
  }, [])

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
        {({ values, errors, touched, isValid, isValidating, dirty }) => (
          <Box
            data-testid="Escrow-form"
            as={'fieldset'}
            disabled={isValidating || disabled}
            style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
          >
            <Form>
              <Stack gap={'x5'}>
                <Input
                  name={'recipientAddress'}
                  label={'Recipient'}
                  type={'text'}
                  placeholder={'0x...'}
                  autoComplete={'off'}
                  secondaryLabel={
                    <Icon
                      id={'checkInCircle'}
                      fill={'positive'}
                      style={{
                        opacity:
                          typeof errors.recipientAddress === 'undefined' && dirty ? 1 : 0,
                        transition: '0.1s opacity',
                      }}
                    />
                  }
                  error={
                    touched.recipientAddress && errors.recipientAddress
                      ? errors.recipientAddress
                      : undefined
                  }
                />
                <Input
                  name={'clientAddress'}
                  label={'Client'}
                  type={'text'}
                  placeholder={'0x...'}
                  autoComplete={'off'}
                  secondaryLabel={
                    <Icon
                      id={'checkInCircle'}
                      fill={'positive'}
                      style={{
                        opacity:
                          typeof errors.clientAddress === 'undefined' && dirty ? 1 : 0,
                        transition: '0.1s opacity',
                      }}
                    />
                  }
                  error={
                    touched.clientAddress && errors.clientAddress
                      ? errors.clientAddress
                      : undefined
                  }
                />

                <Input
                  name={'safetyValveDate'}
                  label={'Safety Valve Date'}
                  type={'date'}
                  autoComplete={'off'}
                  error={
                    touched.safetyValveDate && errors.safetyValveDate
                      ? errors.safetyValveDate
                      : undefined
                  }
                />
                <Box mt={'x5'}>
                  <FieldArray name="milestones">
                    {({ push, remove }) => (
                      <>
                        <Accordion
                          items={values.milestones.map((milestone, index) => ({
                            title: `Milestone ${index + 1}`,
                            description: (
                              <MilestoneForm
                                key={index}
                                index={index}
                                milestone={milestone}
                                removeMilestone={() => remove(index)}
                              />
                            ),
                          }))}
                        />
                        <Flex align="center" justify="center">
                          <Button
                            variant="secondary"
                            width={'auto'}
                            onClick={() => handleAddMilestone(push)}
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
                  disabled={!isValid || disabled}
                >
                  Add Transaction to Queue
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
