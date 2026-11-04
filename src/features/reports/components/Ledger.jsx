import { Typography, Table } from 'antd'

export function Ledger({ ledger }) {
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Particulars',
      dataIndex: 'accountName',
      key: 'accountName',
      render: (_, record) => {
        return (
          <div
            style={{ textAlign: 'left' }}
          >{`${record.creditAmount > 0 ? 'By' : 'To'} ${record.accountName}`}</div>
        )
      },
    },
    {
      title: 'Debit',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
    },
    {
      title: 'Credit',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
    },
    // {
    //   title: 'Balance',
    //   dataIndex: 'balance',
    //   key: 'balance',
    // },
  ]
  return (
    <div
      className="reports-ledger"
    >
      <h3>{ledger?.heading}</h3>
      <Table
        bordered
        rowKey={(row, index) => row.id ?? `${row.date}-${index}`}
        columns={columns}
        dataSource={Array.isArray(ledger?.entries) ? ledger.entries : []}
      />
    </div>
  )
   
}

export default Ledger