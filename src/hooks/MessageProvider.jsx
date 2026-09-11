import { useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { message } from 'antd'
import { consumeFlashMessage } from '../utils/flashMessage'
import { MessageContext } from './messageContext'

export function MessageProvider({ children }) {
  const [messageApi, contextHolder] = message.useMessage()
  const location = useLocation()

  const showMessage = useCallback(
    ({ type, content, key }) => {
      if (content) {
        messageApi.open({ type, content, ...(key ? { key } : {}) })
      }
    },
    [messageApi]
  )

  useEffect(() => {
    const flash = consumeFlashMessage()
    if (flash) {
      showMessage(flash)
    }
  }, [location.pathname, showMessage])

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  )
}
