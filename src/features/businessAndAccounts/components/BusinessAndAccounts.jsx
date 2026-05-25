import { Typography, Button, Flex } from 'antd'
import { useOrgsQuery } from '../services/apiSlice'
import { Card } from './Card'

function BusinessAndAccounts() {
  const { data } = useOrgsQuery(
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
}

export { BusinessAndAccounts }