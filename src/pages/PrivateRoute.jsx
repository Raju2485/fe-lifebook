import React from 'react'
import { Typography } from 'antd'
import { Link } from 'react-router-dom'

export function PrivateRoute() {

  return (
    <>
      <div className="text-center">
        <Typography.Title level={3}>Private Page</Typography.Title>
        <br />
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </>
  )
}
