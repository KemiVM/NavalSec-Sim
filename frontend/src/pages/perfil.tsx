import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User, Mail, Shield, Camera, Save, LogOut, Lock, ShieldCheck, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper"
]

export function Perfil() {
  const { user, updateUser, logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    password: ""
  })

  if (!user) return null

  const handleRandomizeAvatar = () => {
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random().toString(36).substring(7)}`
    updateUser({ avatar: newAvatar })
    toast.success("Imagen de perfil actualizada")
  }

  const handleSelectAvatar = (url: string) => {
    updateUser({ avatar: url })
    toast.success("Avatar seleccionado")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen es demasiado grande (máximo 2MB)")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      updateUser({ avatar: base64 })
      toast.success("Imagen subida con éxito")
    }
    reader.readAsDataURL(file)
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateUser({
      name: formData.name,
      username: formData.username,
      email: formData.email
    })
    toast.success("Perfil actualizado con éxito")
  }

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.password) {
      toast.error("Debe introducir una nueva contraseña")
      return
    }
    updateUser({ password: formData.password })
    setFormData(prev => ({ ...prev, password: "" }))
    toast.success("Contraseña actualizada con éxito")
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="p-6 space-y-8 max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestione su información personal y preferencias de seguridad.</p>
        </div>
        <Button variant="outline" onClick={logout} className="text-destructive hover:bg-destructive/10 border-destructive/20">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <motion.div variants={itemVariants} className="md:col-span-1 space-y-6">
          <Card className="border-primary/10 overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2 absolute bottom-0 right-0">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="rounded-full w-8 h-8 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => fileInputRef.current?.click()}
                      title="Subir propia imagen"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="rounded-full w-8 h-8 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={handleRandomizeAvatar}
                      title="Aleatorizar DiceBear"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20 flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                    En Línea
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Biblioteca de Avatares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAvatar(url)}
                    className={cn(
                      "w-full aspect-square rounded-lg border-2 overflow-hidden hover:scale-105 transition-all p-1 bg-muted/50",
                      user.avatar === url ? "border-primary bg-primary/5 shadow-sm" : "border-transparent"
                    )}
                  >
                    <img src={url} alt={`Avatar preset ${idx}`} className="w-full h-full object-cover rounded-md" />
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground mt-4 text-center italic">
                * Las imágenes personalizadas se guardan localmente.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Info */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Información Personal
              </CardTitle>
              <CardDescription>Actualice sus datos de contacto y nombre público.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="perf-name">Nombre Completo</Label>
                    <Input 
                      id="perf-name" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perf-user">Nombre de Usuario</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">@</span>
                      <Input 
                        id="perf-user" 
                        className="pl-7"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="perf-email">Correo Electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="perf-email" 
                        type="email"
                        className="pl-10"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t bg-muted/50 py-3">
                <Button type="submit" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Seguridad de la Cuenta
              </CardTitle>
              <CardDescription>Cambie su contraseña periódicamente para mantener la seguridad.</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateSecurity}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="perf-pass">Nueva Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="perf-pass" 
                      type="password" 
                      placeholder="Dejar en blanco para no cambiar"
                      className="pl-10"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t bg-muted/50 py-3">
                <Button type="submit" variant="secondary" size="sm">Actualizar Seguridad</Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
