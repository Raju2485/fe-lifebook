import { Table } from 'antd'

export function JournalEntries({ journals }) {
  const entries = Array.isArray(journals?.entries) ? journals.entries : []
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (_, row) => {
        return (
          <>
            <div>{row.date}</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </>
        )
      },
    },
    {
      title: 'Particulars',
      dataIndex: 'particulars',
      key: 'particulars',
      render: (_, row) => {
        return (
          <>
            <div style={{ textAlign: 'left', marginRight: '20px' }}>{`${row.debtor} A/c Dr.`}</div>
            <div style={{ textAlign: 'right', marginLeft: '20px' }}>{`To ${row.creditor} A/c`}</div>
            <div style={{ textAlign: 'center' }}>{`(${row.particulars})`}</div>
          </>
        )
      },
    },
    {
      title: 'Debit',
      dataIndex: 'amount',
      key: 'amount',
      render: (_, row) => {
        return (
          <>
            <div style={{ textAlign: 'right' }}>{row.amount}</div>
            <div style={{ textAlign: 'right' }}>&nbsp;</div>
            <div>&nbsp;</div>
          </>
        )
      },
    },
    {
      title: 'Credit',
      dataIndex: 'amount',
      key: 'amount',
      render: (_, row) => {
        return (
          <>
            <div style={{ textAlign: 'left' }}>&nbsp;</div>
            <div style={{ textAlign: 'right' }}>{row.amount}</div>
            <div>&nbsp;</div>
          </>
        )
      },
    },
    {
      title: 'Is Adjustment?',
      dataIndex: 'isAdjustment',
      key: 'isAdjustment',
      render: (_, row) => {
        return (
          <>
            <div>{row.isAdjustment ? 'Adjustment' : ''}</div>
            <div>&nbsp;</div>
            <div>&nbsp;</div>
          </>
        )
      },
    },
  ]

  return (
    <div className="reports-ledger">
      <h3>{journals?.heading}</h3>
      <Table
        bordered
        rowKey={(row, index) => row.id ?? `${row.date}-${index}`}
        columns={columns}
        dataSource={entries}
        // pagination={false}
      />
    </div>
  )
}

export default JournalEntries
