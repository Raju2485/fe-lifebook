import { nanoid } from 'nanoid'
import {
  Typography,
  Button,
  Spin,
  Checkbox,
  Divider,
  Tabs,
  Menu,
  Switch,
  Flex,
  Segmented,
  Layout,
  Dropdown,
} from 'antd'
const { Sider, Content } = Layout
import { useParams, useSearchParams } from 'react-router-dom'
import {
  ReloadOutlined,
  LinkOutlined,
  MailOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  EditOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import './Reports.scss'
import { JournalEntries } from './Journals'
import { Ledgers } from './Ledgers'
import { TrialBalance } from './TrialBalance'
import { ProfitAndLoss } from './ProfitAndLoss'
import { BalanceSheet } from './BalanceSheet'
import { PDF } from './Pdf'
import {
  useFinalAccountsQuery,
  useLazyGenerateAccountsQuery,
} from '../services/apiSlice'

import { useState } from 'react'
import { useShowMessage } from '../../../hooks/useShowMessage.js'

const keysAndLabels = [
  {
    label: 'Journal Entries',
    key: 1,
    // children: <JournalEntries />,
  },
  {
    label: 'Ledgers',
    key: 2,
    // children: <Ledgers />,
  },
  {
    label: 'Trial Balance(Unadjusted)',
    key: 3,
  },
  {
    label: 'Trial Balance(Adjusted)',
    key: 30,
  },
  {
    label: 'Profit and Loss',
    key: 4,
  },
  {
    label: 'Balance Sheet',
    key: 5,
  },
]

const siderWidth = '100px'

export function Reports() {
  const [activeKey, setActiveKey] = useState('main1')
  const { showMessage } = useShowMessage()
  const [searchParams] = useSearchParams()
  const orgId = searchParams.get('orgId')
  const yearId = searchParams.get('yearId')
  const monthId = searchParams.get('monthId')
  const hasReportParams = Boolean(orgId && yearId && monthId)

  const { isLoading } = useFinalAccountsQuery(
    { orgId, yearId, monthId },
    { refetchOnMountOrArgChange: true, skip: !hasReportParams }
  )

  const [
    generateAccounts,
    { isFetching: generateAccountsLoading },
  ] = useLazyGenerateAccountsQuery()

  const handleGenerateReports = async () => {
    if (!hasReportParams) {
      showMessage({ type: 'error', content: 'Missing report filters' })
      return
    }

    try {
      const res = await generateAccounts({
        orgId,
        yearId,
        monthId,
      }).unwrap()

      showMessage({
        type: 'success',
        content: res?.msg ?? res?.message ?? 'Reports generated successfully',
      })
    } catch (err) {
      showMessage({
        type: 'error',
        content:
          err?.data?.msg ??
          err?.data?.message ??
          'Failed to generate reports',
      })
    }
  }

  const handleClick = ({ key }) => {
    console.log('activeKey = ', key)
    setActiveKey(key) // switch to the nested tab
  }

  const allContents = {
    main1: <div>Content of Tab 1</div>,
    main2: <div>Select a nested tab from dropdown</div>,
    sub1: <div>Content of Nested Tab 1</div>,
    sub2: <div>Content of Nested Tab 2</div>,
    main3: <div>Content of Tab 3</div>,
  }

  const visibleItems = [
    {
      key: 'main1',
      label: 'Main Tab 1',
    },
    {
      key: 'main2',
      label: 'Main Tab 2',
      children: [
        {
          key: 'sub1',
          label: 'Sub item 1',
        },
        {
          key: 'sub2',
          label: 'Sub item 2',
        },
      ],
    },
    {
      key: 'main3',
      label: 'Main Tab 3',
    },
  ]

  const [size, setSize] = useState('medium')
  const showLoadingMask = isLoading || generateAccountsLoading

  return (
    <>
      {showLoadingMask ? (
        <div className="reports-loading-mask">
          <Spin size="large" />
        </div>
      ) : null}
      <Flex gap="small" align="flex-start" justify="space-between" horizontal>
        <Segmented
          size={size}
          shape="round"
          options={[
            { value: 'light', label: 'Text', icon: <FileTextOutlined /> },
            { value: 'dark', label: 'PDF', icon: <FilePdfOutlined /> },
          ]}
        />{' '}
        <Divider vertical />
        <Button
          size="large"
          shape="round"
          icon={<ReloadOutlined />}
          onClick={handleGenerateReports}
          loading={generateAccountsLoading}
          disabled={!hasReportParams || generateAccountsLoading}
        />
      </Flex>
      <br />
      <Flex gap="small" align="flex-start" horizontal>
        <Menu
          items={visibleItems}
          onClick={handleClick}
          style={{ height: '400px', overflowY: 'auto' }}
        />
        <div style={{ marginTop: 16 }}>{allContents[activeKey]}</div>{' '}
      </Flex>
    </>
  )
}
