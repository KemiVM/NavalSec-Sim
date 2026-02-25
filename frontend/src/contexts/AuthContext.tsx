import { createContext, useContext, useEffect, useState } from "react"

export type UserRole = "admin" | "user"

export interface User {
  id: string
  username: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  signup: (userData: Omit<User, "id" | "role"> & { password: string, role?: UserRole }) => Promise<void>
  updateUser: (updates: Partial<User> & { password?: string }) => void
  users: User[]
  promoteUser: (userId: string, role: UserRole) => void
  deleteUser: (userId: string) => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

const SESSION_KEY = "auth-session-v3"
const AUTH_API = "/api/auth/users"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<(User & { password?: string })[]>([])

  const fetchUsers = async () => {
    try {
      const res = await fetch(AUTH_API)
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (e) {
      console.error("Failed to fetch users from backend", e)
    }
  }

  useEffect(() => {
    // Load persisted session from sessionStorage (cleared on browser exit)
    const savedSession = sessionStorage.getItem(SESSION_KEY)
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession))
      } catch (e) {
        console.error("Failed to load auth session", e)
      }
    }

    // Load all users from backend
    fetchUsers().finally(() => setIsLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    // Give backend time to spin up if it's the first render, so sync the userlist real quick:
    let currentUsers = users;
    try {
      const res = await fetch(AUTH_API)
      if (res.ok) {
        currentUsers = await res.json()
        setUsers(currentUsers)
      }
    } catch(e) {
      console.error(e)
    }

    const foundUser = currentUsers.find((u: any) => u.username === username && u.password === password)
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword))
    } else {
      throw new Error("Nombre de usuario o contraseña incorrectos")
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  const signup = async (data: Omit<User, "id" | "role"> & { password: string, role?: UserRole }) => {
    const newUserConfig = {
      username: data.username,
      name: data.name,
      email: data.email,
      password: data.password,
      id: Math.random().toString(36).substr(2, 9),
      role: data.role || "user",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`
    }

    try {
      const response = await fetch(AUTH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserConfig)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || "Error al registrarse")
      }
      
      const createdUser = await response.json()
      setUsers(prev => [...prev, createdUser])

      const { password: _, ...userWithoutPassword } = createdUser
      setUser(userWithoutPassword)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword))
    } catch (e: any) {
      throw new Error(e.message)
    }
  }

  const updateUser = async (updates: Partial<User> & { password?: string }) => {
    if (!user) return
    
    // Send to backend
    try {
       await fetch(`${AUTH_API}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })
      
      // Separate out password to not save it in the current session state or sessionStorage
      const { password, ...safeUpdates } = updates
      const updatedUser = { ...user, ...safeUpdates }
      setUser(updatedUser)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))

      // Also update in users list
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updates } : u))
      
    } catch(e) {
      console.error("Couldnt update user", e)
    }
  }

  const promoteUser = async (userId: string, role: UserRole) => {
    if (user && user.id === userId) {
      updateUser({ role })
      return
    }

    try {
      await fetch(`${AUTH_API}/${userId}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ role })
     })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    } catch(e) {
      console.error(e)
    }
  }

  const deleteUser = async (userId: string) => {
    if (user && user.id === userId) {
      logout()
    }
    try {
      await fetch(`${AUTH_API}/${userId}`, { method: "DELETE" })
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch(e) {
      console.error(e)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      signup,
      updateUser,
      users: users.map(({ password, ...u }) => u),
      promoteUser,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
