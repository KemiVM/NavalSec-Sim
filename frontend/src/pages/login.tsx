import { useState } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Ship, Lock, User, Mail, Loader2, AlertCircle } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export function LoginPage() {
  const { t } = useLanguage()
  const { login, signup, isAuthenticated } = useAuth()
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    adminCode: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      if (isLogin) {
        await login(formData.username, formData.password)
      } else {
        let role: "user" | "admin" = "user"
        if (formData.adminCode) {
          if (formData.adminCode === "1234") {
            role = "admin"
          } else {
            throw new Error(t("login.invalidAdminCode") || "El código de administrador es incorrecto")
          }
        }
        await signup({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          role
        })
      }
    } catch (err: any) {
      setError(err.message || (t("login.errorOccurred") || "Ocurrió un error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,169,224,0.1),_transparent_50%)]" />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 mb-4 shadow-lg shadow-primary/5">
            <Ship className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">NAVALSEC</h1>
          <p className="text-slate-400 text-sm mt-2">{t("login.subtitle") || "Advanced Naval Simulation & Control"}</p>
        </div>

        <LayoutGroup>
          <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              {isLogin ? (t("login.login") || "Iniciar Sesión") : (t("login.signup") || "Crear Cuenta")}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isLogin 
                ? (t("login.signInDesc") || "Ingrese sus credenciales para acceder al sistema.") 
                : (t("login.signUpDesc") || "Complete los datos para registrarse en la plataforma.")}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login" : "signup"}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="space-y-4"
                >
                  {!isLogin && (
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="name" className="text-slate-200">{t("login.fullName") || "Nombre Completo"}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="name"
                          placeholder="Juan Pérez"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="username" className="text-slate-200">{t("login.username") || "Nombre de Usuario"}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="username"
                        placeholder="admin / operator1"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
                        required
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </motion.div>


                  {!isLogin && (
                    <motion.div variants={itemVariants} className="space-y-2">
                      <Label htmlFor="email" className="text-slate-200">{t("login.email") || "Correo Electrónico"}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="juan@navalsec.com"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
                          required
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </motion.div>
                  )}

                  {!isLogin && (
                    <motion.div variants={itemVariants} className="space-y-2">
                       <Label htmlFor="adminCode" className="text-slate-200">{t("login.adminCode") || "Código de Autorización (Opcional)"}</Label>
                       <div className="relative">
                         <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                         <Input
                           id="adminCode"
                           type="password"
                           placeholder={t("login.adminCodeDesc") || "Para crear cuenta de Administrador"}
                           className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
                           value={formData.adminCode}
                           onChange={e => setFormData({ ...formData, adminCode: e.target.value })}
                         />
                       </div>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="password" title="password" className="text-slate-200">{t("login.password") || "Contraseña"}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
                        required
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full text-md font-semibold h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("login.processing") || "Procesando..."}
                  </>
                ) : (
                  isLogin ? (t("login.enterSystem") || "Entrar al Sistema") : (t("login.signup") || "Crear Cuenta")
                )}
              </Button>
              <Button 
                type="button" 
                variant="link" 
                className="text-slate-400 hover:text-white"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                }}
              >
                {isLogin 
                  ? (t("login.noAccount") || "¿No tiene cuenta? Regístrese aquí") 
                  : (t("login.hasAccount") || "¿Ya tiene cuenta? Inicie sesión")}
              </Button>
            </CardFooter>
          </form>
        </Card>
        </LayoutGroup>

        {/* Hints for mock users */}
        {isLogin && (
          <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Credenciales de Simulación</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-[10px] text-slate-400">
                <span className="text-primary font-bold block uppercase">Admin</span>
                admin / password123
              </div>
              <div className="text-[10px] text-slate-400">
                <span className="text-primary font-bold block uppercase">Operator</span>
                operator1 / password123
              </div>
              <div className="text-[10px] text-slate-400">
                <span className="text-primary font-bold block uppercase">Technician</span>
                operator2 / password123
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
