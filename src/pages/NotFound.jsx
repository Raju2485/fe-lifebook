import { Typography } from 'antd';
import { Link } from 'react-router-dom';


export function NotFound() {
  return (
    <>
      <Typography.Title level={3}>Page Not Found</Typography.Title>
      <Link to="/home">Go to Home Page</Link>
    </>
  )
}
