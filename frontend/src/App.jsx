import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

const API_BASE = '/api'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  if (!token) {
    return <Login apiBase={API_BASE} onLogin={handleLogin} />
  }

  return <Dashboard apiBase={API_BASE} token={token} onLogout={handleLogout} />
}

export default App
