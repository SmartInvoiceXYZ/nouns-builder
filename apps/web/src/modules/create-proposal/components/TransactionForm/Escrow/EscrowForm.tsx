import { Box, Button, Flex, Input as Input2 } from '@zoralabs/zord'
import { Form, Formik } from 'formik'
import type { FormikHelpers } from 'formik'
import { useCallback } from 'react'
import type { FC } from 'react'

import TextArea from 'src/components/Fields/TextArea'
import Accordion from 'src/components/Home/accordian'
import { Icon } from 'src/components/Icon'
import Input from 'src/components/Input/Input'

import EscrowFormSchema, { EscrowFormValues } from './EscrowForm.schema'

export interface EscrowFormProps {
  onSubmit?: (values: EscrowFormValues, actions: FormikHelpers<EscrowFormValues>) => void
  disabled?: boolean
}

const MilestoneForm: FC<any> = ({ title, description, amount, removeMilestone }) => {
  return (
    <Box>
      <Input
        name={'title'}
        type={'text'}
        placeholder={'Milestone Title'}
        autoComplete={'off'}
        // error={
        //   touched.recipientAddress && errors.recipientAddress
        //     ? errors.recipientAddress
        //     : undefined
        // }
      />
      <TextArea
        id="description"
        value=""
        placeholder={'Milestone Description'}
        inputLabel={''}
        onChange={() => {}}
        onBlur={() => {}}
      />
      <Input
        name={'amount'}
        type={'text'}
        placeholder={'amount in eth'}
        autoComplete={'off'}
        // error={
        //   touched.recipientAddress && errors.recipientAddress
        //     ? errors.recipientAddress
        //     : undefined
        // }
      />
      <Button variant="outline" mt={'x5'} width={'auto'} onClick={removeMilestone}>
        Remove
      </Button>
    </Box>
  )
}

const EscrowForm: FC<EscrowFormProps> = ({ onSubmit, disabled }) => {
  const initialValues: EscrowFormValues = {
    clientAddress: '',
    recipientAddress: '',
    milestones: [
      {
        title: 'Milestone 1',
        description: 'About Milestone 1',
        amount: 0,
      },
      {
        title: 'Milestone 2',
        description: 'About Milestone 2',
        amount: 0,
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

  const milestones = initialValues.milestones.map((milestone, index) => ({
    title: 'Milestone ' + (index + 1),
    description: (
      <MilestoneForm
        key={index}
        title={milestone.title}
        description={milestone.description}
        amount={milestone.amount}
        removeMilestone={() => removeMilestone(index)}
      />
    ),
  }))

  const addMilestone = () => {
    // add another milestone
  }

  const removeMilestone = (index: number) => {
    // remove milestone
  }

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
        {({ errors, touched, isValid, isValidating, dirty }) => (
          <Box
            data-testid="Escrow-form"
            as={'fieldset'}
            disabled={isValidating || disabled}
            style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
          >
            <Flex as={Form} direction={'column'} gap={'x5'}>
              {/* Service Provider */}
              <Input
                name={'recipientAddress'}
                label={'Recipient Wallet Address/ENS'}
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
              {/* Milestone Releasers or DAO */}
              <Input
                name={'clientAddress'}
                label={'Client Wallet Address/ENS'}
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
                {/* Milestones */}
                <Accordion items={milestones} />
                <Button variant="outline" mt={'x2'} width={'auto'} onClick={addMilestone}>
                  Add Another Milestone
                </Button>
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
          </Box>
        )}
      </Formik>
    </Box>
  )
}

export default EscrowForm
