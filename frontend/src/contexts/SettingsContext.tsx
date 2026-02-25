import { createContext, useContext, useEffect, useState } from "react"
import { SimulationService } from "@/services/api"

export type DashboardLayout = string[] // Array of system IDs

type SettingsState = {
  refreshInterval: number
  dashboardLayout: DashboardLayout
  simulationLayout: DashboardLayout
  hiddenSystems: string[]
  backendConfig: {
    valid_ips: string[]
    log_interval: number
    simulation_sleep: number
  }
  setRefreshInterval: (interval: number) => void
  setDashboardLayout: (layout: DashboardLayout) => void
  setSimulationLayout: (layout: DashboardLayout) => void
  moveSystem: (page: "dashboard" | "simulation", systemId: string, direction: "up" | "down") => void
  toggleSystemVisibility: (systemId: string) => void
  updateBackendConfig: (updates: Partial<SettingsState["backendConfig"]>) => Promise<void>
  refreshBackendConfig: () => Promise<void>
}

const SettingsContext = createContext<SettingsState | undefined>(undefined)

const STORAGE_KEY = "app-settings-v2"

const DEFAULT_LAYOUT = [
  "sys_main_engine", "sys_aux_gen", "sys_bilge_pump", "sys_radar", "sys_steering", "sys_fire"
]

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [refreshInterval, setRefreshInterval] = useState(2000)
  const [dashboardLayout, setDashboardLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT)
  const [simulationLayout, setSimulationLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT)
  const [hiddenSystems, setHiddenSystems] = useState<string[]>([])
  const [backendConfig, setBackendConfig] = useState<SettingsState["backendConfig"]>({
    valid_ips: [],
    log_interval: 20,
    simulation_sleep: 1.0
  })

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.refreshInterval) setRefreshInterval(parsed.refreshInterval)
        if (parsed.dashboardLayout) setDashboardLayout(parsed.dashboardLayout)
        if (parsed.simulationLayout) setSimulationLayout(parsed.simulationLayout)
        if (parsed.hiddenSystems) setHiddenSystems(parsed.hiddenSystems)
      } catch (e) {
        console.error("Failed to parse settings", e)
      }
    }
  }, [])

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      refreshInterval,
      dashboardLayout,
      simulationLayout,
      hiddenSystems
    }))
  }, [refreshInterval, dashboardLayout, simulationLayout, hiddenSystems])

  const refreshBackendConfig = async () => {
    try {
      const config = await SimulationService.getConfig()
      setBackendConfig(config)
    } catch (e) {
      console.error("Failed to fetch backend config", e)
    }
  }

  useEffect(() => {
    refreshBackendConfig()
  }, [])

  const updateBackendConfig = async (updates: Partial<SettingsState["backendConfig"]>) => {
    try {
      const newConfig = await SimulationService.updateConfig(updates)
      setBackendConfig(newConfig)
    } catch (e) {
      console.error("Failed to update backend config", e)
      throw e
    }
  }

  const toggleSystemVisibility = (systemId: string) => {
    setHiddenSystems(prev => 
      prev.includes(systemId) 
        ? prev.filter(id => id !== systemId) 
        : [...prev, systemId]
    )
  }

  const moveSystem = (page: "dashboard" | "simulation", systemId: string, direction: "up" | "down") => {
    const setLayout = page === "dashboard" ? setDashboardLayout : setSimulationLayout
    const currentLayout = page === "dashboard" ? dashboardLayout : simulationLayout

    const index = currentLayout.indexOf(systemId)
    if (index === -1) return

    const newLayout = [...currentLayout]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newLayout.length) return

    // Swap
    const temp = newLayout[index]
    newLayout[index] = newLayout[targetIndex]
    newLayout[targetIndex] = temp

    setLayout(newLayout)
  }

  return (
    <SettingsContext.Provider value={{
      refreshInterval,
      dashboardLayout,
      simulationLayout,
      hiddenSystems,
      backendConfig,
      setRefreshInterval,
      setDashboardLayout,
      setSimulationLayout,
      moveSystem,
      toggleSystemVisibility,
      updateBackendConfig,
      refreshBackendConfig
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error("useSettings must be used within SettingsProvider")
  return context
}
