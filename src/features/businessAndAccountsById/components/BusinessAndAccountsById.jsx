import { useMemo, useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
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
  Upload,
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
import { MultiUserForm } from './MultiUserForm.jsx'
import { Accounts } from '../../accounts/components/Accounts.jsx'
import { Staff } from '../../staff/components/Staff.jsx'

import { useShowMessage } from '../../../hooks/useShowMessage.js'
import {
  useAccountsQuery,
  useJournalsQuery,
  usePostJournalEntryMutation,
  useLazyBulkUploadTemplateQuery,
  useBulkUploadMutation,
  useGetYearsAndMonthsQuery,
} from '../services/apiSlice.js'
import { useOrgsQuery } from '../../businessAndAccounts/services/apiSlice.js'

const DATE_FORMAT = 'D-MMM-YYYY'

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
]

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

function isAccountsNotFoundResponse(payload) {
  const msg = payload?.msg ?? payload?.message ?? payload?.data?.msg
  return msg === 'Account(s) not found'
}

const TABLE_COLUMNS = [
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Debtor', dataIndex: 'debtor', key: 'debtor' },
  { title: 'Creditor', dataIndex: 'creditor', key: 'creditor' },
  { title: 'Particulars', dataIndex: 'particulars', key: 'particulars' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' },
  {
    title: 'Is Adjustment?',
    dataIndex: 'isAdjustment',
    key: 'isAdjustment',
    render: (text) => (text ? 'Yes' : ''),
  },
]

function BusinessAndAccountsById() {
  const [reportYear, setReportYear] = useState({})
  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [rangeStart, setRangeStart] = useState(dayjs().startOf('year'))
  const [rangeEnd, setRangeEnd] = useState(dayjs())
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [isModalSubmitDisabled, setIsModalSubmitDisabled] = useState(false)

  const [multiUserFormOpen, setMultiUserFormOpen] = useState(false)
  const [missingAccountNames, setMissingAccountNames] = useState([])
  const [bulkFileList, setBulkFileList] = useState([])
  const { showMessage } = useShowMessage()
  const [form] = Form.useForm()
  const { id, orgName } = useParams()
  const [accountSearch, setAccountSearch] = useState()

  const { data: accounts } = useAccountsQuery(
    // { count: 5 },
    // This option forces a refetch on component mount
    { refetchOnMountOrArgChange: true, orgId: id, search: accountSearch }
  )
  const { data: orgs } = useOrgsQuery({
    refetchOnMountOrArgChange: true,
    id: id,
  })
  const currentOrg = orgs?.data

  const currentOrgRoles =
    currentOrg?.StaffJs?.[0]?.RolesMs?.map((role) =>
      role?.name?.toLowerCase()
    ) ?? []
  console.log('currentOrgRoles = ', currentOrgRoles)
  const isAdmin = currentOrg?.StaffJs?.[0]?.isAdmin ? true : false

  if (isAdmin) {
    currentOrgRoles.push('admin')
  }

  const [postJournalEntry] = usePostJournalEntryMutation()
  const [bulkUpload, { isLoading: isBulkUploading }] = useBulkUploadMutation()
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

  const [downloadBulkUploadTemplate] = useLazyBulkUploadTemplateQuery()

  const { data: yearsAndMonths } = useGetYearsAndMonthsQuery({
    orgId: id,
    type: 'financial-reports',
  })
  useEffect(() => {
    const years = yearsAndMonths?.data ?? []
    if (years.length === 0) {
      setReportYear(null)
      return
    }
    const stillSelected = years.find((item) => item.id === reportYear?.id)
    setReportYear(stillSelected ?? years[0])
  }, [reportYear?.id, yearsAndMonths])

  useEffect(() => {
    setMonths(
      yearsAndMonths?.data?.find((item) => item.id === reportYear?.id)
        ?.months ?? []
    )
  }, [reportYear, yearsAndMonths])

  const debitAccount = Form.useWatch('DebtorId', form)
  const creditAccount = Form.useWatch('CreditorId', form)

  const selectedDebtor = accounts?.data?.find((obj) => obj.id == debitAccount)
  const selectedCreditor = accounts?.data?.find(
    (obj) => obj.id == creditAccount
  )
  const lastDebtorRef = useRef()
  const lastCreditorRef = useRef()

  const getAccountTypeName = (accountId) => {
    const account = accounts?.data?.find((obj) => obj.id == accountId)
    return String(account?.AccTypeMaster?.name ?? '').toLowerCase()
  }

  const isRestrictedPair = (firstId, secondId) => {
    const firstType = getAccountTypeName(firstId)
    const secondType = getAccountTypeName(secondId)
    if (!firstType || !secondType) return false
    return (
      (firstType === 'real' && secondType === 'real') ||
      (firstType === 'nominal' && secondType === 'nominal')
    )
  }

  const navigate = useNavigate()

  const handleDebtorChange = (value) => {
    if (isRestrictedPair(value, form.getFieldValue('CreditorId'))) {
      Modal.warning({
        title: "Debtor and Creditor can't be real accounts / nominal accounts",
      })
      form.setFieldValue('DebtorId', lastDebtorRef.current)
      return
    }
    lastDebtorRef.current = value
  }

  const handleCreditorChange = (value) => {
    if (isRestrictedPair(form.getFieldValue('DebtorId'), value)) {
      Modal.warning({
        title: "Debtor and Creditor can't be real accounts / nominal accounts",
      })
      form.setFieldValue('CreditorId', lastCreditorRef.current)
      return
    }
    lastCreditorRef.current = value
  }

  const accountSelectOptions = (disabledId) =>
    accounts?.data?.map((obj) => ({
      value: obj.id,
      label: obj?.User ? `${obj.User.name}(${obj.User.uid})` : '',
      disabled: disabledId != null && obj.id === disabledId,
    })) ?? []

  const journalPagination = extractJournalPagination(journals)
  const journalRecords = extractJournalRecords(journals)

  console.log('journalRecords = ', journalRecords)

  const journalRows = useMemo(
    () =>
      journalRecords.map((row, index) => {
        const dateValue = row.date ? dayjs(row.date) : null
        return {
          key: row.id ?? index,
          dateValue,
          date: dateValue ? dateValue.format(DATE_FORMAT) : '',
          debtor: `${row.Debtor.name}`,

          creditor: `${row.Creditor.name}`,
          particulars: row.particulars ?? '',
          amount: row.amount ?? '',
        }
      }),
    [journalRecords]
  )

  const journalTotal = Number(journalPagination?.totalRecords) || 0
  const journalPage = Number(journalPagination?.currentPage) || currentPage
  const journalPageSize = Number(journalPagination?.totalPerPage) || pageSize

  const handleTemplateDownload = async () => {
    try {
      const bulkUploadTemplate = await downloadBulkUploadTemplate({
        orgId: id,
      }).unwrap()
      if (!bulkUploadTemplate) {
        throw new Error('Template not available')
      }

      const blob =
        bulkUploadTemplate instanceof Blob
          ? bulkUploadTemplate
          : new Blob([bulkUploadTemplate], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bulk-upload-template.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
      showMessage({
        type: 'success',
        content: 'Template downloaded successfully!',
      })
    } catch (error) {
      showMessage({
        type: 'error',
        content: error?.data?.message ?? 'Failed to download template',
      })
    }
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
        lastDebtorRef.current = undefined
        lastCreditorRef.current = undefined
        showMessage({
          type: 'success',
          content: response?.data?.msg ?? 'Journal entry posted successfully!',
        })
      } else {
        showMessage({
          type: 'error',
          content:
            response?.error?.data?.message ?? 'Failed to post journal entry',
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

  const onChange = (value) => {
    console.log(`selected ${value}`)
  }

  const onSearch = async (value, type) => {
    console.log('search:', value, type)
    try {
      if (type === 'debtor' || type === 'creditor') {
        setAccountSearch(value)
      }
    } catch (error) {
      console.log('Error searching:', error)
    }
  }

  const uploadBulkUploadTemplateProps = {
    accept: '.xlsx,.xls',
    maxCount: 1,
    fileList: bulkFileList,
    disabled: isBulkUploading,
    beforeUpload: (file) => {
      setBulkFileList([file])
      return false
    },
    onRemove: () => {
      if (isBulkUploading) return false
      setBulkFileList([])
    },
  }

  const handleBulkUploadSubmit = async () => {
    const selected = bulkFileList[0]
    const file = selected?.originFileObj ?? selected
    if (!file) return

    try {
      const response = await bulkUpload({ file, orgId: id }).unwrap()
      if (isAccountsNotFoundResponse(response)) {
        const names = response?.data ?? []
        setMissingAccountNames(names)
        setMultiUserFormOpen(true)
        showMessage({
          type: 'warning',
          content:
            names.length > 0
              ? `${names.length} account(s) not found. Create them, then retry bulk upload.`
              : 'Account(s) not found',
        })
        return
      }
      if (response?.data?.success === true || response?.success === true) {
        setBulkFileList([])
        showMessage({
          type: 'success',
          content:
            response?.data?.msg ??
            'Bulk journals entries uploaded successfully!',
        })
      } else {
        const message = response?.error?.data?.msg ? (
          Array.isArray(response?.error?.data?.msg) ? (
            <ol>
              {response?.error?.data?.msg.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ol>
          ) : (
            response?.error?.data?.msg
          )
        ) : (
          'Failed to upload bulk journals entries.'
        )
        showMessage({
          type: 'error',
          content: message,
        })
      }
    } catch (error) {
      const payload = error?.data ?? error
      if (isAccountsNotFoundResponse(payload)) {
        const names = payload?.data ?? []
        setMissingAccountNames(names)
        setMultiUserFormOpen(true)
        showMessage({
          type: 'warning',
          content:
            names.length > 0
              ? `${names.length} account(s) not found. Create them, then retry bulk upload.`
              : 'Account(s) not found',
        })
        return
      }
      const message = error?.data?.msg ? (
        Array.isArray(error?.data?.msg) ? (
          <ol>
            {error.data.msg.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ol>
        ) : (
          error.data.msg
        )
      ) : (
        'Failed to upload bulk journals entries'
      )
      showMessage({
        type: 'error',
        content: message,
      })
    }
  }

  return (
    <div className="accounts-by-id">
      <Typography.Title level={3} className="accounts-by-id__org-name-card">
        <span className="accounts-by-id__org-name">
          {orgName}
          {isAdmin && <span className="accounts-by-id__role">Admin</span>}
        </span>
      </Typography.Title>

      {['admin', 'book keeper'].some((role) =>
        currentOrgRoles.includes(role)
      ) && <Staff />}
      {['admin', 'book keeper'].some((role) =>
        currentOrgRoles.includes(role)
      ) && <Accounts />}
      {['book keeper'].some((role) => currentOrgRoles.includes(role)) && (
        <>
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
                          min={0.1}
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
                        label="Debtor:"
                        name="DebtorId"
                        rules={[{ required: true, message: 'Select Debtor' }]}
                        style={{ flex: 1, marginBottom: 0 }}
                        extra={
                          <>
                            <div className="accounts-by-id__account-meta">
                              <div>
                                A/c type:{' '}
                                {debitAccount
                                  ? (selectedDebtor?.AccTypeMaster?.name ?? '-')
                                  : '-'}
                              </div>
                              <div>
                                Golden rule:{' '}
                                {debitAccount
                                  ? (selectedDebtor?.AccTypeMaster
                                      ?.goldenRule ?? '-')
                                  : '-'}
                              </div>
                            </div>
                            <br />
                          </>
                        }
                      >
                        <Select
                          options={accountSelectOptions(creditAccount)}
                          placeholder="Select Debtor"
                          onChange={handleDebtorChange}
                          showSearch
                          optionFilterProp="label"
                          onSearch={(value) => onSearch(value, 'debtor')}
                        />
                      </FormItem>
                      {/* </div> */}
                    </Col>
                    <Col xs={24} xl={12} span={24} md={24} sm={24}>
                      <FormItem
                        label="Creditor:"
                        name="CreditorId"
                        rules={[{ required: true, message: 'Select Creditor' }]}
                        style={{ flex: 1, marginBottom: 0 }}
                        extra={
                          <>
                            <div className="accounts-by-id__account-meta">
                              <div>
                                A/c type:{' '}
                                {creditAccount
                                  ? (selectedCreditor?.AccTypeMaster?.name ??
                                    '-')
                                  : '-'}
                              </div>
                              <div>
                                Golden rule:{' '}
                                {creditAccount
                                  ? (selectedCreditor?.AccTypeMaster
                                      ?.goldenRule ?? '-')
                                  : '-'}
                              </div>
                            </div>
                            <br />
                          </>
                        }
                      >
                        <Select
                          options={accountSelectOptions(debitAccount)}
                          placeholder="Select Creditor"
                          onChange={handleCreditorChange}
                          showSearch
                          optionFilterProp="label"
                          onSearch={(value) => onSearch(value, 'creditor')}
                        />
                      </FormItem>
                    </Col>
                    <Col xs={24} xl={12} span={24} md={24} sm={24}>
                      <FormItem
                        label="Is Adjustment?"
                        name="isAdjustment"
                        rules={[
                          {
                            required: true,
                            message: 'Select Yes / No',
                          },
                        ]}
                      >
                        <Radio.Group>
                          <Radio value={true}>Yes</Radio>
                          <Radio value={false}>No</Radio>
                        </Radio.Group>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    <Col xs={24} xl={24} span={24} md={24} sm={24}>
                      <FormItem
                        label="Particulars:"
                        name="particulars"
                        rules={[
                          { required: true, message: 'Enter Particulars' },
                        ]}
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

            <section>
              <section className="accounts-by-id__panel accounts-by-id__reports">
                <div className="accounts-by-id__reports-header">
                  <Typography.Title
                    level={5}
                    className="accounts-by-id__panel-title"
                  >
                    Financial Reports:
                  </Typography.Title>
                  <Select
                    value={reportYear?.id}
                    options={yearsAndMonths?.data?.map((item) => ({
                      value: item.id,
                      label: item.year,
                    }))}
                    onChange={(yearId) => {
                      const selected = yearsAndMonths?.data?.find(
                        (item) => item.id === yearId
                      )
                      setReportYear(selected ?? null)
                      setSelectedMonth(null)
                    }}
                    style={{ width: 88 }}
                  />
                </div>

                <div className="accounts-by-id__month-grid">
                  {months?.length > 0 ? (
                    months.map((month) => (
                      <Button
                        key={month.id}
                        type={
                          selectedMonth === month.monthName
                            ? 'primary'
                            : 'default'
                        }
                        className="accounts-by-id__month-btn"
                        onClick={() => {
                          setSelectedMonth(month.monthName)
                          navigate(
                            `/reports?orgId=${id}&yearId=${reportYear.id}&monthId=${month.id}`
                          )
                        }}
                      >
                        {month.monthName}
                      </Button>
                    ))
                  ) : (
                    <Typography.Text>No months found</Typography.Text>
                  )}
                </div>
                <br />
                <br />
              </section>
              <br />
              <section className="accounts-by-id__panel accounts-by-id__reports">
                <div className="flex">
                  {/* <Button
                    type="default"
                    className="flex-button"
                    onClick={handleCreateAccountModal}
                  >
                    Create Account
                  </Button> */}
                  <Button
                    type="default"
                    className="flex-button"
                    icon={<DownloadOutlined />}
                    iconPlacement="end"
                    onClick={handleTemplateDownload}
                  >
                    Bulk upload template
                  </Button>
                  <div className="accounts-by-id__bulk-upload-row">
                    <Upload
                      {...uploadBulkUploadTemplateProps}
                      className="accounts-by-id__upload"
                    >
                      <Button
                        type="default"
                        className="flex-button"
                        icon={<UploadOutlined />}
                        iconPlacement="end"
                        disabled={isBulkUploading}
                      >
                        Bulk upload
                      </Button>
                    </Upload>
                    <Button
                      type="primary"
                      className="flex-button accounts-by-id__bulk-submit"
                      onClick={handleBulkUploadSubmit}
                      loading={isBulkUploading}
                      disabled={bulkFileList.length === 0 || isBulkUploading}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </section>
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

          {multiUserFormOpen && (
            <MultiUserForm
              multiUserFormOpen={multiUserFormOpen}
              setMultiUserFormOpen={(open) => {
                setMultiUserFormOpen(open)
                if (!open) setMissingAccountNames([])
              }}
              missingAccountNames={missingAccountNames}
            />
          )}
        </>
      )}
    </div>
  )
}

export { BusinessAndAccountsById }
