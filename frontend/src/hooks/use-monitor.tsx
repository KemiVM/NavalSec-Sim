import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SimulationService, DataService } from '@/services/api'
import type { NavalSystem } from '@/types/api'
import { useNotifications } from '@/contexts/NotificationContext'
import { useLanguage } from '@/contexts/LanguageContext'

export function useSystemMonitor() {
  const systemsRef = useRef<Map<string, NavalSystem>>(new Map())
  const hasLoaded = useRef(false)
  const lastAttackId = useRef<number>(0)
  const lastAttackAlertTime = useRef<number>(0)
  const { addNotification } = useNotifications()
  const { t } = useLanguage()
  const navigate = useNavigate()

  useEffect(() => {
    const checkSystems = async () => {
      try {
        const [systems, recentLogs] = await Promise.all([
            SimulationService.getSystems(),
            DataService.getLogs(5, true)
        ]);

        // Check for attacks
        if (hasLoaded.current) {
            recentLogs.forEach(log => {
                if (log.is_attack && log.id > lastAttackId.current) {
                    const now = Date.now()
                    if (now - lastAttackAlertTime.current > 15000) {
                        addNotification({
                            title: `¡CIBERATAQUE DETECTADO!`,
                            description: `Intrusión en el sistema ${log.system_name}. Acción bloqueada o registrada desde la IP: ${log.source_ip || 'Desconocida'}.`,
                            type: 'error',
                            action: {
                                label: 'Ver Historial',
                                onClick: () => navigate('/historial')
                            }
                        })
                        lastAttackAlertTime.current = now
                    }
                    if (log.id > lastAttackId.current) {
                        lastAttackId.current = log.id;
                    }
                }
            })
        } else if (recentLogs.length > 0) {
            // Initialize lastAttackId strictly on load without alerting
            const maxId = Math.max(...recentLogs.map(l => l.id))
            lastAttackId.current = maxId
        }
        
        systems.forEach(system => {
          const prevSystem = systemsRef.current.get(system.id)
          
          if (!hasLoaded.current) {
             // Initial load - don't spam alerts
             systemsRef.current.set(system.id, system)
             return
          }

          // Relay State Changes
          if (prevSystem) {
            const prevState = prevSystem.relay.state
            const currState = system.relay.state

            // TRIPPED Alert (Critical)
            if (prevState !== 'TRIPPED' && currState === 'TRIPPED') {
              addNotification({
                title: `¡ALERTA CRÍTICA! Sistema ${system.name} ha fallado.`,
                description: `El relé ha saltado a estado TRIPPED via protección. Se iniciará recuperación en 5s.`,
                type: 'error',
                action: {
                  label: 'Ver Simulación',
                  onClick: () => navigate('/simulacion')
                }
              })
              
              // TRIPPED Auto-recovery logic
              setTimeout(async () => {
                  try {
                      await SimulationService.toggleRelay(system.id, 'ON')
                  } catch (err) {
                      console.error(`Error auto-recovering ${system.name}:`, err)
                  }
              }, 5000)
            }

            // Recovery Alert (Success)
            if (prevState === 'TRIPPED' && currState === 'ON') {
              addNotification({
                title: `Sistema ${system.name} Recuperado`,
                description: 'El sistema térmico/eléctrico ha vuelto a operar con normalidad tras su autorrecuperación.',
                type: 'success',
              })
            }
          }

          // Sensor Warnings (Near Limits)
          system.sensors.forEach(sensor => {
             if (sensor.safe_max) {
                const threshold = sensor.safe_max * 0.9
                const prevSensor = prevSystem?.sensors.find(s => s.id === sensor.id)
                
                // Only trigger if we just crossed the threshold
                if (sensor.value >= threshold && (!prevSensor || prevSensor.value < threshold)) {
                    if (sensor.value <= sensor.safe_max) { // Don't warn if already tripped (handled by relay)
                        const sensorTypeName = t(`sensor.${sensor.type}`) || sensor.type
                        addNotification({
                            title: `Advertencia: Sensor ${sensorTypeName}`,
                            description: `Valor ${sensor.value.toFixed(1)} ${sensor.unit} cercano al límite (${sensor.safe_max} ${sensor.unit}) en ${system.name}.`,
                            type: 'warning',
                            action: {
                                label: 'Ver Simulación',
                                onClick: () => navigate('/simulacion')
                            }
                        })
                    }
                }
             }
          })

          // Update ref
          systemsRef.current.set(system.id, system)
        })

        if (!hasLoaded.current && systems.length > 0) {
            hasLoaded.current = true
        }

      } catch (error) {
        console.error("Error monitoring systems:", error)
      }
    }

    // Poll every 2 seconds for alerts
    const interval = setInterval(checkSystems, 2000)
    return () => clearInterval(interval)
  }, [addNotification, navigate, t])
}
