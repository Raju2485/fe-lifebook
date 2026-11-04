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
import { TrialBalanceAdj } from './TrialBalanceAdj.jsx'
import { TrialBalanceUnAdj } from './TrialBalanceUnAdj.jsx'
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

  const allContents = {}

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
  allContents['trialBalanceUnadjusted'] = <TrialBalanceUnAdj trialBalance={finalAccountsData?.data?.jsonData?.trialBalanceUnadjusted} />

  visibleItems.push({
    key: 'trialBalanceAdjusted',
    label: keysAndLabelsData?.data?.trialBalanceAdjusted,
  })
  allContents['trialBalanceAdjusted'] = <TrialBalanceAdj trialBalance={finalAccountsData?.data?.jsonData?.trialBalanceAdjusted} />

  visibleItems.push({
    key: 'tradingAccount',
    label: keysAndLabelsData?.data?.tradingAccount,
  })
  allContents['tradingAccount'] = (
    <ProfitAndLoss
      profitAndLoss={finalAccountsData?.data?.jsonData?.tradingAccount}
    />
  )
  visibleItems.push({
    key: 'pAndLAccount',
    label: keysAndLabelsData?.data?.pAndLAccount,
  })
  allContents['pAndLAccount'] = (
    <ProfitAndLoss
      profitAndLoss={finalAccountsData?.data?.jsonData?.pAndLAccount}
    />
  )
  
  visibleItems.push({
    key: 'balanceSheet',
    label: keysAndLabelsData?.data?.balanceSheet,
  })
  allContents['balanceSheet'] = (
    <ProfitAndLoss
      profitAndLoss={finalAccountsData?.data?.jsonData?.balanceSheet}
    />
  )

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
          mode="vertical"
          items={visibleItems}
          onClick={handleClick}
          className="reports-side-menu"
          popupClassName="reports-submenu-popup"
        />
        <div style={{ marginTop: 16, textAlign: 'center', width: '100%' }}>{allContents[activeKey]}</div>{' '}
      </Flex>
    </>
  )
}
