import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button, Checkbox, Form, Input, Typography } from 'antd'
import { useSigninMutation } from '../services/apiSlice'
import { getLocalStorage, setLocalStorage } from '../../../utils/localStorage'
import {
  clearAuthRedirect,
  getAuthRedirectPath,
} from '../../../utils/authSession'
import { setFlashMessage } from '../../../utils/flashMessage'
import { useShowMessage } from '../../../hooks/useShowMessage.js'

const Signin = () => {
  const [signin] = useSigninMutation()
  const { showMessage } = useShowMessage()

  const location = useLocation()
  const navigate = useNavigate()

  const from =
    location.state?.from?.pathname ?? getAuthRedirectPath() ?? '/dashboard'

  useEffect(() => {
    const user = getLocalStorage('user')
    if (user?.accessToken) {
      navigate(from, { replace: true })
    }
  }, [navigate, from])

  const onFinish = async (values) => {
    try {
      const res = await signin(values).unwrap()

      // storing user information in local storage
      const user = res?.accessToken
        ? {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken ?? null,
          }
        : null

      if (user) {
        setLocalStorage('user', user)
        setLocalStorage('userDetails', res?.user_details ?? false)
        clearAuthRedirect()
        setFlashMessage({ type: 'success', content: res?.msg ?? '' })
        navigate(from, { replace: true })
      }
    } catch (err) {
      showMessage({ type: 'error', content: err?.data?.msg ?? '' })
      console.log(err)
    }
  }

  const onFinishFailed = (errorInfo) => {
    // showing error message
    showMessage({ type: 'error', content: errorInfo?.data?.msg ?? '' })

    console.log('Failed:', errorInfo)
  }

  return (
    <div>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Typography.Title level={3}>Welcome to Lifebook!</Typography.Title>
          <Typography.Text>Please signin to continue</Typography.Text>
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item name="remember" valuePropName="checked" label={null}>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
export default Signin
