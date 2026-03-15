import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../api'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'buyer' | 'admin'
  phone: string
  address: string
  profile_picture: string | null
  profile_picture_url: string | null
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  password2: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me/')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login/', { username, password })
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register/', data)
    setUser(res.data.user)
    return res.data.user
  }

  const logout = async () => {
    await api.post('/auth/logout/')
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await api.get('/auth/me/')
    setUser(res.data)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}