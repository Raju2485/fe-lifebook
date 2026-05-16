import { createContext, useCallback, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { message } from 'antd'
import { consumeFlashMessage } from '../utils/flashMessage'

const MessageContext = createContext(null)

export function MessageProvider({ children }) {
  const [messageApi, contextHolder] = message.useMessage()
  const location = useLocation()

  const showMessage = useCallback(
    ({ type, content }) => {
      if (content) {
        messageApi.open({ type, content })
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

export const useShowMessage = () => {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useShowMessage must be used within MessageProvider')
  }
  return context
}
