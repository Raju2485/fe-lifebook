import { Typography, Button, Spin, Checkbox, Divider, Tabs, Menu, Switch, Flex, Segmented, Layout, Dropdown } from 'antd'
const { Sider, Content } = Layout;
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
  FileTextOutlined
} from '@ant-design/icons'
import './Reports.scss'
import { JournalEntries } from './Journals'
import { Ledgers } from './Ledgers'
import { TrialBalance } from './TrialBalance'
import { ProfitAndLoss } from './ProfitAndLoss'
import { BalanceSheet } from './BalanceSheet'
import { PDF } from './Pdf'
import { useFinalAccountsQuery, useGenerateAccountsQuery } from '../services/apiSlice'

import { useState, useMemo } from 'react'


const items = [
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
  const [searchParams, setSearchParams] = useSearchParams()
  const orgId = searchParams.get('orgId')
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  console.log('orgId, year, month', orgId, year, month)

  
  const { data, isLoading, isError } = useFinalAccountsQuery({
    orgId: orgId,
    year: year,
    month: month,
    refetchOnMountOrArgChange: true,
  })

  const handleDropdownClick = ({ key }) => {
    console.log('activeKey = ', key)
    setActiveKey(key) // switch to the nested tab
  }

 const allContents = {
    main1: <div>Content of Tab 1</div>,
    main2: <div>Select a nested tab from dropdown</div>,
    sub1: <div>Content of Nested Tab 1</div>,
    sub2: <div>Content of Nested Tab 2</div>,
    main3: <div>Content of Tab 3</div>,
  };
  
  const visibleItems = [
    {
      key: 'main1',
      label: 'Main Tab 1',
    },
    {
      key: 'main2',
      label: (
        <Dropdown
          placement={'right'}
          menu={{
            items: [
              {
                key: 'sub1',
                label: 'Nested Tab 1',
                onClick: handleDropdownClick,
              },
              {
                key: 'sub2',
                label: 'Nested Tab 2',
                onClick: handleDropdownClick,
              },
            ],
          }}
          trigger={['hover']}
        >
          <span style={{ cursor: 'pointer' }}>Main Tab 2 ▼</span>
        </Dropdown>
      ),
    },
    {
      key: 'main3',
      label: 'Main Tab 3',
    },
    {
      key: 'main4',
      label: 'Main Tab 3',
    },
    {
      key: 'main5',
      label: 'Main Tab 3',
    },
    {
      key: 'main6',
      label: 'Main Tab 3',
    },
    {
      key: 'main7',
      label: 'Main Tab 3',
    },
    {
      key: 'main8',
      label: 'Main Tab 3',
    },
    {
      key: 'main9',
      label: 'Main Tab 3',
    },
    {
      key: 'main10',
      label: 'Main Tab 3',
    },
    {
      key: 'main11',
      label: 'Main Tab 3',
    },
    {
      key: 'main12',
      label: 'Main Tab 3',
    },
    {
      key: 'main13',
      label: 'Main Tab 3',
    },
    {
      key: 'main14',
      label: 'Main Tab 3',
    },
    {
      key: 'main15',
      label: 'Main Tab 3',
    },
    {
      key: 'main16',
      label: 'Main Tab 3',
    },
    {
      key: 'main17',
      label: 'Main Tab 3',
    },
    {
      key: 'main18',
      label: 'Main Tab 3',
    },
    {
      key: 'main19',
      label: 'Main Tab 3',
    },
    {
      key: 'main20',
      label: 'Main Tab 3',
    },
    {
      key: 'main21',
      label: 'Main Tab 3',
    },
  ]


  console.log('data = ', data)
  
  const handleReload = () => {
    console.log('Reloading reports')
  }
const [loading, setLoading] = useState(false)

  const [size, setSize] = useState('medium');


  return (
    <>
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
        <Button size={'large'} shape="round" icon={<ReloadOutlined />}></Button>
      </Flex>
      <br />
      <Flex gap="small" align="flex-start" horizontal>
        <Tabs
          tabPlacement="start"
          items={visibleItems}
          activeKey={
            ['main1', 'main2', 'main3'].includes(activeKey)
              ? activeKey
              : 'main2'
          }
          onChange={(key) => setActiveKey(key)}
          style={{ height: '500px' }}
          tabBarGutter={0}
        />
        <div style={{ marginTop: 16 }}>{allContents[activeKey]}</div>{' '}
      </Flex>
    </>
  )
  
}

