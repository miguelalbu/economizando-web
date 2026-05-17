import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api from '../services/api'

interface User {
  id: number
  name: string
  email: string
  income_day: number | null
}

interface AuthContextData {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, income_day?: number) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      api.get('/users/me')
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('access_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token', res.data.access_token)
    const me = await api.get('/users/me')
    setUser(me.data)
  }

  async function register(name: string, email: string, password: string, income_day?: number) {
    const res = await api.post('/auth/register', { name, email, password, income_day })
    localStorage.setItem('access_token', res.data.access_token)
    const me = await api.get('/users/me')
    setUser(me.data)
  }

  function logout() {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
