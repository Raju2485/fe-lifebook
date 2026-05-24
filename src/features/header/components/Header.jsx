import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout, Input, Avatar, Dropdown, Flex, Typography } from 'antd'
import {
  BookOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { getLocalStorage } from '../../../utils/localStorage'
import { clearAuthRedirect, clearAuthSession } from '../../../utils/authSession'

export function Header() {
  const navigate = useNavigate()
  const userDetails = getLocalStorage('userDetails')
  const displayName =
    userDetails?.name ||
    userDetails?.username ||
    userDetails?.email ||
    'User'

  const [search, setSearch] = useState('')

  const handleLogout = () => {
    clearAuthSession()
    clearAuthRedirect()
    navigate('/', { replace: true })
  }

  const userMenu = {
    items: [
      {
        key: 'logout',
        label: 'Logout',
        icon: <LogoutOutlined />,
        onClick: handleLogout,
      },
    ],
  }

  return (
    <Layout.Header className="app-header">
      <Flex align="center" justify="space-between" className="app-header__inner">
        <Flex align="center" gap="middle" className="app-header__left">
          <Link to="/dashboard" className="app-header__brand">
            <BookOutlined className="app-header__icon" />
            <Typography.Text strong>Lifebook</Typography.Text>
          </Link>
          <Input
            className="app-header__search"
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Flex>

        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <Flex align="center" gap="small" className="app-header__user">
            <Avatar icon={<UserOutlined />} size="small" />
            <Typography.Text>{displayName}</Typography.Text>
          </Flex>
        </Dropdown>
      </Flex>
    </Layout.Header>
  )
}
