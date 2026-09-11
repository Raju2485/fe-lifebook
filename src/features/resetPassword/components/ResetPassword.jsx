import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Checkbox, Form, Input, Typography } from 'antd'
import { useResetPasswordMutation } from '../services/apiSlice.js'


import { setFlashMessage } from '../../../utils/flashMessage.js'
import { useShowMessage } from '../../../hooks/useShowMessage.js'

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const hash = searchParams.get('hash');
  if (!email || !hash) {
    showMessage({ type: 'error', content: 'Invalid link' })
  }
  const [form] = Form.useForm();
  const [resetPassword] = useResetPasswordMutation()
  const { showMessage } = useShowMessage()

  const navigate = useNavigate()


  const onFinish = async () => {
    try {
      form.validateFields();
      const res = await resetPassword({ email, hash, password: form.getFieldValue('password') }  ).unwrap();

        setFlashMessage({ type: 'success', content: res?.msg ?? '' })
        navigate('/', { replace: true })
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
        form={form}
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
          <Typography.Text>Reset your password</Typography.Text>
        </Form.Item>

        <Form.Item
          label="New Password"
          name="password"
          rules={[
            { required: true, message: 'Please input your new password!' },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          rules={[
            { required: true, message: 'Please input your confirm new password!' },
            {
              validator: (_, value) => {
                if (value !== form.getFieldValue('password')) {
                  return Promise.reject(new Error('Passwords do not match!'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
export { ResetPassword }
