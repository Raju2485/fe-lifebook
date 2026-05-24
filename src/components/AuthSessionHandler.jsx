import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SESSION_EXPIRED_EVENT,
  getAuthRedirectPath,
} from '../utils/authSession'

function AuthSessionHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const onSessionExpired = (event) => {
      const returnPath =
        event.detail?.returnPath ?? getAuthRedirectPath() ?? '/dashboard'

      navigate('/', {
        state: { from: { pathname: returnPath } },
        replace: true,
      })
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
  }, [navigate])

  return null
}

export { AuthSessionHandler }
