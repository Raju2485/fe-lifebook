import React from 'react'
import { Typography } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../features/header'
import { Layout } from 'antd'
const { Header: HeaderTag, Content } = Layout

export function NotFound() {
  const navigate = useNavigate()

  return (
    <Layout>
      <HeaderTag>
        <Header />
      </HeaderTag>
      <Content>
        <div className="text-center">
          <Typography.Title level={3}>Page Not Found</Typography.Title>
          <Link onClick={() => navigate(-1)}>Back</Link>
          <br />
          <Link to="/dashboard">Home</Link>
        </div>{' '}
      </Content>
    </Layout>
  )
}
