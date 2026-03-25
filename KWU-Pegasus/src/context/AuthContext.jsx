import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (stored) {
      const decoded = decodeToken(stored)
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(stored)
        setUser({ id: decoded.id, username: decoded.username, role: decoded.role, staff_type: decoded.staff_type, ob_yb: decoded.ob_yb })
      } else {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  function login(token, remember) {
    if (remember) {
      localStorage.setItem('token', token)
    } else {
      sessionStorage.setItem('token', token)
    }
    const decoded = decodeToken(token)
    setToken(token)
    setUser({ id: decoded.id, username: decoded.username, role: decoded.role, staff_type: decoded.staff_type, ob_yb: decoded.ob_yb })
  }

  function logout() {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
