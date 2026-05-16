import './assets/styles/main.scss'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MessageProvider } from './hooks/MessageProvider.jsx'
import { Home } from './pages/Home'
import { Signin } from './pages/Signin'

function App() {
  return (
    <BrowserRouter>
      <MessageProvider>
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MessageProvider>
    </BrowserRouter>
  )
}

export default App
