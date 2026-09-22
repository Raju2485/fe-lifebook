import { useMemo, useRef, useState, useEffect } from 'react'
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
  Upload,
} from 'antd'

import { getLocalStorage } from '../../../utils/localStorage'

const { Item: FormItem } = Form
import {
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
  EditOutlined,
} from '@ant-design/icons'

import dayjs from 'dayjs'
import './Accounts.scss'
import TextArea from 'antd/es/input/TextArea'

import { useShowMessage } from '../../../hooks/useShowMessage.js'
import {
  useAccountsQuery
} from '../services/apiSlice';

const handleEdit = (row) => {
  console.log(row)
}


const TABLE_COLUMNS = [
  {
    title: 'Name',
    key: 'name',
    render: (_, row) => (row?.User ? `${row.User.name} (${row.User.uid})` : ''),
  },
  {
    title: 'Email',
    key: 'email',
    render: (_, row) => row?.User?.email || '',
  },
  {
    title: 'Account Type',
    key: 'accountType',
    render: (_, row) => (row?.AccTypeMaster ? `${row.AccTypeMaster.name}` : ''),
  },
  {
    title: 'Roles',
    key: 'roles',
    render: (_, row) =>
      row?.Roles?.length > 0
        ? `${row.Roles.map((role) => role.name).join(', ')}`
        : '',
  },

  {
    title: 'Actions',
    key: 'actions',
    render: (_, row) => (
      <Button type="link" onClick={() => handleEdit(row)}>
        <EditOutlined />
      </Button>
    ),
  },
]

function Accounts() {
  const [rangeStart, setRangeStart] = useState(dayjs().startOf('year'))
  const [rangeEnd, setRangeEnd] = useState(dayjs())
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10);
  


  const { id } = useParams()
  const [accountSearch, setAccountSearch] = useState()

  const { data: accounts } = useAccountsQuery(
    // { count: 5 },
    // This option forces a refetch on component mount
    { refetchOnMountOrArgChange: true, orgId: id, search: accountSearch }
  )
const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
]
    const journalTotal = Number(accounts?.pagination?.totalRecords) || 0
    const journalPage = Number(accounts?.pagination?.currentPage) || currentPage
    const journalPageSize = Number(accounts?.pagination?.totalPerPage) || pageSize

  
const DATE_FORMAT = 'D-MMM-YYYY'


  return (
    <div className="accounts-by-id">

      <section className="accounts-by-id__panel accounts-by-id__table-panel">
        <div className="accounts-by-id__table-controls">

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
          dataSource={Array.isArray(accounts?.data) ? accounts.data : []}
          rowKey="id"
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
    </div>
  )
}

export { Accounts }
