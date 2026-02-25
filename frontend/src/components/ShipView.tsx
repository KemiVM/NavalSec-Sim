import { useNavigate } from "react-router-dom"
import type { NavalSystem } from "@/types/api"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { AlertTriangle, Info, Power } from "lucide-react"

interface SystemPosition {
  id: string
  x: number
  y: number
}

// Relative to image dimensions (percentages)
const systemPositions: Record<string, SystemPosition> = {
  "sys_main_engine": { id: "sys_main_engine", x: 30, y: 70 }, // Motor principal (popa/centro-abajo)
  "sys_aux_gen": { id: "sys_aux_gen", x: 45, y: 70 },         // Generador auxiliar
  "sys_bilge_pump": { id: "sys_bilge_pump", x: 60, y: 85 },     // Bomba de achique (fondo)
  "sys_radar": { id: "sys_radar", x: 65, y: 30 },             // Radar (superestructura/mástil)
  "sys_steering": { id: "sys_steering", x: 10, y: 75 },       // Sistema de gobierno (timón/extremo popa)
  "sys_fire": { id: "sys_fire", x: 70, y: 65 },               // Contraincendios
}

export function ShipView({ systems, className }: { systems: NavalSystem[], className?: string }) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <div className={cn("relative w-full rounded-xl bg-card/60 shadow-inner overflow-hidden border border-border/50", className)}>
      {/* Background Image of the Ship */}
      <img 
        src="/Barco Lateral (1).png" 
        alt="Plano Lateral Embarcación" 
        className="w-full h-auto object-contain block opacity-90"
        onClick={(e) => {
            if (import.meta.env.DEV) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                console.log(`Clicked coords: x: ${x.toFixed(1)}, y: ${y.toFixed(1)}`);
            }
        }}
      />

      {/* Interactive Overlay Nodes */}
      {systems.map((system) => {
        const pos = systemPositions[system.id]
        if (!pos) return null

        const isTripped = system.relay.state === "TRIPPED"
        const isOff = system.relay.state === "OFF"
        
        let colorClass = "bg-green-500 shadow-green-500/50"
        let pulseClass = "animate-ping duration-3000" // Slower ping for green dots
        if (isTripped) {
            colorClass = "bg-destructive shadow-destructive/100"
            pulseClass = "animate-ping duration-700" // Faster ping for red dots
        } else if (isOff) {
            colorClass = "bg-gray-400 shadow-gray-400/50"
            pulseClass = ""
        }

        return (
          <div 
            key={system.id}
            className="group absolute z-10"
            style={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)' 
            }}
          >
            {/* Node Indicator */}
            <button 
                onClick={() => navigate('/simulacion')}
                className={cn(
                    "relative flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full cursor-pointer hover:scale-125 transition-transform duration-300 shadow-xl border-2 border-white/80 dark:border-background/80",
                    colorClass
                )}
            >
                {(!isOff) && <span className={cn("absolute w-full h-full rounded-full opacity-75", colorClass, pulseClass)}></span>}
            </button>

            {/* Hover Tooltip (CSS only, using group-hover) */}
            <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-background/95 backdrop-blur-md text-foreground rounded-lg p-3 shadow-2xl border border-border/60 z-50 pointer-events-none">
              <div className="flex items-center justify-between mb-2">
                 <p className="text-sm font-semibold truncate pr-2">{system.name}</p>
                 <Power className={cn("w-4 h-4", isTripped ? "text-destructive" : isOff ? "text-gray-400" : "text-green-500")} />
              </div>
              <div className="space-y-1">
                {system.sensors.map(s => (
                  <div key={s.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{t(`sensor.${s.type}`) || s.type}</span>
                    <span className="font-mono">{s.value.toFixed(1)} {s.unit}</span>
                  </div>
                ))}
              </div>
              {isTripped && (
                  <div className="mt-2 pt-2 border-t border-destructive/20 text-destructive text-[10px] font-bold flex items-center gap-1 uppercase">
                      <AlertTriangle className="w-3 h-3" />
                      Sistema en fallo
                  </div>
              )}
            </div>
          </div>
        )
      })}

      <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-md border border-border/50">
          <Info className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Plano del Buque</span>
      </div>
    </div>
  )
}
