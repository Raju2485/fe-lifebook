import { Table } from 'antd'

export function JournalEntries({ journals }) {
  console.log('Journals = ', journals.entries)
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
            <div style={{ textAlign: 'left' }}>{row.debtor}</div>
            <div style={{ textAlign: 'right' }}>{row.creditor}</div>
          </>
        )
      },
    },
    {
      title: 'Debit amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (_, row) => {
        return (
          <>
            <div style={{ textAlign: 'right' }}>{row.amount}</div>
            <div style={{ textAlign: 'right' }}>&nbsp;</div>
          </>
        )
      },
    },
    {
      title: 'Credit amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (_, row) => {
        return (
          <>
            <div style={{ textAlign: 'left' }}>&nbsp;</div>
            <div style={{ textAlign: 'right' }}>{row.amount}</div>
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
          </>
        )
      },
    },
  ]

  return (
    <div>
      <h3>{journals?.heading}</h3>
      <Table bordered columns={columns} dataSource={journals.entries} />
    </div>
  )
}

export default JournalEntries
