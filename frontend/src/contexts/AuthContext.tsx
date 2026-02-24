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
  updateUser: (updates: Partial<User>) => void
  users: User[]
  promoteUser: (userId: string, role: UserRole) => void
  deleteUser: (userId: string) => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

const SESSION_KEY = "auth-session-v3"
const USERS_KEY = "auth-users-v3"

// Initial Mock Users
const INITIAL_MOCK_USERS: (User & { password: string })[] = [
  {
    id: "1",
    username: "admin",
    password: "password123",
    name: "Administrador de Sistemas",
    email: "admin@navalsec.com",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
  },
  {
    id: "2",
    username: "operator1",
    password: "password123",
    name: "Operador de Cubierta",
    email: "operator1@navalsec.com",
    role: "user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=operator1"
  },
  {
    id: "3",
    username: "operator2",
    password: "password123",
    name: "Técnico de Máquinas",
    email: "operator2@navalsec.com",
    role: "user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=operator2"
  }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<(User & { password: string })[]>(INITIAL_MOCK_USERS)

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

    // Load all users from storage (or use defaults)
    const savedUsers = localStorage.getItem(USERS_KEY)
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers)
        // Migration safety: Ensure INITIAL_MOCK_USERS are present if it seems like an old storage format
        // or if mock users are missing after my previous change.
        if (Array.isArray(parsedUsers) && !parsedUsers.some(u => u.username === "admin")) {
          const merged = [...INITIAL_MOCK_USERS, ...parsedUsers]
          setUsers(merged)
          localStorage.setItem(USERS_KEY, JSON.stringify(merged))
        } else {
          setUsers(parsedUsers)
        }
      } catch (e) {
        console.error("Failed to load users", e)
      }
    } else {
      // First time initialization: save default mocks
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_MOCK_USERS))
    }
    
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800))

    const foundUser = users.find(u => u.username === username && u.password === password)
    
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
    await new Promise(resolve => setTimeout(resolve, 800))
    
    if (users.some(u => u.username === data.username)) {
      throw new Error("El nombre de usuario ya existe")
    }

    const newUser: User & { password: string } = {
      username: data.username,
      name: data.name,
      email: data.email,
      password: data.password,
      id: Math.random().toString(36).substr(2, 9),
      role: data.role || "user",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`
    }
    
    // Update local state and persistence
    setUsers(prev => {
      const updatedUsers = [...prev, newUser]
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
      return updatedUsers
    })

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword))
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))

    // Also update in users list
    setUsers(prev => {
      const updatedUsers = prev.map(u => u.id === user.id ? { ...u, ...updates } : u)
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
      return updatedUsers
    })
  }

  const promoteUser = (userId: string, role: UserRole) => {
    setUsers(prev => {
      const updatedUsers = prev.map(u => u.id === userId ? { ...u, role } : u)
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
      return updatedUsers
    })
    
    // If the promoted user is the current user, update their session too
    if (user && user.id === userId) {
      updateUser({ role })
    }
  }

  const deleteUser = (userId: string) => {
    setUsers(prev => {
      const updatedUsers = prev.filter(u => u.id !== userId)
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
      return updatedUsers
    })
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
