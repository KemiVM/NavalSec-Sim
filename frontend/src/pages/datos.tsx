import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataService } from "@/services/api"
import type { SystemLog } from "@/types/api"
import { FileText, AlertTriangle, CheckCircle, RefreshCw, Activity, X, Info } from "lucide-react"
import { parseSensorData, getSensorName } from "@/utils/sensor-utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/LanguageContext"

/* Custom LogType intersection with Parsed Sensors and UI States */
type ProcessedLog = SystemLog & {
  parsedSensors: Record<string, unknown>[];
  uiState: "CRITICAL" | "WARNING" | "NORMAL";
};

export function Datos() {
  const { t } = useLanguage()
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<"ALL" | "NORMAL" | "WARNING" | "CRITICAL">("ALL")
  const [activeLog, setActiveLog] = useState<ProcessedLog | null>(null)

  const fetchLogs = async () => {
    try {
        setLoading(true)
        // Pedimos más logs ya que filtramos en real-time por advertencias
        const data = await DataService.getLogs(100, false)
        setLogs(data)
    } catch (err) {
        console.error(err)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Process and color-code logs locally using useMemo for optimization
  const processedLogs = useMemo(() => {
    return logs.map(log => {
        const isCritical = log.relay_state === "TRIPPED"
        let isWarning = false
        
        const parsedSensors = parseSensorData(log.sensor_data)
        // Check for near-limit values if not critical
        if (!isCritical) {
            isWarning = parsedSensors.some((s: Record<string, unknown>) => Number(s.safe_max) && Number(s.value) >= (Number(s.safe_max) * 0.9))
        }

        return {
            ...log,
            parsedSensors,
            uiState: isCritical ? "CRITICAL" : isWarning ? "WARNING" : "NORMAL"
        } as ProcessedLog
    })
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return processedLogs.filter(log => {
        if (filterType === "ALL") return true;
        if (filterType === "NORMAL") return log.uiState === "NORMAL";
        if (filterType === "WARNING") return log.uiState === "WARNING"; // Strictly yellow warnings
        if (filterType === "CRITICAL") return log.uiState === "CRITICAL"; // Strictly red faults
        return true;
    })
  }, [processedLogs, filterType]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{t("data.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("data.subtitle")}</p>
        </div>
        <div className="flex gap-2 items-center bg-muted/50 p-1 rounded-lg border">
            <Button 
                variant={filterType === "ALL" ? "default" : "ghost"}
                size="sm"
                className="text-xs font-semibold h-8"
                onClick={() => setFilterType("ALL")}
            >
                {t("data.all")}
            </Button>
            <Button 
                variant={filterType === "NORMAL" ? "default" : "ghost"}
                size="sm"
                className={filterType === "NORMAL" ? "bg-green-600 hover:bg-green-700 text-white text-xs font-semibold h-8" : "text-green-600 dark:text-green-500 hover:text-green-600 text-xs font-semibold h-8 hover:bg-green-500/10"}
                onClick={() => setFilterType("NORMAL")}
            >
                {t("data.normal")}
            </Button>
            <Button 
                variant={filterType === "WARNING" ? "default" : "ghost"}
                size="sm"
                className={filterType === "WARNING" ? "bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold h-8" : "text-yellow-600 dark:text-yellow-500 hover:text-yellow-600 text-xs font-semibold h-8 hover:bg-yellow-500/10"}
                onClick={() => setFilterType("WARNING")}
            >
                {t("data.warnings")}
            </Button>
            <Button 
                variant={filterType === "CRITICAL" ? "default" : "ghost"}
                size="sm"
                className={filterType === "CRITICAL" ? "bg-destructive hover:bg-destructive/90 text-white text-xs font-semibold h-8" : "text-destructive hover:text-destructive text-xs font-semibold h-8 hover:bg-destructive/10"}
                onClick={() => setFilterType("CRITICAL")}
            >
                {t("data.critical")}
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button onClick={fetchLogs} variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                <RefreshCw className="h-4 w-4 text-primary" />
            </Button>
        </div>
      </div>

      <motion.div variants={item}>
      <Card className="shadow-md border-primary/5 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="pb-4 border-b bg-muted/10 mb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" /> {t("data.eventsHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">{t("data.datetime")}</TableHead>
                  <TableHead className="w-[200px]">{t("data.system")}</TableHead>
                  <TableHead className="w-[120px]">{t("data.state")}</TableHead>
                  <TableHead>{t("data.readings")}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      {t("data.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      {t("data.noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow 
                        key={log.id} 
                        onClick={() => setActiveLog(log)}
                        className={`cursor-pointer transition-colors ${
                            log.uiState === "CRITICAL" ? "bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20" : 
                            log.uiState === "WARNING"  ? "bg-yellow-50/50 dark:bg-yellow-900/10 hover:bg-yellow-100/50 dark:hover:bg-yellow-900/20" :
                            "hover:bg-muted/50"
                        }`}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp + 'Z').toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.system_name}</div>
                        <div className="text-xs text-muted-foreground">{log.system_id}</div>
                      </TableCell>
                      <TableCell>
                         <Badge 
                           variant={log.relay_state === "ON" ? "secondary" : log.relay_state === "TRIPPED" ? "destructive" : "outline"}
                           className="gap-1.5"
                         >
                            {log.relay_state === "ON" ? <CheckCircle className="h-3 w-3" /> :
                             log.relay_state === "TRIPPED" ? <AlertTriangle className="h-3 w-3" /> :
                             <Activity className="h-3 w-3" />}
                            {log.relay_state}
                         </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                              if (log.parsedSensors.length === 0) {
                                  return <span className="text-muted-foreground text-sm italic">{t("data.noSensors")}</span>;
                              }
                              return log.parsedSensors.map((sensor: Record<string, unknown>, idx: number) => {
                                  const isNearLimit = Number(sensor.safe_max) && Number(sensor.value) >= (Number(sensor.safe_max) * 0.9)
                                  return (
                                  <div key={idx} className={`flex items-center gap-1.5 text-sm bg-background/50 border rounded px-2 py-1 shadow-sm ${
                                      log.uiState !== "CRITICAL" && isNearLimit ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" : ""
                                  }`}>
                                      <span className={log.uiState !== "CRITICAL" && isNearLimit ? "font-bold" : "font-medium text-muted-foreground"}>{getSensorName(String(sensor.id))}:</span>
                                      <span className="font-mono">{typeof sensor.value === 'number' ? sensor.value.toFixed(2) : String(sensor.value)}</span>
                                      <span className="opacity-70 text-xs">{String(sensor.unit)}</span>
                                  </div>
                              )});
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="w-10">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* DETAILED LOG MODAL */}
      <AnimatePresence>
        {activeLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setActiveLog(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-card shadow-2xl"
            >
              {/* Header */}
              <div className={`p-6 border-b ${
                activeLog.uiState === "CRITICAL" ? "bg-red-500/10 border-red-500/20" :
                activeLog.uiState === "WARNING" ? "bg-yellow-500/10 border-yellow-500/20" :
                "bg-muted/30"
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{getSensorName(activeLog.system_id) || activeLog.system_name}</h2>
                    <p className="font-mono text-sm text-muted-foreground mt-1">
                      {new Date(activeLog.timestamp + 'Z').toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'long' })}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-foreground/10" onClick={() => setActiveLog(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-8">
                {/* State Overview */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-background border shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-medium mb-1">{t("data.physicalState")}</span>
                    <Badge 
                       variant={activeLog.relay_state === "ON" ? "secondary" : activeLog.relay_state === "TRIPPED" ? "destructive" : "outline"}
                       className="text-lg py-1 px-3 w-fit gap-2"
                     >
                        {activeLog.relay_state === "ON" ? <CheckCircle className="h-4 w-4" /> :
                         activeLog.relay_state === "TRIPPED" ? <AlertTriangle className="h-4 w-4" /> :
                         <Activity className="h-4 w-4" />}
                        {activeLog.relay_state}
                     </Badge>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground font-medium mb-1">{t("data.alertLevel")}</span>
                    <span className={`text-xl font-bold uppercase tracking-wider ${
                      activeLog.uiState === "CRITICAL" ? "text-destructive" :
                      activeLog.uiState === "WARNING" ? "text-yellow-600 dark:text-yellow-500" :
                      "text-green-600 dark:text-green-500"
                    }`}>
                      {activeLog.uiState}
                    </span>
                  </div>
                </div>

                {/* Sensors Detail */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 border-b pb-2">{t("data.sensorCapture")}</h3>
                  {activeLog.parsedSensors.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg bg-muted/10 text-muted-foreground">
                      {t("data.noSensorsDetail")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeLog.parsedSensors.map((sensor: Record<string, unknown>, idx: number) => {
                        const isNearLimit = Number(sensor.safe_max) && Number(sensor.value) >= (Number(sensor.safe_max) * 0.9);
                        const isExceeding = Number(sensor.safe_max) && Number(sensor.value) > Number(sensor.safe_max);
                        
                        return (
                          <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between ${
                              isExceeding || activeLog.uiState === "CRITICAL" ? "bg-red-500/5 border-red-500/20" :
                              isNearLimit ? "bg-yellow-500/5 border-yellow-500/20" :
                              "bg-background"
                          }`}>
                            <span className="text-sm font-semibold text-muted-foreground break-words">{getSensorName(String(sensor.id))}</span>
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className={`text-2xl font-mono ${
                                isExceeding || activeLog.uiState === "CRITICAL" ? "text-red-600 dark:text-red-400 font-bold" :
                                isNearLimit ? "text-yellow-600 dark:text-yellow-500 font-bold" :
                                "text-foreground font-bold"
                              }`}>
                                {typeof sensor.value === 'number' ? sensor.value.toFixed(2) : String(sensor.value)}
                              </span>
                              <span className="text-muted-foreground font-mono">{String(sensor.unit)}</span>
                            </div>
                            
                            {Boolean(sensor.safe_max) && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      isExceeding ? "bg-destructive w-full" :
                                      isNearLimit ? "bg-yellow-500" :
                                      "bg-primary"
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, (Number(sensor.value) / Number(sensor.safe_max)) * 100))}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono font-medium whitespace-nowrap">MAX: {String(sensor.safe_max)}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
