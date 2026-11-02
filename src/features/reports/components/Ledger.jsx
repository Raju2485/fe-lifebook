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
    },
    {
      title: 'Credit amount',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
    },
    {
      title: 'Debit amount',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
    },
  ]
  return (
    <div>
      <h3>{ledger?.heading}</h3>
      <Table bordered columns={columns} dataSource={ledger.entries} />
    </div>
  )
   
}

export default Ledger