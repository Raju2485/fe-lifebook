import { Typography, Button, Flex } from 'antd'
import { useCardsQuery } from '../services/apiSlice'
import { Card } from './Card'

export function Dashboard() {
  const { data } = useCardsQuery(
    { type: 'dashboard' },
    // { count: 5 },
    // This option forces a refetch on component mount
    { refetchOnMountOrArgChange: true }
  )

  return (
    <Flex wrap gap="small">
      {data?.data?.map((obj) => (
        <Card key={obj.id} obj={obj} />
      ))}
    </Flex>
  )
  // <Typography.Title level={2}>Dashboard</Typography.Title>
}
