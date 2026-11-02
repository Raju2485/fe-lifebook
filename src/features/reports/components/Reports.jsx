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
import { Ledger } from './Ledger.jsx'
import { TrialBalance } from './TrialBalance'
import { ProfitAndLoss } from './ProfitAndLoss'
import { BalanceSheet } from './BalanceSheet'
import { PDF } from './Pdf'
import {
  useFinalAccountsQuery,
  useLazyGenerateAccountsQuery,
  useGetKeysAndLabelsQuery,
} from '../services/apiSlice'

import { useState } from 'react'
import { useShowMessage } from '../../../hooks/useShowMessage.js'

export function Reports() {
  const [activeKey, setActiveKey] = useState('main1')
  const { showMessage } = useShowMessage()
  const [searchParams] = useSearchParams()
  const orgId = searchParams.get('orgId')
  const yearId = searchParams.get('yearId')
  const monthId = searchParams.get('monthId')
  const hasReportParams = Boolean(orgId && yearId && monthId)

  const { isLoading, data: finalAccountsData } = useFinalAccountsQuery(
    { orgId, yearId, monthId },
    { refetchOnMountOrArgChange: true, skip: !hasReportParams }
  )

  console.log('finalAccountsData = ', finalAccountsData?.data?.jsonData)
  const [
    generateAccounts,
    { isFetching: generateAccountsLoading },
  ] = useLazyGenerateAccountsQuery()

const { data: keysAndLabelsData } = useGetKeysAndLabelsQuery({
  apiEndpoint: '/api/v1/get-accounting-reports',
})
  
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
      }).unwrap();

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
    journals: <div>Content of Journals</div>,
    ledgers1: <div>Select a nested tab from dropdown</div>,
    sub1: <div>Content of Nested Tab 1</div>,
    sub2: <div>Content of Nested Tab 2</div>,
    main3: <div>Content of Tab 3</div>,
  }

  const visibleItems = [    
    {
      key: 'journals',
      label: keysAndLabelsData?.data?.journals,
    },
  ]

  allContents.journals = <JournalEntries journals={finalAccountsData?.data?.jsonData?.journals} />

  const ledgers = {
    key: 'ledgers',
    label: keysAndLabelsData?.data?.ledgers,
    children: []
  }

  finalAccountsData?.data?.jsonData?.ledgers.length > 0 && finalAccountsData?.data?.jsonData?.ledgers.forEach(item => {
    ledgers.children.push({
      key: item.name,
      label: item.name,
    })
    allContents[item.name] = <Ledger ledger={ item } />
  })
  visibleItems.push(ledgers);

  visibleItems.push({
    key: 'trialBalanceUnadjusted',
    label: keysAndLabelsData?.data?.trialBalanceUnadjusted,
  })

  visibleItems.push({
    key: 'trialBalanceAdjusted',
    label: keysAndLabelsData?.data?.trialBalanceAdjusted,
  })

  visibleItems.push({
    key: 'pAndLAccount',
    label: keysAndLabelsData?.data?.pAndLAccount,
  })

  visibleItems.push({
    key: 'profitAndLoss',
    label: keysAndLabelsData?.data?.profitAndLoss,
  })
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
            { value: 'text', label: 'Text', icon: <FileTextOutlined /> },
            { value: 'pdf', label: 'PDF', icon: <FilePdfOutlined /> },
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
        <div style={{ marginTop: 16, textAlign: 'center', width: '100%' }}>{allContents[activeKey]}</div>{' '}
      </Flex>
    </>
  )
}
