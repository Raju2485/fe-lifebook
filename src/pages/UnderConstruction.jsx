import { Typography } from 'antd'
import { Link, useNavigate } from 'react-router-dom'

export function UnderConstruction() {
  const navigate = useNavigate()

  return (
    <div className="app-layout">
      <main className="app-layout__content">
        <div className="text-center">
          <Typography.Title level={3}>This Page is under construction</Typography.Title>
          <Link onClick={() => navigate(-1)}>Back</Link>
          <br />
          <Link to="/dashboard">Home</Link>
        </div>
      </main>
    </div>
  )
}
