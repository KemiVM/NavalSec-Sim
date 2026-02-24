import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SimulationService, DataService } from "@/services/api"
import type { NavalSystem, SystemLog } from "@/types/api"
import { Activity, Server, Shield, Clock, AlertTriangle, ShieldAlert } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/LanguageContext"
import { useTheme } from "@/contexts/ThemeContext"
import { useSettings } from "@/contexts/SettingsContext"
import { NumberTicker } from "@/components/ui/number-ticker"
import { ShipView } from "@/components/ShipView"

export function Dashboard() {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const { refreshInterval, hiddenSystems, dashboardLayout } = useSettings()
  const [systems, setSystems] = useState<NavalSystem[]>([])
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // We'll calculate the live chart data in render from the `logs` state.
  const [chartData, setChartData] = useState<{time: string, alerts: number}[]>([])

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [sysData, recentLogs] = await Promise.all([
           SimulationService.getSystems(),
           // Fetch last 150 logs to draw the chart and calculate live stats
           DataService.getLogs(150)
        ])
        setSystems(sysData)
        setLogs(recentLogs)
        
        // Transform logs into chart groups
        const grouped = recentLogs.reduce((acc, log) => {
            if (log.is_abnormal || log.is_attack) {
                // Formatting time e.g., '14:05:22' to '14:05' to group by minute
                const d = new Date(log.timestamp)
                const timeKey = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
                acc[timeKey] = (acc[timeKey] || 0) + 1
            }
            return acc
        }, {} as Record<string, number>)
        
        // Convert to array and sort chronologically
        const liveChartData = Object.entries(grouped)
            .map(([time, alerts]) => ({ time, alerts }))
            .sort((a, b) => a.time.localeCompare(b.time))
            
        // If there are no alerts at all, just put a flat line for visual feedback
        if (liveChartData.length === 0) {
            const now = new Date()
            liveChartData.push({ time: `${now.getHours()}:${now.getMinutes()}`, alerts: 0 })
        }

        setChartData(liveChartData)
        setError(null)
      } catch (err) {
        setError("Error connecting to backend services")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
    const interval = setInterval(fetchAllData, refreshInterval) 
    return () => clearInterval(interval)
  }, [refreshInterval])

  const activeSystems = systems.filter(s => s.relay.state === "ON").length
  const trippedSystems = systems.filter(s => s.relay.state === "TRIPPED").length
  const totalSystems = systems.length || 1 // Avoid div by 0 for uptime
  const inactiveSystems = systems.filter(s => s.relay.state === "OFF").length
  
  const uptimeRatio = ((activeSystems + inactiveSystems) / totalSystems) * 100
  // Instead of static "178,243", we use the DB log sum as our base proxy for "events processed"
  const totalEvents = logs.length > 0 ? (logs[0].id || logs.length * 10) : 0 
  // Get sum of trips/alerts in recent db chunk
  const activeAlerts = logs.filter(l => l.is_abnormal || l.is_attack).length

  const pieData = [
    { name: t("dashboard.states.active"), value: activeSystems, color: '#10b981' }, 
    { name: t("dashboard.states.fault"), value: trippedSystems, color: '#ef4444' }, 
    { name: t("dashboard.states.inactive"), value: inactiveSystems, color: '#6b7280' }, 
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  if (loading && systems.length === 0) {
      return <div className="flex h-full items-center justify-center text-muted-foreground animate-pulse">{t("dashboard.loading")}</div>
  }

  return (
    <motion.div 
      className="flex flex-col gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex justify-between items-center bg-card/60 rounded-xl p-4 shadow-sm border mt-2 mb-2">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{t("dashboard.title")}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t("dashboard.subtitle")}</p>
          </div>
      </div>
      
      {error && (
        <motion.div variants={item} className="rounded-md bg-destructive/10 p-4 text-destructive border border-destructive/20 shadow-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <p>{error}</p>
        </motion.div>
      )}

      {/* Top Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <motion.div variants={item}>
             <Card className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldAlert className="h-24 w-24 text-red-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.cyberThreats") || "Amenazas Cibernéticas"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-red-500">
                        <NumberTicker value={logs.filter(l => l.is_attack).length} />
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">Registradas históricamente</p>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div variants={item}>
            <Card className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="h-24 w-24 text-primary" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.totalEvents")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-primary">
                        <NumberTicker value={totalEvents} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <span className="text-green-500 font-medium flex items-center mr-1">{t("dashboard.realtime")}</span> {t("dashboard.processedEvents")}
                    </p>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div variants={item}>
             <Card className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Shield className="h-24 w-24 text-destructive" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.criticalAlerts")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-destructive">
                        <NumberTicker value={activeAlerts} />
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">{t("dashboard.last150")}</p>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div variants={item}>
            <Card className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Server className="h-24 w-24 text-blue-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.activeAgents")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-blue-500">
                        <NumberTicker value={activeSystems} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t("dashboard.connectedSystems")}</p>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div variants={item}>
             <Card className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Clock className="h-24 w-24 text-orange-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.uptime")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-orange-500">
                        <NumberTicker value={uptimeRatio} />%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t("dashboard.availabilityLabel")}</p>
                </CardContent>
            </Card>
        </motion.div>
      </div>

      {/* Ship SVG Section */}
      <motion.div variants={item} className="w-full">
        <ShipView systems={systems.filter(s => !hiddenSystems.includes(s.id))} />
      </motion.div>

      {/* Main Charts Section */}
      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        <motion.div variants={item} className="col-span-4">
            <Card className="h-[400px] shadow-md border-primary/5">
                <CardHeader className="border-b bg-muted/10 pb-4 mb-4">
                    <CardTitle>{t("dashboard.alertsEvolution")}</CardTitle>
                    <CardDescription>{t("dashboard.last24h")}</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00A9E0" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#00A9E0" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                            <Tooltip 
                                cursor={{fill: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))', 
                                    borderColor: 'hsl(var(--border))', 
                                    borderRadius: '8px', 
                                    color: 'hsl(var(--popover-foreground))',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{color: '#00A9E0'}}
                            />
                            <Area type="monotone" dataKey="alerts" stroke="#00A9E0" strokeWidth={3} fillOpacity={1} fill="url(#colorAlerts)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div variants={item} className="col-span-3">
             <Card className="h-[400px] shadow-md border-primary/5">
                <CardHeader className="border-b bg-muted/10 pb-4 mb-4">
                    <CardTitle>{t("dashboard.systemState")}</CardTitle>
                    <CardDescription>{t("dashboard.distribution")}</CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
      </div>

      {/* Logic for individual cards below charts */}
      <h2 className="text-xl font-semibold mt-4">{t("dashboard.activeModules")}</h2>
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardLayout
          .map(id => systems.find(s => s.id === id))
          .filter((system): system is NavalSystem => !!system && !hiddenSystems.includes(system.id))
          .map((system) => (
           <Card key={system.id} className={`border-l-4 shadow-sm hover:shadow-md transition-all ${
               system.relay.state === "ON" ? "border-l-green-500" : 
               system.relay.state === "TRIPPED" ? "border-l-destructive" : "border-l-gray-300"
           }`}>
               <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{system.name}</span>
                        {system.relay.state === "TRIPPED" && <AlertTriangle className="h-4 w-4 text-destructive animate-bounce" />}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                    {system.sensors.map(sensor => (
                        <div key={sensor.id} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground uppercase">{t(`sensor.${sensor.type}`) || sensor.type}</span>
                            <span className="font-mono">{sensor.value.toFixed(1)} {sensor.unit}</span>
                        </div>
                        ))}
                    </div>
               </CardContent>
           </Card>
        ))}
      </motion.div>
    </motion.div>
  )
}
