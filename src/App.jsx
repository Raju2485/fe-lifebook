import './assets/styles/main.scss'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MessageProvider } from './hooks/MessageProvider.jsx'
import { DashboardPage } from './pages/Dashboard.jsx'
import { Signin } from './pages/Signin'
import { NotFound } from './pages/NotFound.jsx'
import { PrivateRoute } from './pages/PrivateRoute.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { AuthSessionHandler } from './components/AuthSessionHandler.jsx'
import { UnderConstruction } from './pages/UnderConstruction.jsx'
import { BusinessAndAccounts } from './pages/BusinessAndAccounts.jsx'
import { BusinessAndAccountsById } from './pages/BusinessAndAccountsById.jsx'
import { Practice } from './pages/Practice.jsx'

function App() {
  // const user = getLocalStorage('user')
  // const userLoggedIn = user?.accessToken ? true : false;

  return (
    <BrowserRouter>
      <AuthSessionHandler />
      <MessageProvider>
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
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
          <Route
            path="/businessAndAccounts/:id"
            element={
              <ProtectedRoute>
                <BusinessAndAccountsById />
              </ProtectedRoute>
            }
          /> 
          <Route
            path="/businessAndAccounts"
            element={
              <ProtectedRoute>
                <BusinessAndAccounts />
              </ProtectedRoute>
            }
          />
          <Route path="/dairy" element={<UnderConstruction />} />
          <Route path="/relatives" element={<UnderConstruction />} />
          <Route path="/tasks" element={<UnderConstruction />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MessageProvider>
    </BrowserRouter>
  )
}

export default App
