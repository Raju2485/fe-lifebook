import { Navigate, useLocation } from 'react-router-dom'
import { getLocalStorage } from '../utils/localStorage'

function ProtectedRoute({ children }) {
  const location = useLocation()

  const user = getLocalStorage('user')
  const isAuthenticated = user?.accessToken ? true : false

  if (!isAuthenticated) {
    // Redirect to login and save the current path
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export { ProtectedRoute }
