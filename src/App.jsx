import './assets/styles/main.scss'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MessageProvider } from './hooks/MessageProvider.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { Signin } from './pages/Signin'
import { NotFound } from './pages/NotFound.jsx'
import { PrivateRoute } from './pages/PrivateRoute.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { getLocalStorage } from './utils/localStorage.js'

function App() {
  // const user = getLocalStorage('user')
  // const userLoggedIn = user?.accessToken ? true : false;

  return (
    <BrowserRouter>
      <MessageProvider>
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privateRoute"
            element={
              <ProtectedRoute>
                <PrivateRoute />
              </ProtectedRoute>
            }
          />
          <Route path="/notFound" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MessageProvider>
    </BrowserRouter>
  )
}

export default App
