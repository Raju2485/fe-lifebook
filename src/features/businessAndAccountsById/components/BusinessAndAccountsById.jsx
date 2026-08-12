import { useMemo, useState } from 'react'
import { useParams} from 'react-router';
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
} from 'antd'
import { DownloadOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import './BusinessAndAccountsById.scss'
import TextArea from 'antd/es/input/TextArea';

import { useAccountsQuery } from '../services/apiSlice'


const DATE_FORMAT = 'D-MMM-YYYY'
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

const TABLE_COLUMNS = [
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Debitor', dataIndex: 'debitor', key: 'debitor' },
  { title: 'Creditor', dataIndex: 'creditor', key: 'creditor' },
  { title: 'Particulars', dataIndex: 'particulars', key: 'particulars' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' },
]

function BusinessAndAccountsById() {
  const [entryDate, setEntryDate] = useState(dayjs('2026-01-01'))
  const [debitAccount, setDebitAccount] = useState()
  const [creditAccount, setCreditAccount] = useState()
  const [particulars, setParticulars] = useState('')
  const [reportYear, setReportYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [rangeStart, setRangeStart] = useState(dayjs('2026-01-01'))
  const [rangeEnd, setRangeEnd] = useState(dayjs('2026-01-31'))
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(10)
  const [pageSize, setPageSize] = useState(20)
  const [amount, setAmount] = useState()

  const filteredTransactions = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    if (!query) return SAMPLE_TRANSACTIONS

    return SAMPLE_TRANSACTIONS.filter((row) =>
      [row.date, row.debitor, row.creditor, row.particulars, row.amount].some(
        (value) => value.toLowerCase().includes(query)
      )
    )
  }, [searchText]);
  const { id } = useParams();

  
    const { data: accounts } = useAccountsQuery(
      // { count: 5 },
      // This option forces a refetch on component mount
      { refetchOnMountOrArgChange: true, orgId:id }
    )
    

  const handleBulkUpload = () => {
    // Placeholder until bulk upload API is wired up.
  }

  
  const handleTemplateDownload = () => {
    // Placeholder until bulk upload API is wired up.
  }

  const handleCreateAccount = () => {
    // Placeholder until account creation API is wired up.
  }

  const handlePostJournalEntry = () => {
    // Placeholder until journal entry posting API is wired up.
  }

  return (
    <div className="accounts-by-id">
      <div className="accounts-by-id__top">
        <section className="accounts-by-id__panel accounts-by-id__journal">
          <Typography.Title level={5} className="accounts-by-id__panel-title">
            Journal Entry
          </Typography.Title>

          <div className="accounts-by-id__journal-body">
            <div className="accounts-by-id__journal-fields">
              <DatePicker
                value={entryDate}
                format={DATE_FORMAT}
                onChange={(value) => value && setEntryDate(value)}
                allowClear={false}
              />
              <InputNumber
                style={{ width: '100%' }}
                value={amount}
                placeholder="Amount"
                onChange={(value) => value && setAmount(amount)}
              />
              <div className="accounts-by-id__account-row">
                <Select
                  value={debitAccount}
                  options={
                    accounts?.data
                      ? accounts.data.map((obj) => {
                          return {
                            value: obj.id,
                            label: obj?.User
                              ? `${obj.User.name}(${obj.User.uid})`
                              : '',
                          }
                        })
                      : []
                  }
                  onChange={setDebitAccount}
                  placeholder="Select Debitor"
                  style={{ flex: 1 }}
                />
                <span className="accounts-by-id__account-label accounts-by-id__account-label--right">
                  Dr.
                </span>
              </div>

              <div className="accounts-by-id__account-row accounts-by-id__account-row--credit">
                <span className="accounts-by-id__account-label">Cr.</span>
                <Select
                  value={creditAccount}
                  options={
                    accounts?.data
                      ? accounts.data.map((obj) => {
                          return {
                            value: obj.id,
                            label: obj?.User
                              ? `${obj.User.name}(${obj.User.uid})`
                              : '',
                          }
                        })
                      : []
                  }
                  onChange={setCreditAccount}
                  placeholder="Select Creditor"
                  style={{ flex: 1 }}
                />
              </div>

              <TextArea
                placeholder="Particulars"
                value={particulars}
                onChange={(event) => setParticulars(event.target.value)}
              />
            </div>
            <div className="flex">
              <Button
                type="default"
                className="flex-button"
                icon={<DownloadOutlined />}
                iconPosition="end"
                onClick={handleTemplateDownload}
              >
                Bulk upload template
              </Button>
              <Button
                type="default"
                className="flex-button"
                icon={<UploadOutlined />}
                iconPosition="end"
                onClick={handleBulkUpload}
              >
                Bulk upload
              </Button>
              <Button
                type="default"
                className="flex-button"
                onClick={handleCreateAccount}
              >
                Create Account
              </Button>
              <Button
                type="primary"
                className="flex-button accounts-by-id__post-btn"
                onClick={handlePostJournalEntry}
              >
                Post Journal Entry
              </Button>
            </div>
          </div>
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
        </section>
      </div>

      <section className="accounts-by-id__panel accounts-by-id__table-panel">
        <div className="accounts-by-id__table-controls">
          <Flex gap={8} align="center" wrap="wrap">
            <DatePicker
              value={rangeStart}
              format={DATE_FORMAT}
              onChange={(value) => value && setRangeStart(value)}
              allowClear={false}
            />
            <span>-</span>
            <DatePicker
              value={rangeEnd}
              format={DATE_FORMAT}
              onChange={(value) => value && setRangeEnd(value)}
              allowClear={false}
            />
          </Flex>

          <Input
            className="accounts-by-id__search"
            placeholder="Search"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            allowClear
          />
        </div>

        <Table
          columns={TABLE_COLUMNS}
          dataSource={filteredTransactions}
          pagination={false}
          size="middle"
          bordered
        />

        <div className="accounts-by-id__table-footer">
          <div className="accounts-by-id__pagination">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={360}
              showSizeChanger={false}
              showQuickJumper={false}
              onChange={setCurrentPage}
            />
          </div>

          <div className="accounts-by-id__page-size">
            <Select
              value={pageSize}
              options={PAGE_SIZE_OPTIONS}
              onChange={setPageSize}
              style={{ width: 72 }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export { BusinessAndAccountsById }
