import { createContext, useContext, useState } from 'react'
import { logoutUser } from '../services/Authservice'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  // `token` is no longer a real credential — the JWT now lives in an
  // httpOnly cookie the browser sends automatically, so JS can't read it.
  // We keep `token` as a plain "is there an active session" flag so all
  // the existing `token && ...` / `!token` checks across the app keep
  // working without editing every page.
  const [token, setToken] = useState(() => {
    return localStorage.getItem('user') ? 'session' : null
  })

  function login(userData) {
    setUser(userData)
    setToken('session')
    localStorage.setItem('user', JSON.stringify(userData))
  }

  async function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    try {
      await logoutUser()
    } catch (err) {
      console.error('Logout request failed:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}