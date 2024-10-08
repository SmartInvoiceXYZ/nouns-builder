import { Box, Button, Flex, Text } from '@zoralabs/zord'
import { FieldArray, Form, Formik } from 'formik'
import type { FormikHelpers } from 'formik'
import { useFormikContext } from 'formik'
import React, { useCallback } from 'react'

import TextArea from 'src/components/Fields/TextArea'
import Accordion from 'src/components/Home/accordian'
import { Icon } from 'src/components/Icon'
import Input from 'src/components/Input/Input'

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
  const { values, handleChange, handleBlur, errors, touched } =
    useFormikContext<EscrowFormValues>()

  const handleRemoveMilestone = useCallback(() => {
    removeMilestone()
  }, [removeMilestone])

  return (
    <Box>
      <Input
        mb={'x3'}
        label="Amount (ETH)"
        name={`milestones.${index}.amount`}
        type={'number'}
        placeholder={'0.00 ETH'}
        autoComplete={'off'}
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
        mb={'x5'}
        id={`milestones.${index}.description`}
        value={values.milestones[index].description}
        onChange={handleChange}
        onBlur={handleBlur}
        inputLabel="Description"
        placeholder={'Milestone Description'}
      />

      <Input
        mb={'x5'}
        type="date"
        name={`milestones.${index}.deliveryDate`}
        label={'Delivery Date'}
      />
      <Input type="file" name={`milestones.${index}.media`} label={'Media'} />
      <Flex
        style={{
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="outline"
          mt={'x5'}
          width={'auto'}
          onClick={handleRemoveMilestone}
        >
          <Icon id="trash" />
        </Button>
      </Flex>
    </Box>
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
        description: 'About Milestone 1',
      },
    ],
    safetyValveDate: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    arbitrationProvider: '',
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
      description: '',
    })
  }, [])

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        validationSchema={EscrowFormSchema}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {({ values, errors, touched, isValid, isValidating, dirty }) => (
          <Box
            data-testid="Escrow-form"
            as={'fieldset'}
            disabled={isValidating || disabled}
            style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
          >
            <Form>
              <Flex direction={'column'} gap={'x5'}>
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
                        <Box style={{ alignItems: 'center' }}>
                          <Button
                            variant="secondary"
                            mt={'x2'}
                            width={'auto'}
                            onClick={() => handleAddMilestone(push)}
                          >
                            <Icon id="plus" />
                            Create Milestone
                          </Button>
                        </Box>
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
              </Flex>
            </Form>
          </Box>
        )}
      </Formik>
    </Box>
  )
}

export default EscrowForm
