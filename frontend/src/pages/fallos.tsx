import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SimulationService, FaultsService } from "@/services/api"
import type { NavalSystem } from "@/types/api"
import { Zap, Activity, ShieldAlert, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { useSettings } from "@/contexts/SettingsContext"

export function Fallos() {
  const { t } = useLanguage()
  const { refreshInterval } = useSettings()
  const [systems, setSystems] = useState<NavalSystem[]>([])
  const [selectedSystemId, setSelectedSystemId] = useState<string>("")
  const [selectedSensorId, setSelectedSensorId] = useState<string>("")
  const [duration, setDuration] = useState<number>(10)
  const [sensorValue, setSensorValue] = useState<number>(0)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    const fetchSystems = () => {
      SimulationService.getSystems().then(setSystems).catch(console.error)
    }
    fetchSystems()
    const interval = setInterval(fetchSystems, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval])

  const selectedSystem = systems.find(s => s.id === selectedSystemId)
  
  const handleRelayFault = async () => {
      if (!selectedSystemId) return
      try {
          const res = await FaultsService.injectRelayFault(selectedSystemId, duration)
          setMessage({ type: 'success', text: `Éxito: ${res.message}` })
          setTimeout(() => setMessage(null), 5000);
      } catch (err) {
          setMessage({ type: 'error', text: "Error inyectando fallo de protección térmica (relé)" })
          console.error(err)
      }
  }

  const handleSensorAttack = async () => {
      if (!selectedSystemId || !selectedSensorId) return
      try {
          const res = await FaultsService.injectSensorAttack(selectedSystemId, selectedSensorId, sensorValue, duration)
          setMessage({ type: 'success', text: `Éxito: ${res.message}` })
          setTimeout(() => setMessage(null), 5000);
      } catch (err) {
          setMessage({ type: 'error', text: "Error inyectando suplantación (spoofing) de sensor" })
          console.error(err)
      }
  }

  return (
    <div className="flex flex-col h-full pb-8">
      <div className="flex justify-between items-center bg-card/60 rounded-xl p-4 shadow-sm border mt-2 mb-6">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">{t("faults.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("faults.subtitle")}</p>
        </div>
      </div>
      
      {message && (
          <div className={cn(
              "p-4 rounded-xl border flex items-center gap-3 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2",
              message.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" : "bg-destructive/10 border-destructive/20 text-destructive"
          )}>
              {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              <span className="font-medium">{message.text}</span>
          </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden flex flex-col shadow-md border-primary/5 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="bg-muted/10 pb-4 border-b">
                <CardTitle className="flex items-center gap-2 text-destructive text-xl">
                    <Zap className="h-5 w-5" /> {t("faults.systemOverload")}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                    {t("faults.faultDesc")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 flex-1">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{t("faults.targetSystem")}</label>
                    <div className="relative">
                        <select 
                            className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all appearance-none cursor-pointer"
                            value={selectedSystemId}
                            onChange={(e) => {
                                setSelectedSystemId(e.target.value)
                                setSelectedSensorId("")
                            }}
                        >
                            <option value="" disabled>{t("faults.selectSystem")}</option>
                            {systems.map(s => (
                                <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-muted-foreground">▼</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{t("faults.faultDuration")}</label>
                    <Input 
                        type="number" 
                        value={duration} 
                        onChange={(e) => setDuration(Number(e.target.value))}
                        min={1}
                        className="h-11 bg-background/50 border-input"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t("faults.durationNote")}</p>
                </div>

                <div className="pt-4 mt-auto">
                    <Button 
                        variant="destructive" 
                        className="w-full shadow-sm hover:shadow-md transition-all font-semibold h-11" 
                        onClick={handleRelayFault}
                        disabled={!selectedSystemId}
                    >
                        {t("faults.executePhysical")}
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card className="overflow-hidden flex flex-col shadow-md border-primary/5 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="bg-muted/10 pb-4 border-b">
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xl">
                    <Activity className="h-5 w-5" /> {t("faults.spoofing")}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                    {t("faults.spoofingDesc")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 flex-1">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">{t("faults.targetSensor")}</label>
                    <div className="relative">
                        <select 
                            className="flex h-11 w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all appearance-none cursor-pointer placeholder:text-muted-foreground disabled:opacity-50"
                            value={selectedSensorId}
                            onChange={(e) => setSelectedSensorId(e.target.value)}
                            disabled={!selectedSystemId}
                        >
                            <option value="" disabled>{t("faults.selectSensor")}</option>
                            {selectedSystem?.sensors.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none text-muted-foreground">▼</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">{t("faults.falseValue")}</label>
                        <Input 
                            type="number" 
                            step="0.01"
                            value={sensorValue} 
                            onChange={(e) => setSensorValue(Number(e.target.value))}
                            className="h-11 bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">{t("faults.durationShort")}</label>
                        <Input 
                            type="number" 
                            value={duration} 
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min={1}
                            className="h-11 bg-background/50"
                        />
                    </div>
                </div>

                <div className="pt-4 mt-auto">
                    <Button 
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-md transition-all font-semibold h-11" 
                        onClick={handleSensorAttack}
                        disabled={!selectedSystemId || !selectedSensorId}
                    >
                        {t("faults.executeCyber")}
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
