import { Typography, Table } from 'antd'

export function TrialBalanceUnAdj({ trialBalance }) {
  const columns = [
    {
      title: 'Particulars',
      dataIndex: 'accountName',
      key: 'accountName',
      render: (_, record) => {
        return (
          <div
            style={{ textAlign: 'left' }}
          >{`${record.accountName} A/c`}</div>
        )
      },
    },
    {
      title: 'Debit',
      dataIndex: 'debitBalance',
      key: 'debitBalance',
    },
    {
      title: 'Credit',
      dataIndex: 'creditBalance',
      key: 'creditBalance',
    },
  ]
  return (
    <div className="reports-ledger">
      <h3>{trialBalance?.heading}</h3>
      <Table
        bordered
        rowKey={(row, index) => row.id ?? `${row.date}-${index}`}
        columns={columns}
        dataSource={
          Array.isArray(trialBalance?.entries) ? trialBalance.entries : []
        }
      />
    </div>
  )
}

export default TrialBalanceUnAdj
