import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import {
  Button,
  DatePicker,
  Flex,
  Input,
  InputNumber,
  Pagination,
  Select,
  Table,
  Typography,
  Modal,
  Form,
  Card as AntCard,
  Row,
  Col,
  Space,
  Radio,
} from 'antd'

const { Item: FormItem } = Form
import {
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import './BusinessAndAccountsById.scss'
import TextArea from 'antd/es/input/TextArea'

import { useShowMessage } from '../../../hooks/useShowMessage.js'
import {
  useAccountsQuery,
  useCreateAccountMutation,
  useAccTypesQuery,
  useRolesQuery,
  useNonAccountUsersQuery,
  useLazyIsAccountExistsQuery,
  useLazyIsUserExistsQuery,
  useJournalsQuery,
  usePostJournalEntryMutation
} from '../services/apiSlice'

const DATE_FORMAT = 'D-MMM-YYYY'
const DATE_TIME_FORMAT = 'D-MMM-YYYY HH:mm:ss'
// const ACCOUNT_OPTIONS =
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]
const YEAR_OPTIONS = [
  { value: 2026, label: '2026' },
  { value: 2025, label: '2025' },
  { value: 2024, label: '2024' },
]
const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
]

const SAMPLE_TRANSACTIONS = [
  {
    key: '1',
    date: '1-Jan-2026',
    debitor: 'Account 1',
    creditor: 'Account 2',
    particulars: 'Bought furniture',
    amount: '30000',
  },
]

function formatAccountLabel(account) {
  if (!account) return ''
  if (account.User) {
    return `${account.User.name}(${account.User.uid})`
  }
  return account.name ?? ''
}

function extractJournalPagination(journals) {
  return journals?.pagination ?? journals?.data?.pagination ?? null
}

function extractJournalRecords(journals) {
  const payload =
    journals?.data && !Array.isArray(journals.data) ? journals.data : journals
  const candidates = [
    payload?.rows,
    payload?.records,
    payload?.entries,
    payload?.journals,
    payload?.data,
    Array.isArray(journals?.data) ? journals.data : null,
  ]
  return candidates.find(Array.isArray) ?? []
}

const TABLE_COLUMNS = [
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Debitor', dataIndex: 'debitor', key: 'debitor' },
  { title: 'Creditor', dataIndex: 'creditor', key: 'creditor' },
  { title: 'Particulars', dataIndex: 'particulars', key: 'particulars' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' },
]

function BusinessAndAccountsById() {
  const [reportYear, setReportYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [rangeStart, setRangeStart] = useState(dayjs().startOf('year'))
  const [rangeEnd, setRangeEnd] = useState(dayjs())
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [open, setOpen] = useState(false)
  const [isModalSubmitDisabled, setIsModalSubmitDisabled] = useState(false)
  const [isEmailTaken, setIsEmailTaken] = useState(false)
  const [isNameTaken, setIsNameTaken] = useState(false)

  const { showMessage } = useShowMessage()
  const [form2] = Form.useForm()
  const [form] = Form.useForm()
  const { id, orgName } = useParams()

  const { data: accounts } = useAccountsQuery(
    // { count: 5 },
    // This option forces a refetch on component mount
    { refetchOnMountOrArgChange: true, orgId: id }
  )

  const [createAccount] = useCreateAccountMutation()
  const [postJournalEntry] = usePostJournalEntryMutation()
  const { data: journals } = useJournalsQuery(
    {
      orgId: id,
      page: currentPage,
      perPage: pageSize,
      startDate: rangeStart?.format('YYYY-MM-DD'),
      endDate: rangeEnd?.format('YYYY-MM-DD'),
      search: searchText.trim() || undefined,
    },
    { refetchOnMountOrArgChange: true }
  )
  const [checkUserExists, { isFetching: isCheckingEmail }] =
    useLazyIsUserExistsQuery()
  const [checkAccountExists, { isFetching: isCheckingAccount }] =
    useLazyIsAccountExistsQuery()
  const { data: accTypes } = useAccTypesQuery()
  const { data: roles } = useRolesQuery()
  const { data: users } = useNonAccountUsersQuery({ orgId: id })

  const isMember = Form.useWatch('isMember', form2)
  const isUserExisting = Form.useWatch('isUserExisting', form2)
  const isPerson = Form.useWatch('isPerson', form2)
  const accTypeId = Form.useWatch('AccTypeId', form2)
  const debitAccount = Form.useWatch('DebitorId', form)
  const creditAccount = Form.useWatch('CreditorId', form)

  const selectedDebitor = accounts?.data?.find((obj) => obj.id == debitAccount)
  const selectedCreditor = accounts?.data?.find((obj) => obj.id == creditAccount)

  let accType = accTypes?.data?.filter((obj) => obj.id == accTypeId)
  accType = accType ? accType?.[0]?.name : ''

  const accountSelectOptions = (disabledId) =>
    accounts?.data?.map((obj) => ({
      value: obj.id,
      label: obj?.User ? `${obj.User.name}(${obj.User.uid})` : '',
      disabled: disabledId != null && obj.id === disabledId,
    })) ?? []

  const journalPagination = extractJournalPagination(journals)
  const journalRecords = extractJournalRecords(journals)

  const journalRows = useMemo(
    () =>
      journalRecords.map((row, index) => {
        const dateValue = row.date ? dayjs(row.date) : null
        return {
          key: row.id ?? index,
          dateValue,
          date: dateValue ? dateValue.format(DATE_FORMAT) : '',
          debitor: `${row.Debitor.User.name} (${row.Debitor.User.uid})`,

          creditor:
            `${row.Creditor.User.name} (${row.Creditor.User.uid})`,
          particulars: row.particulars ?? '',
          amount: row.amount ?? '',
        }
      }),
    [journalRecords, currentPage]
  )

  const journalTotal = Number(journalPagination?.totalRecords) || 0
  const journalPage = Number(journalPagination?.currentPage) || currentPage
  const journalPageSize = Number(journalPagination?.totalPerPage) || pageSize

  const handleBulkUpload = () => {
    // Placeholder until bulk upload API is wired up.
  }

  const handleTemplateDownload = () => {
    // Placeholder until bulk upload API is wired up.
  }

  const handleCreateAccountModal = () => {
    setIsEmailTaken(false)
    setIsNameTaken(false)
    setOpen(true)
  }

  const handlePostJournalEntry = async (values) => {
    try {
      setIsModalSubmitDisabled(true)
      const response = await postJournalEntry({
        ...values,
        date: values.date
          ? dayjs(values.date).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        orgId: id,
      })

      if (response?.data?.success === true) {
        form.resetFields()
        showMessage({
          type: 'success',
          content: response?.data?.msg ?? 'Journal entry posted successfully!',
        })
      } else {
        showMessage({
          type: 'error',
          content: response?.error?.data?.message ?? 'Failed to post journal entry',
        })
      }
    } catch (info) {
      console.log('Error posting journal entry:', info)
    } finally {
      setIsModalSubmitDisabled(false)
    }
  }

  const handleClose = () => {
    setIsEmailTaken(false)
    setIsNameTaken(false)
    setOpen(false)
  }

  const doesUserExist = (response) =>
    response?.data === true ||
    response?.exists === true ||
    response?.data?.exists === true

  const handleEmailBlur = async () => {
    const email = String(form2.getFieldValue('email') ?? '').trim()
    if (!email) {
      setIsEmailTaken(false)
      return
    }

    try {
      const response = await checkUserExists({ email, orgId: id }).unwrap()
      if (doesUserExist(response)) {
        setIsEmailTaken(true)
        form2.setFields([
          {
            name: 'email',
            errors: [`${email} already exists`],
          },
        ])
      } else {
        setIsEmailTaken(false)
      }
    } catch (error) {
      if (doesUserExist(error?.data) || error?.status === 409) {
        setIsEmailTaken(true)
        form2.setFields([
          {
            name: 'email',
            errors: [`${email} already exists`],
          },
        ])
        return
      }
      setIsEmailTaken(false)
    }
  }

  const handleNameBlur = async () => {
    const name = String(form2.getFieldValue('name') ?? '').trim()
    if (!name) {
      setIsNameTaken(false)
      return
    }

    try {
      const response = await checkAccountExists({ name, orgId: id }).unwrap()
      if (doesUserExist(response)) {
        setIsNameTaken(true)
        form2.setFields([
          {
            name: 'name',
            errors: [`${name} already exists`],
          },
        ])
      } else {
        setIsNameTaken(false)
      }
    } catch (error) {
      if (doesUserExist(error?.data) || error?.status === 409) {
        setIsNameTaken(true)
        form2.setFields([
          {
            name: 'name',
            errors: [`${name} already exists`],
          },
        ])
        return
      }
      setIsNameTaken(false)
    }
  }

  const onFinishModal = async () => {
    try {
      if (isEmailTaken || isCheckingEmail) {
        return
      }
      if (isNameTaken || isCheckingAccount) {
        return
      }
      setIsModalSubmitDisabled(true)
      const values = await form2.validateFields()

      const response = await createAccount({ ...values, orgId: id })

      if (response?.data?.success === true) {
        form2.resetFields()
        setIsEmailTaken(false)
        setIsNameTaken(false)
        setOpen(false)
        showMessage({
          type: 'success',
          content: response?.data?.msg ?? 'Account created successfully!',
        })
      } else {
        showMessage({
          type: 'error',
          content: response?.error?.data?.message ?? 'Failed to create account',
        })
      }
    } catch (info) {
      console.log('Validate Failed:', info)
    } finally {
      setIsModalSubmitDisabled(false)
    }
  }

  const onChange = (value) => {
    console.log(`selected ${value}`)
  }
  const onSearch = (value) => {
    console.log('search:', value)
  }

  return (
    <div className="accounts-by-id">
      <Typography.Title
        level={3}
        className="accounts-by-id__panel-title center"
      >
        {orgName}
      </Typography.Title>
      <div className="accounts-by-id__top">
        <section className="accounts-by-id__panel accounts-by-id__journal">
          <Form
            form={form}
            layout="vertical"
            onFinish={handlePostJournalEntry}
            initialValues={{ date: dayjs() }}
          >
            <AntCard
              title="Journal Entry"
              className="accounts-by-id__panel-title"
            >
              <Row gutter={24}>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem
                    name="date"
                    label="Date:"
                    rules={[{ required: true, message: 'Select Date' }]}
                  >
                    <DatePicker
                      placeholder="Select Date"
                      format={DATE_FORMAT}
                      allowClear={false}
                      style={{ width: '100%', marginBottom: 0 }}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem
                    label="Amount:"
                    name="amount"
                    rules={[{ required: true, message: 'Enter Amount' }]}
                  >
                    <InputNumber
                      style={{ width: '100%', marginBottom: 0 }}
                      placeholder="Amount"
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  {/* <div className="accounts-by-id__account-row"> */}
                  <FormItem
                    label="Debit from:"
                    name="DebitorId"
                    rules={[{ required: true, message: 'Select Debitor' }]}
                    style={{ flex: 1, marginBottom: 0 }}
                    extra={
                      debitAccount ? (
                        <div className="accounts-by-id__account-meta">
                          <div>
                            A/c type: {selectedDebitor?.AccTypeMaster?.name ?? '-'}
                          </div>
                          <div>
                            Golden rule:{' '}
                            {selectedDebitor?.AccTypeMaster?.goldenRule ?? '-'}
                          </div>
                        </div>
                      ) : null
                    }
                  >
                    <Select
                      options={accountSelectOptions(creditAccount)}
                      placeholder="Select Debitor"
                    />
                  </FormItem>
                  {/* </div> */}
                </Col>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem
                    label="Credit to:"
                    name="CreditorId"
                    rules={[{ required: true, message: 'Select Creditor' }]}
                    style={{ flex: 1, marginBottom: 0 }}
                    extra={
                      creditAccount ? (
                        <div className="accounts-by-id__account-meta">
                          <div>
                            A/c type:{' '}
                            {selectedCreditor?.AccTypeMaster?.name ?? '-'}
                          </div>
                          <div>
                            Golden rule:{' '}
                            {selectedCreditor?.AccTypeMaster?.goldenRule ?? '-'}
                          </div>
                        </div>
                      ) : null
                    }
                  >
                    <Select
                      options={accountSelectOptions(debitAccount)}
                      placeholder="Select Creditor"
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} xl={24} span={24} md={24} sm={24}>
                  <FormItem
                    label="Particulars:"
                    name="particulars"
                    rules={[{ required: true, message: 'Enter Particulars' }]}
                  >
                    <TextArea placeholder="Particulars" />
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} xl={24} span={24} md={24} sm={24}>
                  <Form.Item className="text-center">
                    <Button
                      type="primary"
                      size="medium"
                      htmlType="submit"
                      disabled={isModalSubmitDisabled}
                    >
                      Post Journal Entry
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </AntCard>
          </Form>
        </section>

        <section className="accounts-by-id__panel accounts-by-id__reports">
          <div className="accounts-by-id__reports-header">
            <Typography.Title level={5} className="accounts-by-id__panel-title">
              Financial Reports:
            </Typography.Title>
            <Select
              value={reportYear}
              options={YEAR_OPTIONS}
              onChange={setReportYear}
              style={{ width: 88 }}
            />
          </div>

          <div className="accounts-by-id__month-grid">
            {MONTHS.map((month) => (
              <Button
                key={month}
                type={selectedMonth === month ? 'primary' : 'default'}
                className="accounts-by-id__month-btn"
                onClick={() => setSelectedMonth(month)}
              >
                {month}
              </Button>
            ))}
          </div>
          <br />
          <br />
          <div className="flex">
            <Button
              type="default"
              className="flex-button"
              icon={<DownloadOutlined />}
              iconPlacement="end"
              onClick={handleTemplateDownload}
            >
              Bulk upload template
            </Button>
            <Button
              type="default"
              className="flex-button"
              icon={<UploadOutlined />}
              iconPlacement="end"
              onClick={handleBulkUpload}
            >
              Bulk upload
            </Button>
            <Button
              type="default"
              className="flex-button"
              onClick={handleCreateAccountModal}
            >
              Create Account
            </Button>
          </div>
        </section>
      </div>

      <section className="accounts-by-id__panel accounts-by-id__table-panel">
        <div className="accounts-by-id__table-controls">
          <Flex gap={8} align="center" wrap="wrap">
            <DatePicker
              value={rangeStart}
              format={DATE_FORMAT}
              onChange={(value) => {
                if (!value) return
                setRangeStart(value)
                setCurrentPage(1)
              }}
              allowClear={false}
            />
            <span>-</span>
            <DatePicker
              value={rangeEnd}
              format={DATE_FORMAT}
              onChange={(value) => {
                if (!value) return
                setRangeEnd(value)
                setCurrentPage(1)
              }}
              allowClear={false}
            />
          </Flex>

          <Input
            className="accounts-by-id__search"
            placeholder="Search"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value)
              setCurrentPage(1)
            }}
            allowClear
          />
        </div>

        <Table
          columns={TABLE_COLUMNS}
          dataSource={journalRows}
          rowKey="key"
          pagination={false}
          size="middle"
          bordered
        />

        <div className="accounts-by-id__table-footer">
          <div className="accounts-by-id__pagination">
            <Pagination
              current={journalPage}
              pageSize={journalPageSize}
              total={journalTotal}
              showSizeChanger={false}
              showQuickJumper={false}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>

          <div className="accounts-by-id__page-size">
            <Select
              value={pageSize}
              options={PAGE_SIZE_OPTIONS}
              onChange={(value) => {
                setPageSize(value)
                setCurrentPage(1)
              }}
              style={{ width: 72 }}
            />
          </div>
        </div>
      </section>

      <Modal
        title=""
        open={open}
        width="50%"
        footer={null}
        // className={styles.customModal}
        closable={false}
        onCancel={handleClose}
      >
        <div
        // className={`${styles.table_row}`}
        >
          <Form form={form2} layout="vertical" onFinish={onFinishModal}>
            <AntCard
              title={'Create Account'}
              // className={styles.CustomPanel}
            >
              <Row gutter={24}>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem
                    label="Is the User existing / new:"
                    name="isUserExisting"
                    rules={[
                      {
                        required: true,
                        message: 'Select Existing / New',
                      },
                    ]}
                  >
                    <Radio.Group
                      onChange={(e) => {
                        // const selectedAccType = accTypes?.data?.filter(
                        //   (obj) => obj.id == form2.getFieldValue('AccTypeId')
                        // );
                        if (e.target.value == true) {
                          const accTypePersonal = accTypes?.data?.filter(
                            (obj) => obj.name == 'personal'
                          )

                          form2.setFieldValue(
                            'AccTypeId',
                            accTypePersonal?.[0]?.id
                          )
                          form2.setFieldValue('isPerson', true)
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
                    name="AccTypeId"
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
                      optionFilterProp="children"
                      onSearch={(e) => onSearch(e, 'accType')}
                      onChange={(value) => {
                        const selected = accTypes?.data?.find(
                          (obj) => obj.id === value
                        )
                        const selectedName = selected?.name
                        if (selectedName === 'real') {
                          if (
                            form2.getFieldValue('natureOfAccount') === 'bank'
                          ) {
                            form2.setFieldValue('natureOfAccount', undefined)
                          }
                        } else if (
                          selectedName === 'personal' &&
                          form2.getFieldValue('isPerson') === false
                        ) {
                          form2.setFieldValue('natureOfAccount', 'bank')
                        } else {
                          form2.setFieldValue('natureOfAccount', undefined)
                        }
                      }}
                      options={
                        accTypes?.data?.map((item) => ({
                          value: item.id,
                          label: item.name,
                          disabled:
                            isUserExisting && item.name != 'personal' && true,
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
                      name="isPerson"
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
                            form2.setFieldValue('natureOfAccount', 'bank')
                          } else {
                            form2.setFieldValue('natureOfAccount', undefined)
                          }
                        }}
                      >
                        <Radio value={true}>Yes</Radio>
                        <Radio value={false}>No</Radio>
                      </Radio.Group>
                    </FormItem>
                  </Col>
                )}
                {isPerson == true && isUserExisting == false && (
                  <>
                    <Col xs={24} xl={12} span={24} md={24} sm={24}>
                      <FormItem
                        label="Email:"
                        name="email"
                        rules={[
                          {
                            required: true,
                            message: 'Enter Email',
                          },
                          {
                            validator: async () => {
                              if (isEmailTaken) {
                                const email = String(
                                  form2.getFieldValue('email') ?? ''
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
                          onBlur={handleEmailBlur}
                          onChange={() => {
                            if (isEmailTaken) {
                              setIsEmailTaken(false)
                            }
                          }}
                        />
                      </FormItem>
                    </Col>
                    <Col xs={24} xl={12} span={24} md={24} sm={24}>
                      <FormItem
                        label="Name:"
                        name="name"
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
                      <FormItem label="Middle Name:" name="middleName">
                        <Input placeholder="Enter Middle Name" />
                      </FormItem>
                    </Col>
                    <Col xs={24} xl={12} span={24} md={24} sm={24}>
                      <FormItem label="Surname:" name="surname">
                        <Input placeholder="Enter Surname" />
                      </FormItem>
                    </Col>
                  </>
                )}
                {(isPerson === false ||
                  accType === 'nominal' ||
                  accType === 'real') && (
                  <Col xs={24} xl={12} span={24} md={24} sm={24}>
                    <FormItem
                      label="Account Name:"
                      name="name"
                      rules={[
                        {
                          required: true,
                          message: 'Enter Account Name',
                        },
                        {
                          validator: async () => {
                            if (isNameTaken) {
                              const name = String(
                                form2.getFieldValue('name') ?? ''
                              ).trim()
                              return Promise.reject(
                                new Error(`${name} already exists`)
                              )
                            }

                            return Promise.resolve()
                          },
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter Account Name"
                        onBlur={handleNameBlur}
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
                    <FormItem label="Nature of Account:" name="natureOfAccount">
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
                      name="natureOfAccount"
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
                {isUserExisting && (
                  <Col xs={24} xl={12} span={24} md={24} sm={24}>
                    <FormItem
                      label="User:"
                      name="UserId"
                      rules={[
                        {
                          required: true,
                          message: 'Select User',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select User"
                        showSearch
                        optionLabelProp="displayName"
                        filterOption={(input, option) =>
                          String(option?.searchText ?? '')
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        onSearch={(e) => onSearch(e, 'user')}
                        onChange={(e) => onChange(e, 'user')}
                        disabled={isModalSubmitDisabled}
                        options={
                          users?.data?.map((item) => ({
                            value: item.id,
                            displayName: `${item.name} (${item.uid})`,
                            searchText: `${item.name} ${item.uid} ${item.email ?? ''}`,
                            label: (
                              <div className="accounts-by-id__user-option">
                                <div>{`${item.name} (${item.uid})`}</div>
                                <div className="accounts-by-id__user-option-email">
                                  {item.email}
                                </div>
                              </div>
                            ),
                          })) ?? []
                        }
                      />
                    </FormItem>
                  </Col>
                )}
                {isPerson == true && (
                  <Col xs={24} xl={12} span={24} md={24} sm={24}>
                    <FormItem
                      label="Is member?"
                      name="isMember"
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
                            form2.setFieldsValue({ RolesIds: undefined })
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
                    <FormItem label="Roles:" name="RolesIds">
                      <Select
                        mode="multiple"
                        allowClear
                        placeholder="Select Role(s)"
                        showSearch
                        optionFilterProp="children"
                        onSearch={(e) => onSearch(e, 'roles')}
                        onChange={(e) => onChange(e, 'roles')}
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
            </AntCard>

            <FormItem className="text-center">
              <Space>
                <Button
                  // className={styles.inwardButton}
                  htmlType="submit"
                  type="primary"
                  size="medium"
                  disabled={
                    isModalSubmitDisabled ||
                    isEmailTaken ||
                    isCheckingEmail ||
                    isNameTaken ||
                    isCheckingAccount
                  }
                >
                  Submit
                </Button>
                <Button
                  // className={styles.inwardButton}
                  onClick={handleClose}
                  type="primary"
                  ghost
                  size="medium"
                >
                  Close
                </Button>
              </Space>
            </FormItem>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export { BusinessAndAccountsById }
