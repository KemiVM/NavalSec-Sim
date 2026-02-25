import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { Layout } from "./components/layout/layout"
import { Dashboard } from "./pages/dashboard"
import { Simulacion } from "./pages/simulacion"
import { Fallos } from "./pages/fallos"
import { Datos } from "./pages/datos"
import { Ayuda } from "./pages/ayuda"
import { Parametros } from "./pages/parametros"
import { LoginPage } from "./pages/login"
import { Perfil } from "./pages/perfil"
import { useSystemMonitor } from "./hooks/use-monitor"
import { NotificationProvider } from "./contexts/NotificationContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { SettingsProvider } from "./contexts/SettingsContext"
import { AuthProvider } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"

// Component wrapper to use the hook inside Router context if needed, 
// though here it runs globally. 
function SystemMonitor() {
    useSystemMonitor()
    return null
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <LanguageProvider defaultLanguage="es" storageKey="app-language">
        <AuthProvider>
          <SettingsProvider>
            <NotificationProvider>
              <BrowserRouter>
                <SystemMonitor />
                <Toaster richColors position="top-right" expand={true} />
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="simulacion" element={<Simulacion />} />
                    <Route path="fallos" element={<Fallos />} />
                    <Route path="datos" element={<Datos />} />
                    <Route path="ayuda" element={<Ayuda />} />
                    <Route path="parametros" element={<ProtectedRoute adminOnly><Parametros /></ProtectedRoute>} />
                    <Route path="perfil" element={<Perfil />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </SettingsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
