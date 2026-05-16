import { useContext } from 'react'
import { MessageContext } from './messageContext'

export const useShowMessage = () => {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useShowMessage must be used within MessageProvider')
  }
  return context
}
