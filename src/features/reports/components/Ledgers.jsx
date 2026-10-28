import { Tabs } from 'antd'

export function Ledgers() {
  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          key: '1',
          label: 'Parent Tab 1',
          children: 'Content of Parent Tab 1',
        },
        {
          key: '2',
          label: 'Parent Tab 2',
          children: (
            <Tabs
              defaultActiveKey="sub-1"
              items={[
                {
                  key: 'sub-1',
                  label: 'Sub Tab 1',
                  children: 'Content of Sub Tab 1',
                },
                {
                  key: 'sub-2',
                  label: 'Sub Tab 2',
                  children: 'Content of Sub Tab 2',
                },
              ]}
            />
          ),
        },
      ]}
    />
  )
   
}

export default Ledgers