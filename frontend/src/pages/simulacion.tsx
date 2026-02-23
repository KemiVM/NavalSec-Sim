import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getSensorName } from "@/utils/sensor-utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SimulationService } from "@/services/api"
import type { NavalSystem } from "@/types/api"
import { Power, RefreshCw, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { useSettings } from "@/contexts/SettingsContext"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

export function Simulacion() {
  const { t } = useLanguage()
  const { refreshInterval, simulationLayout, hiddenSystems } = useSettings()
  const [systems, setSystems] = useState<NavalSystem[]>([])
  const [history, setHistory] = useState<Record<string, Record<string, unknown>[]>>({})

  const fetchSystems = async () => {
    try {
        const data = await SimulationService.getSystems()
        setSystems(data)
        
        const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setHistory(prev => {
            const newHistory = { ...prev }
            data.forEach(system => {
                if (!newHistory[system.id]) newHistory[system.id] = []
                
                const dataPoint: Record<string, unknown> = { time: now }
                system.sensors.forEach(sensor => {
                    dataPoint[sensor.id] = Number(sensor.value)
                })
                
                newHistory[system.id] = [...newHistory[system.id], dataPoint].slice(-30) // Keep last 30 readings
            })
            return newHistory
        })
    } catch (err) {
        console.error(err)
    }
  }

  useEffect(() => {
    fetchSystems()
    const interval = setInterval(fetchSystems, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const handleSetRelay = async (systemId: string, newState: "ON" | "OFF" | "TRIPPED") => {
      try {
          await SimulationService.toggleRelay(systemId, newState)
          fetchSystems()
      } catch (err) {
          console.error(`Error setting relay to ${newState}:`, err)
      }
  }

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#00C49F"]

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

  return (
    <motion.div 
      className="flex flex-col gap-6 h-full pb-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex justify-between items-center bg-card/60 rounded-xl p-4 shadow-sm border mt-2">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{t("simulation.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("simulation.subtitle")}</p>
        </div>
        <Button onClick={fetchSystems} variant="secondary" className="gap-2 shadow-sm transition-transform active:scale-95">
            <RefreshCw className="h-4 w-4" /> 
            <span className="hidden sm:inline">{t("simulation.refresh")}</span>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {simulationLayout
          .map(id => systems.find(s => s.id === id))
          .filter((system): system is NavalSystem => !!system && !hiddenSystems.includes(system.id))
          .map((system) => (
          <motion.div key={system.id} variants={item} className="flex flex-col h-full">
            <Card className="overflow-hidden flex flex-col h-full shadow-md border-primary/5 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="bg-muted/10 pb-4 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Power className={cn("h-5 w-5", system.relay.state === "ON" ? "text-green-500" : system.relay.state === "OFF" ? "text-gray-400" : "text-destructive" )} />
                                {system.name}
                            </CardTitle>
                            <CardDescription className="uppercase tracking-widest text-[10px] font-semibold mt-1 opacity-70">
                                {t("simulation.id") || "ID"}: {system.id}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-inner ${
                                system.relay.state === "ON" ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" :
                                system.relay.state === "OFF" ? "bg-secondary text-secondary-foreground border border-border" :
                                "bg-destructive text-destructive-foreground border border-destructive/50 shadow-destructive/20 animate-pulse"
                            }`}>
                                {t(`simulation.relayStates.${system.relay.state}`)}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col gap-6">
                    {/* Controls */}
                    <div className="flex flex-wrap gap-3 p-1 bg-muted/20 rounded-lg w-fit border border-border/50">
                        <Button 
                            variant={system.relay.state === "ON" ? "ghost" : "default"}
                            onClick={() => handleSetRelay(system.id, system.relay.state === "ON" ? "OFF" : "ON")}
                            className="flex-1 md:flex-none"
                            disabled={system.relay.state === "TRIPPED"}
                            size="sm"
                        >
                            {system.relay.state === "ON" ? t("simulation.turnOff") : t("simulation.turnOn")}
                        </Button>
                        <Button
                            variant={system.relay.state === "TRIPPED" ? "ghost" : "destructive"}
                            onClick={() => handleSetRelay(system.id, "TRIPPED")}
                            disabled={system.relay.state === "TRIPPED"}
                            className="flex-1 md:flex-none"
                            size="sm"
                        >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            {t("simulation.forceFault")}
                        </Button>
                    </div>
                    
                    {/* Current Sensors Values */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {system.sensors.map(sensor => {
                            const isNearLimit = sensor.safe_max && sensor.value >= (sensor.safe_max * 0.9)
                            const color = isNearLimit ? "hsl(var(--warning))" : "hsl(var(--primary))"; // Define color based on condition
                            return (
                            <div key={sensor.id} className="flex flex-col mb-1 border rounded-md p-2 bg-background/50 relative overflow-hidden">
                                {/* Barra de nivel de peligro sutil en fondo */}
                                <div className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-transparent to-current opacity-[0.03] w-full pointer-events-none" style={{ color: color }} />
                                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{t(`sensor.${sensor.type}`) || sensor.type}</span>
                                <div className="flex justify-between items-baseline mt-1 z-10 text-foreground flex items-baseline gap-1">
                                    {sensor.value.toFixed(1)} 
                                    <span className="text-xs text-muted-foreground font-medium font-sans">{sensor.unit}</span>
                                </div>
                            </div>
                        )})}
                    </div>

                    {/* Chart */}
                    <div className="h-[240px] w-full mt-auto border rounded-xl p-4 bg-background shadow-inner">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history[system.id] || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={10} 
                                    tickMargin={10} 
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={10}
                                    tickFormatter={(val) => val.toFixed(0)}
                                    width={40}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                                {system.sensors.map((sensor, idx) => (
                                    <Line 
                                        key={sensor.id}
                                        type="monotone" 
                                        dataKey={sensor.id}
                                        name={getSensorName(sensor.id)}
                                        stroke={colors[idx % colors.length]} 
                                        strokeWidth={2.5}
                                        dot={{ r: 2, fillOpacity: 0.8 }}
                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                        isAnimationActive={true}
                                        animationDuration={500}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
