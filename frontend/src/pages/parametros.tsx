import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/LanguageContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useSettings } from "@/contexts/SettingsContext"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Settings, 
  Monitor, 
  Shield, 
  Activity, 
  Layout, 
  Save, 
  RefreshCcw,
  Palette,
  Globe,
  Database,
  ArrowUp,
  ArrowDown,
  Eye,
  Users,
  Trash2} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const SYSTEM_NAMES: Record<string, string> = {
  "sys_main_engine": "Motor Principal",
  "sys_aux_gen": "Generador Auxiliar",
  "sys_bilge_pump": "Bomba de Achique",
  "sys_radar": "Radar Banda-X",
  "sys_steering": "Sistema de Gobierno",
  "sys_fire": "Contraincendios"
}

export function Parametros() {
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { 
    refreshInterval, 
    setRefreshInterval, 
    backendConfig, 
    updateBackendConfig,
    refreshBackendConfig,
    hiddenSystems,
    toggleSystemVisibility,
    dashboardLayout,
    simulationLayout,
    moveSystem
  } = useSettings()
  const { users, promoteUser, deleteUser, user: currentUser } = useAuth()

  const [localInterval, setLocalInterval] = useState(refreshInterval.toString())
  const [localLogInterval, setLocalLogInterval] = useState(backendConfig.log_interval.toString())
  const [newIp, setNewIp] = useState("")

  const handleSaveFrontend = () => {
    setRefreshInterval(parseInt(localInterval))
    toast.success(t("settings.saved") || "Ajustes de interfaz guardados")
  }

  const handleSaveBackend = async () => {
    try {
      await updateBackendConfig({
        log_interval: parseInt(localLogInterval)
      })
      toast.success(t("settings.backendSaved") || "Configuración del servidor actualizada")
    } catch (e) {
      toast.error("Error al actualizar el servidor")
    }
  }

  const handleAddIp = async () => {
    if (!newIp) return
    try {
      await updateBackendConfig({
        valid_ips: [...backendConfig.valid_ips, newIp]
      })
      setNewIp("")
      toast.success(`IP ${newIp} añadida a la lista blanca`)
    } catch (e) {
      toast.error("Error al añadir IP")
    }
  }

  const handleRemoveIp = async (ip: string) => {
    try {
      if (!window.confirm(`¿Está seguro de que desea eliminar la IP ${ip} de la lista blanca?`)) return
      await updateBackendConfig({
        valid_ips: backendConfig.valid_ips.filter(i => i !== ip)
      })
      toast.success("IP eliminada")
    } catch (e) {
      toast.error("Error al eliminar IP")
    }
  }

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`¿ESTÁ SEGURO? Esta acción eliminará permanentemente al usuario "${userName}". Esta acción no se puede deshacer.`)) {
      deleteUser(userId)
      toast.success(`Usuario ${userName} eliminado del sistema`)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <motion.div 
      className="flex flex-col gap-6 h-full pb-8 max-w-6xl mx-auto w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex justify-between items-center bg-card/60 rounded-xl p-6 shadow-sm border mt-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t("sidebar.settings")}
            </h1>
            <p className="text-muted-foreground mt-1">
              Configuración técnica del simulador y personalización de la interfaz.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- SECCIÓN: APARIENCIA --- */}
        <motion.div variants={item}>
          <Card className="h-full border-primary/5 shadow-md">
            <CardHeader className="bg-muted/10 border-b">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>{t("settings.appearance") || "Apariencia e Idioma"}</CardTitle>
              </div>
              <CardDescription>Personaliza cómo se ve y se lee la aplicación.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label>{t("settings.theme") || "Tema Visual"}</Label>
                <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t("settings.light") || "Claro"}</SelectItem>
                    <SelectItem value="dark">{t("settings.dark") || "Oscuro"}</SelectItem>
                    <SelectItem value="system">{t("settings.system") || "Sistema"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("settings.language") || "Idioma del Sistema"}</Label>
                <div className="flex items-center gap-2">
                  <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
                    <SelectTrigger className="flex-1">
                      <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español (Castellano)</SelectItem>
                      <SelectItem value="en">English (US)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* --- SECCIÓN: SIMULACIÓN --- */}
        <motion.div variants={item}>
          <Card className="h-full border-primary/5 shadow-md">
            <CardHeader className="bg-muted/10 border-b">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>{t("settings.simParams") || "Parámetros del Ciclo"}</CardTitle>
              </div>
              <CardDescription>Ajusta los tiempos de ejecución y refresco.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label>Refresco de Interfaz (ms)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={localInterval} 
                    onChange={e => setLocalInterval(e.target.value)}
                    min={500}
                    step={500}
                  />
                  <Button variant="outline" size="icon" onClick={handleSaveFrontend}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Intervalo en milisegundos para las peticiones GET al simulador.</p>
              </div>
              <div className="space-y-2">
                <Label>Intervalo de Bitácora (seg)</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={localLogInterval} 
                    onChange={e => setLocalLogInterval(e.target.value)}
                    min={5}
                  />
                  <Button variant="outline" size="icon" onClick={handleSaveBackend}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Frecuencia con la que el servidor inyecta logs de estado NOMINAL en la base de datos.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* --- SECCIÓN: SEGURIDAD --- */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="border-primary/5 shadow-md">
            <CardHeader className="bg-muted/10 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Ciberseguridad | Lista Blanca de IPs</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={refreshBackendConfig}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Direcciones IP autorizadas para realizar cambios en sensores sin disparar alertas de ataque.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input 
                    placeholder="Ej: 192.168.1.50" 
                    value={newIp}
                    onChange={e => setNewIp(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddIp}>Añadir IP</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {backendConfig.valid_ips.map(ip => (
                  <div key={ip} className="flex items-center justify-between px-3 py-2 bg-muted rounded-md border text-sm font-mono">
                    <span>{ip}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveIp(ip)}
                    >
                      <span className="text-lg">×</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* --- SECCIÓN: PERSONALIZACIÓN DE VISTAS --- */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="border-primary/5 shadow-md">
            <CardHeader className="bg-muted/10 border-b">
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                <CardTitle>Personalización de Vistas (Dashboard y Simulación)</CardTitle>
              </div>
              <CardDescription>Configura la visibilidad y el orden de los sistemas en las páginas principales.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              {/* Visibilidad Global */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                   <Eye className="h-4 w-4" /> Visibilidad de Sistemas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(SYSTEM_NAMES).map(([id, name]) => (
                    <div key={id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">{name}</span>
                        <span className="text-[9px] text-muted-foreground uppercase">{id}</span>
                      </div>
                      <Switch 
                        checked={!hiddenSystems.includes(id)} 
                        onCheckedChange={() => toggleSystemVisibility(id)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Orden Dashboard */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                   <Monitor className="h-4 w-4" /> Orden en Dashboard
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dashboardLayout.map((id, index) => (
                    <div key={id} className="flex items-center gap-2 pl-3 pr-1 py-1 bg-background rounded-md border text-xs shadow-sm">
                      <span className="font-medium truncate max-w-[120px]">{SYSTEM_NAMES[id] || id}</span>
                      <div className="flex items-center gap-0.5 border-l ml-2 pl-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          disabled={index === 0}
                          onClick={() => moveSystem("dashboard", id, "up")}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          disabled={index === dashboardLayout.length - 1}
                          onClick={() => moveSystem("dashboard", id, "down")}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orden Simulación */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                   <Activity className="h-4 w-4" /> Orden en Simulación
                </h3>
                <div className="flex flex-wrap gap-2">
                  {simulationLayout.map((id, index) => (
                    <div key={id} className="flex items-center gap-2 pl-3 pr-1 py-1 bg-background rounded-md border text-xs shadow-sm">
                      <span className="font-medium truncate max-w-[120px]">{SYSTEM_NAMES[id] || id}</span>
                      <div className="flex items-center gap-0.5 border-l ml-2 pl-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          disabled={index === 0}
                          onClick={() => moveSystem("simulation", id, "up")}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          disabled={index === simulationLayout.length - 1}
                          onClick={() => moveSystem("simulation", id, "down")}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* --- SECCIÓN: GESTIÓN DE USUARIOS --- */}
        <motion.div variants={item} className="md:col-span-2">
          <Card className="border-primary/5 shadow-md">
            <CardHeader className="bg-muted/10 border-b">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Gestión de Personal y Permisos</CardTitle>
              </div>
              <CardDescription>Otorga privilegios de administrador o revócalos para el resto de usuarios.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                      <th className="px-4 py-3 text-left font-semibold">Email</th>
                      <th className="px-4 py-3 text-left font-semibold">Rol Actual</th>
                      <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full overflow-hidden border">
                            <img src={u.avatar} alt={u.username} className="h-full w-full object-cover" />
                          </div>
                          <span className="font-medium">{u.name} <span className="text-muted-foreground text-[10px]">(@{u.username})</span></span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                            u.role === 'admin' ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-transparent"
                          )}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.id !== currentUser?.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className={cn(
                                  "h-8 text-[11px] font-bold",
                                  u.role === 'admin' ? "text-destructive hover:bg-destructive/10" : "text-primary px-3"
                                )}
                                onClick={() => promoteUser(u.id, u.role === 'admin' ? 'user' : 'admin')}
                              >
                                {u.role === 'admin' ? 'Revocar Admin' : 'Hacer Admin'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                title="Eliminar Usuario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] italic text-muted-foreground px-3">Tú (Actual)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item} className="flex justify-center pt-4">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Database className="h-3 w-3" /> NAVALSEC Simulator v3.0.0 | Engine Alpha Rev 42
        </p>
      </motion.div>
    </motion.div>
  )
}
