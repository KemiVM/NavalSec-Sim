import type { ReactNode } from "react"

export interface Sensor {
  name: ReactNode
  id: string
  type: string
  unit: string
  value: number
  safe_min: number | null
  safe_max: number | null
}

export interface Relay {
  id: string
  state: "ON" | "OFF" | "TRIPPED"
}

export interface NavalSystem {
  id: string
  name: string
  relay: Relay
  sensors: Sensor[]
}

export interface SystemLog {
  id: number
  timestamp: string
  system_id: string
  system_name: string
  relay_state: string
  sensor_data: string // JSON string
  is_abnormal: boolean
  is_attack?: boolean
  source_ip?: string
}

