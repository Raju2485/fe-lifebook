import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import {
  Button,
  Input,
  Select,
  Modal,
  Form,
  Card,
  Row,
  Col,
  Space,
  Radio,
} from 'antd'

const { Item: FormItem } = Form
import { CloseOutlined } from '@ant-design/icons'

import { useShowMessage } from '../../../hooks/useShowMessage.js'
import {
  useAccTypesQuery,
  useRolesQuery,
  useCreateAccountMutation,
  useLazyIsUserExistsQuery,
  useLazyIsAccountExistsQuery,
} from '../services/apiSlice'

const doesUserExist = (response) =>
  response?.data === true ||
  response?.exists === true ||
  response?.data?.exists === true

function AccountFormCard({
  field,
  remove,
  canRemove,
  form,
  accTypes,
  roles,
  orgId,
  isModalSubmitDisabled,
  checkUserExists,
  checkAccountExists,
  isPrefilled,
}) {
  const prefix = field.name
  const isUserExisting = Form.useWatch(
    ['users', prefix, 'isUserExisting'],
    form
  )
  const isPerson = Form.useWatch(['users', prefix, 'isPerson'], form)
  const isMember = Form.useWatch(['users', prefix, 'isMember'], form)
  const accTypeId = Form.useWatch(['users', prefix, 'AccTypeId'], form)
  const accType = accTypes?.data?.find((obj) => obj.id == accTypeId)?.name ?? ''
  const [isEmailTaken, setIsEmailTaken] = useState(false)
  const [isNameTaken, setIsNameTaken] = useState(false)

  const setNestedValue = (name, value) => {
    form.setFieldValue(['users', prefix, name], value)
  }

  const handleEmailBlur = async () => {
    const email = String(
      form.getFieldValue(['users', prefix, 'email']) ?? ''
    ).trim()
    if (!email) {
      setIsEmailTaken(false)
      return
    }

    try {
      const response = await checkUserExists({ email, orgId }).unwrap()
      if (doesUserExist(response)) {
        setIsEmailTaken(true)
        form.setFields([
          {
            name: ['users', prefix, 'email'],
            errors: [`${email} already exists`],
          },
        ])
      } else {
        setIsEmailTaken(false)
      }
    } catch (error) {
      if (doesUserExist(error?.data) || error?.status === 409) {
        setIsEmailTaken(true)
        form.setFields([
          {
            name: ['users', prefix, 'email'],
            errors: [`${email} already exists`],
          },
        ])
        return
      }
      setIsEmailTaken(false)
    }
  }

  const handleNameBlur = async () => {
    const name = String(
      form.getFieldValue(['users', prefix, 'name']) ?? ''
    ).trim()
    if (!name) {
      setIsNameTaken(false)
      return
    }

    try {
      const response = await checkAccountExists({ name, orgId }).unwrap()
      if (doesUserExist(response)) {
        setIsNameTaken(true)
        form.setFields([
          {
            name: ['users', prefix, 'name'],
            errors: [`${name} already exists`],
          },
        ])
      } else {
        setIsNameTaken(false)
      }
    } catch (error) {
      if (doesUserExist(error?.data) || error?.status === 409) {
        setIsNameTaken(true)
        form.setFields([
          {
            name: ['users', prefix, 'name'],
            errors: [`${name} already exists`],
          },
        ])
        return
      }
      setIsNameTaken(false)
    }
  }

  return (
    <Card
      size="small"
      title={`Account ${prefix + 1}`}
      extra={
        canRemove ? (
          <CloseOutlined
            onClick={() => {
              remove(prefix)
            }}
          />
        ) : null
      }
    >
      <Row gutter={24}>
        <Col xs={24} xl={12} span={24} md={24} sm={24}>
          <FormItem
            label="Is the User existing / new:"
            name={[prefix, 'isUserExisting']}
            rules={[
              {
                required: true,
                message: 'Select Existing / New',
              },
            ]}
          >
            <Radio.Group
              disabled={isPrefilled}
              onChange={(e) => {
                if (e.target.value == true) {
                  const accTypePersonal = accTypes?.data?.filter(
                    (obj) => obj.name == 'personal'
                  )
                  setNestedValue('AccTypeId', accTypePersonal?.[0]?.id)
                  setNestedValue('isPerson', true)
                }
              }}
            >
              <Radio value={true}>Existing</Radio>
              <Radio value={false}>New</Radio>
            </Radio.Group>
          </FormItem>
        </Col>
        <Col xs={24} xl={12} span={24} md={24} sm={24}>
          <FormItem
            label="Account Type:"
            name={[prefix, 'AccTypeId']}
            rules={[
              {
                required: true,
                message: 'Select Account Type',
              },
            ]}
          >
            <Select
              placeholder="Select Account Type"
              showSearch
              optionFilterProp="label"
              onChange={(value) => {
                const selected = accTypes?.data?.find((obj) => obj.id === value)
                const selectedName = selected?.name
                if (selectedName === 'real') {
                  if (
                    form.getFieldValue(['users', prefix, 'natureOfAccount']) ===
                    'bank'
                  ) {
                    setNestedValue('natureOfAccount', undefined)
                  }
                } else if (
                  selectedName === 'personal' &&
                  form.getFieldValue(['users', prefix, 'isPerson']) === false
                ) {
                  setNestedValue('natureOfAccount', 'bank')
                } else {
                  setNestedValue('natureOfAccount', undefined)
                }
              }}
              options={
                accTypes?.data?.map((item) => ({
                  value: item.id,
                  label: item.name,
                  disabled: isUserExisting && item.name != 'personal',
                })) ?? []
              }
              disabled={isModalSubmitDisabled || isUserExisting}
            />
          </FormItem>
        </Col>
        {accType == 'personal' && (
          <Col xs={24} xl={12} span={24} md={24} sm={24}>
            <FormItem
              label="Is Person?"
              name={[prefix, 'isPerson']}
              rules={[
                {
                  required: true,
                  message: 'Select Yes / No',
                },
              ]}
            >
              <Radio.Group
                disabled={isUserExisting}
                onChange={(e) => {
                  if (e.target.value === false) {
                    setNestedValue('natureOfAccount', 'bank')
                  } else {
                    setNestedValue('natureOfAccount', undefined)
                  }
                }}
              >
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </FormItem>
          </Col>
        )}
        {((isPerson == true && isUserExisting == false) || isPrefilled) && (
          <Col xs={24} xl={12} span={24} md={24} sm={24}>
            <FormItem
              label="Email:"
              name={[prefix, 'email']}
              rules={[
                ...(!isPrefilled
                  ? [
                      {
                        required: true,
                        message: 'Enter Email',
                      },
                    ]
                  : []),
                {
                  validator: async () => {
                    if (isEmailTaken) {
                      const email = String(
                        form.getFieldValue(['users', prefix, 'email']) ?? ''
                      ).trim()
                      return Promise.reject(
                        new Error(`${email} already exists`)
                      )
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input
                placeholder="Enter Email"
                disabled={isPrefilled}
                onBlur={isPrefilled ? undefined : handleEmailBlur}
                onChange={() => {
                  if (isEmailTaken) {
                    setIsEmailTaken(false)
                  }
                }}
              />
            </FormItem>
          </Col>
        )}
        {isPerson == true && isUserExisting == false && !isPrefilled && (
          <>
            <Col xs={24} xl={12} span={24} md={24} sm={24}>
              <FormItem
                label="Name:"
                name={[prefix, 'name']}
                rules={[
                  {
                    required: true,
                    message: 'Enter Name',
                  },
                ]}
              >
                <Input placeholder="Enter Name" />
              </FormItem>
            </Col>
            <Col xs={24} xl={12} span={24} md={24} sm={24}>
              <FormItem label="Middle Name:" name={[prefix, 'middleName']}>
                <Input placeholder="Enter Middle Name" />
              </FormItem>
            </Col>
            <Col xs={24} xl={12} span={24} md={24} sm={24}>
              <FormItem label="Surname:" name={[prefix, 'surname']}>
                <Input placeholder="Enter Surname" />
              </FormItem>
            </Col>
          </>
        )}
        {(isPerson === false ||
          accType === 'nominal' ||
          accType === 'real' ||
          isPrefilled) && (
          <Col xs={24} xl={12} span={24} md={24} sm={24}>
            <FormItem
              label="Account Name:"
              name={[prefix, 'name']}
              rules={[
                {
                  required: true,
                  message: 'Enter Account Name',
                },
                {
                  validator: async () => {
                    if (isNameTaken) {
                      const name = String(
                        form.getFieldValue(['users', prefix, 'name']) ?? ''
                      ).trim()
                      return Promise.reject(new Error(`${name} already exists`))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input
                placeholder="Enter Account Name"
                disabled={isPrefilled}
                onBlur={isPrefilled ? undefined : handleNameBlur}
                onChange={() => {
                  if (isNameTaken) {
                    setIsNameTaken(false)
                  }
                }}
              />
            </FormItem>
          </Col>
        )}
        {accType == 'real' && (
          <Col xs={24} xl={12} span={24} md={24} sm={24}>
            <FormItem
              label="Nature of Account:"
              name={[prefix, 'natureOfAccount']}
            >
              <Radio.Group>
                <Radio value={'bank'} disabled>
                  Bank
                </Radio>
                <Radio value={'cash'}>Cash</Radio>
              </Radio.Group>
            </FormItem>
          </Col>
        )}
        {accType == 'personal' && isPerson == false && (
          <Col xs={24} xl={12} span={24} md={24} sm={24}>
            <FormItem
              label="Nature of Account:"
              name={[prefix, 'natureOfAccount']}
              rules={[
                {
                  required: true,
                  message: 'Select Bank / Cash',
                },
              ]}
            >
              <Radio.Group disabled={true}>
                <Radio value={'bank'}>Bank</Radio>
                <Radio value={'cash'}>Cash</Radio>
              </Radio.Group>
            </FormItem>
          </Col>
        )}
        {isPerson == true && (
          <Col xs={24} xl={12} span={24} md={24} sm={24}>
            <FormItem
              label="Is member?"
              name={[prefix, 'isMember']}
              rules={[
                {
                  required: true,
                  message: 'Select Yes / No',
                },
              ]}
            >
              <Radio.Group
                onChange={(e) => {
                  if (e.target.value === false) {
                    setNestedValue('RolesIds', undefined)
                  }
                }}
              >
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
              </Radio.Group>
            </FormItem>
          </Col>
        )}
        {isMember && (
          <Col xs={24} xl={12} span={24} md={24} sm={24}>
            <FormItem label="Roles:" name={[prefix, 'RolesIds']}>
              <Select
                mode="multiple"
                allowClear
                placeholder="Select Role(s)"
                showSearch
                optionFilterProp="label"
                disabled={isModalSubmitDisabled}
                options={
                  roles?.data?.map((item) => ({
                    value: item.id,
                    label: item.name,
                  })) ?? []
                }
              />
            </FormItem>
          </Col>
        )}
      </Row>
    </Card>
  )
}

function MultiUserForm({
  multiUserFormOpen,
  setMultiUserFormOpen,
  missingAccountNames = [],
}) {
  const [form] = Form.useForm()
  const [isModalSubmitDisabled, setIsModalSubmitDisabled] = useState(false)
  const { id } = useParams()
  const { showMessage } = useShowMessage()
  const { data: accTypes } = useAccTypesQuery()
  const { data: roles } = useRolesQuery()
  const [createAccount] = useCreateAccountMutation()
  const [checkUserExists] = useLazyIsUserExistsQuery()
  const [checkAccountExists] = useLazyIsAccountExistsQuery()

  useEffect(() => {
    if (!multiUserFormOpen) return
    const personalTypeId = accTypes?.data?.find(
      (obj) => obj.name === 'personal'
    )?.id
    const usersValue =
      missingAccountNames.length > 0
        ? missingAccountNames.map((obj) => ({
            name: obj.accountName,
            email: obj.email ?? undefined,
            isUserExisting: obj.isUserExists,
            ...(obj.isUserExists
              ? {
                  AccTypeId: personalTypeId,
                  isPerson: true,
                }
              : {}),
          }))
        : [{}]
    form.setFieldsValue({ users: usersValue })
  }, [multiUserFormOpen, missingAccountNames, form, accTypes])

  const handleClose = () => {
    form.resetFields()
    setMultiUserFormOpen(false)
  }

  const onFinishModal = async (values) => {
    try {
      setIsModalSubmitDisabled(true)
      const accountsToCreate = values.users ?? []
      let createdCount = 0
      const failedNames = []

      for (const account of accountsToCreate) {
        const response = await createAccount({ ...account, orgId: id })
        if (response?.data?.success === true) {
          createdCount += 1
        } else {
          failedNames.push(
            account.name ?? response?.error?.data?.message ?? 'Unknown account'
          )
        }
      }

      if (failedNames.length === 0) {
        form.resetFields()
        setMultiUserFormOpen(false)
        showMessage({
          type: 'success',
          content: `${createdCount} account(s) created successfully. Retry bulk upload.`,
        })
      } else {
        showMessage({
          type: 'error',
          content: `Created ${createdCount}. Failed: ${failedNames.join(', ')}`,
        })
      }
    } catch (info) {
      console.log('Validate Failed:', info)
      showMessage({
        type: 'error',
        content: 'Failed to create accounts',
      })
    } finally {
      setIsModalSubmitDisabled(false)
    }
  }

  return (
    <Modal
      title=""
      open={multiUserFormOpen}
      width="90%"
      footer={null}
      closable={true}
      onCancel={handleClose}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinishModal}
        initialValues={{ users: [{}] }}
        name="dynamic_form_complex"
      >
        <Card title="Create Accounts" className="primary-color-as-background">
          <Form.List name="users">
            {(fields, { remove }) => (
              <div
                style={{
                  display: 'flex',
                  rowGap: 16,
                  flexDirection: 'column',
                }}
              >
                {fields.map((field) => (
                  <AccountFormCard
                    key={field.key}
                    field={field}
                    remove={remove}
                    canRemove={
                      fields.length > 1 && missingAccountNames.length === 0
                    }
                    form={form}
                    accTypes={accTypes}
                    roles={roles}
                    orgId={id}
                    isModalSubmitDisabled={isModalSubmitDisabled}
                    checkUserExists={checkUserExists}
                    checkAccountExists={checkAccountExists}
                    isPrefilled={missingAccountNames.length > 0}
                  />
                ))}
              </div>
            )}
          </Form.List>
        </Card>
        <br />

        <FormItem className="text-center">
          <Space>
            <Button
              htmlType="submit"
              type="primary"
              size="medium"
              disabled={isModalSubmitDisabled}
            >
              Submit
            </Button>
            <Button onClick={handleClose} type="primary" ghost size="medium">
              Close
            </Button>
          </Space>
        </FormItem>
      </Form>
    </Modal>
  )
}

export { MultiUserForm }
