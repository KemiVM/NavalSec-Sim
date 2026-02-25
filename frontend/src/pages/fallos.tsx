import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SimulationService, FaultsService } from "@/services/api"
import type { NavalSystem } from "@/types/api"
import { 
  Zap, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Globe, 
  Terminal, 
  Cpu, 
  AlertTriangle,
  History,
  X,
  Target,
  Crosshair,
  Wifi,
  Skull,
  RadioTower
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { useSettings } from "@/contexts/SettingsContext"
import { toast } from "sonner"

interface InjectionLog {
  id: string
  timestamp: string
  type: 'sensor' | 'relay'
  target: string
  status: 'active' | 'completed'
  ip: string
}

export function Fallos() {
  const { t } = useLanguage()
  const { refreshInterval } = useSettings()
  const [systems, setSystems] = useState<NavalSystem[]>([])
  
  // State: Laboratorio de Sensores
  const [labSystemId, setLabSystemId] = useState<string>("")
  const [labSensorId, setLabSensorId] = useState<string>("")
  const [labDuration, setLabDuration] = useState<number>(10)
  const [labValue, setLabValue] = useState<number>(0)
  const [isLabLoading, setIsLabLoading] = useState(false)

  // State: Centro de Ciberseguridad
  const [cyberIp, setCyberIp] = useState<string>("10.0.0.15")
  const [cyberSystemId, setCyberSystemId] = useState<string>("")
  const [cyberSensorId, setCyberSensorId] = useState<string>("")
  const [cyberDuration] = useState<number>(15)
  const [isCyberLoading, setIsCyberLoading] = useState(false)

  const [injectionLogs, setInjectionLogs] = useState<InjectionLog[]>([])

  useEffect(() => {
    const fetchSystems = () => {
      SimulationService.getSystems().then(setSystems).catch(console.error)
    }
    fetchSystems()
    const interval = setInterval(fetchSystems, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const labSystem = systems.find(s => s.id === labSystemId)
  const cyberSystem = systems.find(s => s.id === cyberSystemId)
  
  const addLog = (type: 'sensor' | 'relay', target: string, ip: string, duration: number) => {
    const newLog: InjectionLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      type,
      target,
      status: 'active',
      ip
    }
    setInjectionLogs(prev => [newLog, ...prev].slice(0, 10))
    
    // Auto complete tracking
    setTimeout(() => {
      setInjectionLogs(prev => prev.map(l => l.id === newLog.id ? { ...l, status: 'completed' } : l))
    }, duration * 1000)
  }

  // Handle Lab Execution
  const handleLabExecute = async () => {
      if (!labSystemId || !labSensorId) return
      setIsLabLoading(true)
      try {
          await FaultsService.injectSensorAttack(labSystemId, labSensorId, labValue, labDuration)
          toast.success(
            <div className="flex flex-col gap-1">
              <span className="font-bold text-cyan-700 dark:text-cyan-400">INYECCIÓN FÍSICA EXITOSA</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">Alteración en {labSystem?.name} &gt; Sensor {labSensorId} durante {labDuration}s.</span>
            </div>,
            { className: "bg-white dark:bg-slate-900 border-cyan-500" }
          )
          addLog('sensor', `${labSystemId} / ${labSensorId}`, "Internal", labDuration)
      } catch (err) {
          toast.error("Error en inyección física del Laboratorio")
      } finally {
        setIsLabLoading(false)
      }
  }

  // Handle Cyber Execution (Relay Trip)
  const handleCyberRelayTrip = async () => {
      if (!cyberSystemId || !cyberIp) return
      setIsCyberLoading(true)
      try {
          await FaultsService.injectRelayFault(cyberSystemId, cyberDuration, cyberIp)
          toast.error(
            <div className="flex flex-col gap-1">
              <span className="font-bold text-red-600 dark:text-red-500">ALERTA DE SEGURIDAD DETONADA</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">Intento de TRIP en Relé del {cyberSystem?.name} originado en {cyberIp}.</span>
            </div>,
            { className: "bg-red-50 dark:bg-[#2a0909] border-red-500" }
          )
          addLog('relay', `RELAY_${cyberSystemId}`, cyberIp, cyberDuration)
      } catch (err) {
          toast.error("Error al establecer la conexión de ataque")
      } finally {
        setIsCyberLoading(false)
      }
  }

  // Handle Cyber Execution (Sensor Spoofing)
  const handleCyberSensorSpoof = async () => {
      if (!cyberSystemId || !cyberSensorId || !cyberIp) return
      setIsCyberLoading(true)
      try {
          await FaultsService.injectSensorAttack(cyberSystemId, cyberSensorId, 9999, cyberDuration, cyberIp)
          toast.error(
            <div className="flex flex-col gap-1">
              <span className="font-bold text-red-600 dark:text-red-500">SPOOFING MASIVO DETONADO</span>
              <span className="text-xs text-slate-600 dark:text-slate-300">Sobreescritura en {cyberSystem?.name} &gt; {cyberSensorId} originado en {cyberIp}.</span>
            </div>,
            { className: "bg-red-50 dark:bg-[#2a0909] border-red-500" }
          )
          addLog('sensor', `${cyberSystemId} / ${cyberSensorId}`, cyberIp, cyberDuration)
      } catch (err) {
          toast.error("Error al establecer la conexión de ataque")
      } finally {
        setIsCyberLoading(false)
      }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.6, staggerChildren: 0.15, ease: "easeOut" as const }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <motion.div 
      className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 p-8 border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-100 dark:bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-red-100 dark:bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-cyan-50 dark:bg-gradient-to-br dark:from-cyan-500/20 dark:to-blue-500/5 rounded-xl border border-cyan-200 dark:border-cyan-500/20">
                <Terminal className="h-7 w-7 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-slate-400 tracking-tight">
                {t("faults.labsHeader")}
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 max-w-3xl text-lg font-medium leading-relaxed">
              Plataforma unificada para pruebas de estrés. Inyecte datos anómalos físicamente <strong className="text-cyan-600 dark:text-cyan-400">Laboratorio de Sensores</strong> o comprometa el sistema remotamente desde el <strong className="text-red-600 dark:text-red-400">Centro de Operaciones de Ciberseguridad</strong>.
            </p>
          </div>
          <div className="hidden md:flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-cyan-200 dark:border-cyan-500/20 bg-cyan-50 dark:bg-cyan-500/10 rounded-full">
               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
               <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 tracking-wider">SECURE LINK ONLINE</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 rounded-full">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               <span className="text-xs font-bold text-red-600 dark:text-red-500 tracking-wider">PENTEST ENABLED</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Module A: Laboratorio de Sensores */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full border-cyan-200 dark:border-cyan-500/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden flex flex-col shadow-lg dark:shadow-[0_0_30px_rgba(34,211,238,0.05)] hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-all duration-500 group relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-50 dark:from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl text-cyan-600 dark:text-cyan-400">
                  <Cpu className="h-6 w-6 text-cyan-600 dark:text-cyan-400" /> 
                  {t("faults.sensorModule")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 px-3 py-1 rounded-sm border border-cyan-200 dark:border-cyan-500/30">
                    ACCESO FÍSICO
                  </span>
                </div>
              </div>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-sm">{t("faults.spoofingDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2 flex-1 flex flex-col z-10">
              
              <div className="grid gap-6">
                <div className="space-y-2.5">
                  <Label className="text-cyan-800 dark:text-cyan-200/70 font-bold tracking-wide text-xs uppercase flex items-center gap-2">
                    <Target className="h-3 w-3" /> {t("faults.targetSystem")}
                  </Label>
                  <select 
                    className="flex h-12 w-full rounded-lg border border-slate-200 dark:border-cyan-900/50 bg-slate-50 dark:bg-black/40 px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 hover:bg-slate-100 dark:hover:bg-black/60 transition-all cursor-pointer shadow-inner"
                    value={labSystemId}
                    onChange={(e) => {
                      setLabSystemId(e.target.value)
                      setLabSensorId("")
                    }}
                  >
                    <option value="" disabled>SELECCIONAR INFRAESTRUCTURA...</option>
                    {systems.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-cyan-800 dark:text-cyan-200/70 font-bold tracking-wide text-xs uppercase flex items-center gap-2">
                    <Activity className="h-3 w-3" /> {t("faults.targetSensor")}
                  </Label>
                  <select 
                    className="flex h-12 w-full rounded-lg border border-slate-200 dark:border-cyan-900/50 bg-slate-50 dark:bg-black/40 px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 hover:bg-slate-100 dark:hover:bg-black/60 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-inner"
                    disabled={!labSystemId}
                    value={labSensorId}
                    onChange={(e) => setLabSensorId(e.target.value)}
                  >
                    <option value="" disabled>ASIGNAR CANAL TELEMÉTRICO...</option>
                    {labSystem?.sensors.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Unidad: {s.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label className="text-cyan-800 dark:text-cyan-200/70 font-bold tracking-wide text-xs uppercase">{t("faults.falseValue")}</Label>
                    <Input 
                      type="number" 
                      step="0.1"
                      className="bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-cyan-900/50 text-slate-900 dark:text-slate-200 focus-visible:ring-cyan-500/50 h-12 font-mono text-lg shadow-inner"
                      value={labValue}
                      onChange={e => setLabValue(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-cyan-800 dark:text-cyan-200/70 font-bold tracking-wide text-xs uppercase">{t("faults.durationShort")}</Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        className="bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-cyan-900/50 text-slate-900 dark:text-slate-200 focus-visible:ring-cyan-500/50 h-12 font-mono text-lg shadow-inner pr-8"
                        value={labDuration}
                        onChange={e => setLabDuration(Number(e.target.value))}
                        min={1}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-xs">SEG</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-auto">
                <Button 
                  className={cn(
                    "w-full h-14 transition-all duration-300 shadow-md dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] group/btn relative overflow-hidden",
                    !labSensorId || isLabLoading 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700" 
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-sm tracking-widest uppercase hover:scale-[1.02]"
                  )}
                  onClick={handleLabExecute}
                  disabled={!labSensorId || isLabLoading}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-in-out" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLabLoading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-500 border-t-cyan-600 dark:border-t-white animate-spin" />
                    ) : (
                      <><Zap className="h-5 w-5" /> INYECTAR PARÁMETROS VÍA HARDWARE</>
                    )}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Module B: Centro de Operaciones de Ciberseguridad */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full border-red-200 dark:border-red-500/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden flex flex-col shadow-lg dark:shadow-[0_0_30px_rgba(239,68,68,0.05)] hover:shadow-xl dark:hover:shadow-[0_0_40px_rgba(239,68,68,0.1)] transition-all duration-500 group relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-b from-red-50 dark:from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <CardHeader className="space-y-2 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-2xl text-red-600 dark:text-red-500">
                  <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-500" /> 
                  {t("faults.cyberModule")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 px-3 py-1 rounded-sm border border-red-200 dark:border-red-500/30">
                    ATAQUE REMOTO
                  </span>
                </div>
              </div>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-sm">Ejecute ataques simulados desde IPs maliciosas para forzar alertas de seguridad y caídas de sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2 flex-1 flex flex-col z-10">
              
              <div className="p-5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 space-y-4 shadow-inner relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-red-500/5 group-hover:text-red-500/10 transition-colors pointer-events-none">
                  <Wifi className="h-32 w-32" />
                </div>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest relative z-10">
                  <Globe className="h-4 w-4 animate-pulse" /> {t("faults.sourceIP")} (Vectores externos)
                </div>
                <div className="space-y-3 relative z-10">
                  <Input 
                    className="bg-white dark:bg-black/60 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 font-mono text-lg tracking-widest focus-visible:ring-red-500 h-12 shadow-inner"
                    value={cyberIp}
                    onChange={e => setCyberIp(e.target.value)}
                  />
                  <p className="text-xs text-red-700/60 dark:text-red-400/60 font-medium">Use IPs fuera de la lista blanca para eludir corta-fuegos y testear el SOC.</p>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="space-y-2.5">
                  <Label className="text-red-800 dark:text-red-400/70 font-bold tracking-wide text-xs uppercase flex items-center gap-2">
                    <Crosshair className="h-3 w-3" /> OBJETIVO DE ATAQUE
                  </Label>
                  <select 
                    className="flex h-12 w-full rounded-lg border border-slate-200 dark:border-red-900/50 bg-slate-50 dark:bg-black/40 px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 hover:bg-slate-100 dark:hover:bg-black/60 transition-all cursor-pointer shadow-inner"
                    value={cyberSystemId}
                    onChange={(e) => {
                      setCyberSystemId(e.target.value)
                      setCyberSensorId("")
                    }}
                  >
                    <option value="" disabled>SELECCIONAR NODO VULNERABLE...</option>
                    {systems.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2.5">
                   <Label className="text-red-800 dark:text-red-400/70 font-bold tracking-wide text-xs uppercase flex items-center gap-2">
                    <RadioTower className="h-3 w-3" /> PUERTO DE SENSOR (Para Spoofing)
                  </Label>
                  <select 
                    className="flex h-12 w-full rounded-lg border border-slate-200 dark:border-red-900/50 bg-slate-50 dark:bg-black/40 px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 hover:bg-slate-100 dark:hover:bg-black/60 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-inner"
                    disabled={!cyberSystemId}
                    value={cyberSensorId}
                    onChange={(e) => setCyberSensorId(e.target.value)}
                  >
                    <option value="" disabled>SELECCIONAR SENSOR PARA INTERCEPTAR...</option>
                    {cyberSystem?.sensors.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-auto grid grid-cols-2 gap-4">
                <Button 
                  className={cn(
                    "flex-1 h-14 flex flex-col items-center justify-center gap-1 transition-all group/btn outline-none ring-0 shadow-[0_0_10px_rgba(249,115,22,0.05)] dark:shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] dark:hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]",
                    !cyberSystemId || isCyberLoading 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700" 
                      : "bg-white dark:bg-gradient-to-t dark:from-orange-900/50 dark:to-orange-800 border border-orange-200 dark:border-orange-500/50 hover:bg-orange-50 dark:hover:from-orange-600 dark:hover:to-orange-500 text-orange-600 dark:text-orange-200 hover:text-orange-700 dark:hover:text-white"
                  )}
                  onClick={handleCyberRelayTrip}
                  disabled={!cyberSystemId || isCyberLoading}
                >
                  <Skull className="h-4 w-4 mb-0.5" />
                  <span className="text-[10px] font-black tracking-widest uppercase">FORZAR CAÍDA RED</span>
                </Button>
                
                <Button 
                  className={cn(
                    "flex-1 h-14 flex flex-col items-center justify-center gap-1 transition-all group/btn outline-none ring-0 shadow-[0_0_10px_rgba(239,68,68,0.05)] dark:shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] dark:hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]",
                    !cyberSensorId || isCyberLoading 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700" 
                      : "bg-white dark:bg-gradient-to-t dark:from-red-950 dark:to-red-900 border border-red-200 dark:border-red-500/50 hover:bg-red-50 dark:hover:from-red-700 dark:hover:to-red-600 text-red-600 dark:text-red-200 hover:text-red-700 dark:hover:text-white"
                  )}
                  onClick={handleCyberSensorSpoof}
                  disabled={!cyberSensorId || isCyberLoading}
                >
                  <AlertTriangle className="h-4 w-4 mb-0.5" />
                  <span className="text-[10px] font-black tracking-widest uppercase">SOBREESCRIBIR DATOS</span>
                </Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Activity Timeline (Ejecuciones Temporales) */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg dark:shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 dark:via-primary/50 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
            <div>
              <CardTitle className="text-xl flex items-center gap-3 text-slate-900 dark:text-slate-200">
                <History className="h-6 w-6 text-primary" />
                {t("faults.executionQueue")}
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">Seguimiento cifrado de inyecciones y cargas en sistema.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setInjectionLogs([])} className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-500/20 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10">
              <X className="h-4 w-4 mr-2" /> VACIAR ARCHIVO
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4 min-h-[120px]">
              <AnimatePresence mode="popLayout">
                {injectionLogs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600 h-full border border-dashed border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-white/[0.01]"
                  >
                    <RadioTower className="h-10 w-10 opacity-20 mb-3" />
                    <p className="text-sm font-medium tracking-wide">Esperando intercepciones de red...</p>
                  </motion.div>
                ) : (
                  injectionLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -30, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                      layout
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all duration-700 relative overflow-hidden",
                        log.status === 'active' 
                          ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-md dark:shadow-lg" 
                          : "bg-slate-50 dark:bg-black/40 border-slate-100 dark:border-white/5 grayscale opacity-60"
                      )}
                    >
                      {log.status === 'active' && <div className={cn("absolute left-0 top-0 bottom-0 w-1 animate-pulse", log.type === 'relay' ? "bg-red-500" : "bg-cyan-500")} />}
                      <div className="flex items-center gap-5 ml-2">
                        <div className={cn(
                          "p-3 rounded-xl border backdrop-blur-sm",
                          log.type === 'relay' 
                            ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-100 dark:border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] dark:shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                            : "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)] dark:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                        )}>
                          {log.type === 'relay' ? <AlertTriangle className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className={cn("text-base font-black tracking-wide uppercase", log.type === 'relay' ? "text-red-600 dark:text-red-400" : "text-cyan-600 dark:text-cyan-400")}>
                            {log.type === 'relay' ? 'DENEGACIÓN DE SERVICIO' : 'MANIPULACIÓN FÍSICA'}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{log.timestamp}</span>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-1">
                               <Target className="h-3 w-3 text-slate-400 dark:text-slate-500" /> {log.target}
                            </span>
                            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1", log.ip !== 'Internal' ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20" : "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20")}>
                              {log.ip !== 'Internal' && <Globe className="h-3 w-3" />}
                              SRC_IP: {log.ip}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pr-2">
                        {log.status === 'active' ? (
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/5">
                             <div className={cn("h-2 w-2 rounded-full animate-pulse", log.type === 'relay' ? "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] dark:shadow-[0_0_5px_#ef4444]" : "bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.5)] dark:shadow-[0_0_5px_#06b6d4]")} />
                             <span className={cn("text-xs font-bold uppercase tracking-wider animate-pulse", log.type === 'relay' ? "text-red-600 dark:text-red-400" : "text-cyan-600 dark:text-cyan-400")}>EJECUTANDO...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600/70 dark:text-green-500/50 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-500/10">
                             <CheckCircle2 className="h-4 w-4" />
                             <span className="text-xs font-bold uppercase tracking-wider">COMPLETADO</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
